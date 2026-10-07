import AsyncStorage from "@react-native-async-storage/async-storage";
import { getGenericName } from "@/utils/medicineNormalization";

const FDA_API_BASE = "https://api.fda.gov/drug";
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_DELAY = 250;

let lastRequestTime = 0;

interface FDADrugLabel {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    route?: string[];
  };
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  warnings?: string[];
  adverse_reactions?: string[];
  drug_interactions?: string[];
}

interface FDAResponse {
  results?: FDADrugLabel[];
}

export interface DrugInteraction {
  description: string;
  severity: "high" | "moderate" | "low";
  source: "fda" | "local";
}

export interface DrugInfo {
  genericName: string;
  brandNames: string[];
  dosageInfo: string[];
  warnings: string[];
  interactions: DrugInteraction[];
}

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest),
    );
  }

  lastRequestTime = Date.now();
  return fetch(url);
}

async function getCachedData(key: string): Promise<any | null> {
  try {
    const cached = await AsyncStorage.getItem(`fda_cache_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(`fda_cache_${key}`);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

async function setCachedData(key: string, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `fda_cache_${key}`,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch (error) {
    console.warn("Failed to cache FDA data:", error);
  }
}

export async function searchDrugByName(
  medicineName: string,
): Promise<DrugInfo | null> {
  const genericName = getGenericName(medicineName);
  const cacheKey = genericName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const cached = await getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const searchTerm = encodeURIComponent(genericName);
    const url = `${FDA_API_BASE}/label.json?search=openfda.generic_name:"${searchTerm}"+OR+openfda.brand_name:"${searchTerm}"&limit=1`;

    const response = await rateLimitedFetch(url);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`FDA API error: ${response.status}`);
    }

    const data: FDAResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    const drugInfo: DrugInfo = {
      genericName: result.openfda?.generic_name?.[0] || genericName,
      brandNames: result.openfda?.brand_name || [],
      dosageInfo: result.dosage_and_administration || [],
      warnings: [
        ...(result.warnings || []),
        ...(result.adverse_reactions || []),
      ],
      interactions: (result.drug_interactions || []).map((desc) => ({
        description: desc,
        severity: determineSeverity(desc),
        source: "fda" as const,
      })),
    };

    await setCachedData(cacheKey, drugInfo);
    return drugInfo;
  } catch (error) {
    console.error("FDA API error:", error);
    return null;
  }
}

function determineSeverity(description: string): "high" | "moderate" | "low" {
  const lowerDesc = description.toLowerCase();

  if (
    lowerDesc.includes("contraindicated") ||
    lowerDesc.includes("serious") ||
    lowerDesc.includes("severe") ||
    lowerDesc.includes("fatal") ||
    lowerDesc.includes("death")
  ) {
    return "high";
  }

  if (
    lowerDesc.includes("caution") ||
    lowerDesc.includes("monitor") ||
    lowerDesc.includes("adjust")
  ) {
    return "moderate";
  }

  return "low";
}

export async function checkDrugInteractions(
  medicine1: string,
  medicine2: string,
): Promise<DrugInteraction[]> {
  const interactions: DrugInteraction[] = [];

  const [drug1Info, drug2Info] = await Promise.all([
    searchDrugByName(medicine1),
    searchDrugByName(medicine2),
  ]);

  const generic1 = getGenericName(medicine1).toLowerCase();
  const generic2 = getGenericName(medicine2).toLowerCase();

  if (drug1Info?.interactions) {
    drug1Info.interactions.forEach((interaction) => {
      const desc = interaction.description.toLowerCase();
      if (
        desc.includes(generic2) ||
        desc.includes(medicine2.toLowerCase()) ||
        (drug2Info &&
          drug2Info.brandNames.some((brand) =>
            desc.includes(brand.toLowerCase()),
          ))
      ) {
        interactions.push(interaction);
      }
    });
  }

  if (drug2Info?.interactions) {
    drug2Info.interactions.forEach((interaction) => {
      const desc = interaction.description.toLowerCase();
      if (
        desc.includes(generic1) ||
        desc.includes(medicine1.toLowerCase()) ||
        (drug1Info &&
          drug1Info.brandNames.some((brand) =>
            desc.includes(brand.toLowerCase()),
          ))
      ) {
        const isDuplicate = interactions.some(
          (existing) => existing.description === interaction.description,
        );
        if (!isDuplicate) {
          interactions.push(interaction);
        }
      }
    });
  }

  return interactions;
}

export async function getDosageInfo(medicineName: string): Promise<string[]> {
  const drugInfo = await searchDrugByName(medicineName);
  return drugInfo?.dosageInfo || [];
}

export async function getWarnings(medicineName: string): Promise<string[]> {
  const drugInfo = await searchDrugByName(medicineName);
  return drugInfo?.warnings || [];
}
