import { MEDICINE_TRADE_NAMES, MedicineMapping } from '@/constants/medicineDatabase';

let medicineMap: Map<string, string> | null = null;
let reverseMap: Map<string, string[]> | null = null;

function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function initializeMaps() {
  if (medicineMap) return;
  
  medicineMap = new Map();
  reverseMap = new Map();
  
  MEDICINE_TRADE_NAMES.forEach(({ tradeName, genericName }) => {
    const normalizedTrade = normalizeName(tradeName);
    const normalizedGeneric = normalizeName(genericName);
    
    medicineMap!.set(normalizedTrade, genericName);
    medicineMap!.set(normalizedGeneric, genericName);
    
    if (!reverseMap!.has(normalizedGeneric)) {
      reverseMap!.set(normalizedGeneric, []);
    }
    reverseMap!.get(normalizedGeneric)!.push(tradeName);
  });
}

export function getGenericName(medicineName: string): string {
  initializeMaps();
  const normalized = normalizeName(medicineName);
  return medicineMap!.get(normalized) || medicineName;
}

export function getTradeNames(genericName: string): string[] {
  initializeMaps();
  const normalized = normalizeName(genericName);
  return reverseMap!.get(normalized) || [];
}

export function normalizeForComparison(name1: string, name2: string): boolean {
  const generic1 = getGenericName(name1);
  const generic2 = getGenericName(name2);
  return normalizeName(generic1) === normalizeName(generic2);
}

export function getAllVariants(medicineName: string): string[] {
  const generic = getGenericName(medicineName);
  const trades = getTradeNames(generic);
  return [generic, ...trades];
}