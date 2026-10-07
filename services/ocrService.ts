import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import { MEDICINES_DATABASE } from "@/constants/medicinesDatabase";
import * as FileSystem from "expo-file-system";
import * as Localization from "expo-localization";

export interface OCRResult {
  text: string;
  confidence: number;
  language?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface MedicineMatch {
  medicine: any;
  confidence: number;
  matchedFields: string[];
}

class OCRService {
  private supportedLanguages = ["en", "ar", "es", "fr", "de", "zh", "ja", "ko"];

  /**
   * Get device language or fallback to English
   */
  private getDeviceLanguage(): string {
    const locale = Localization.getLocales()[0];
    const languageCode = locale.languageCode || "en";
    return this.supportedLanguages.includes(languageCode) ? languageCode : "en";
  }

  /**
   * Process an image to extract text using basic image processing
   * Note: This is a simplified OCR implementation. For production, consider using
   * a proper OCR service like Google Vision API or Tesseract.js
   */
  async extractTextFromImage(
    imageUri: string,
    targetLanguage?: string,
  ): Promise<OCRResult[]> {
    try {
      // Preprocess the image for better text extraction
      const processedImage = await manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024, height: 1024 } }, // Resize for consistency
          { flip: FlipType.Vertical }, // Flip for better text orientation
        ],
        {
          compress: 0.8,
          format: SaveFormat.JPEG,
          base64: true,
        },
      );

      // For now, return a mock result since we don't have a full OCR engine
      // In production, you would send the base64 image to an OCR service
      const mockResults = await this.mockOCRProcessing(
        processedImage.base64 || "",
        targetLanguage || this.getDeviceLanguage(),
      );

      return mockResults;
    } catch (error) {
      console.error("OCR processing failed:", error);
      throw new Error("Failed to extract text from image");
    }
  }

  /**
   * Mock OCR processing - simulates text extraction in multiple languages
   * Replace this with actual OCR service integration
   */
  private async mockOCRProcessing(
    base64Image: string,
    language: string,
  ): Promise<OCRResult[]> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock extracted text based on language
    const mockTexts = this.getMockTextsByLanguage(language);

    return mockTexts.map((item, index) => ({
      ...item,
      language,
      boundingBox: {
        x: 50 + index * 100,
        y: 100 + index * 30,
        width: 80,
        height: 20,
      },
    }));
  }

  /**
   * Get mock text data based on language
   */
  private getMockTextsByLanguage(
    language: string,
  ): Array<{ text: string; confidence: number }> {
    const textDatabase = {
      en: [
        { text: "PARACETAMOL", confidence: 0.95 },
        { text: "500mg", confidence: 0.88 },
        { text: "TABLETS", confidence: 0.92 },
        { text: "Panadol", confidence: 0.85 },
        { text: "Take 1 tablet every 4 hours", confidence: 0.78 },
      ],
      ar: [
        { text: "باراسيتامول", confidence: 0.95 },
        { text: "500 مجم", confidence: 0.88 },
        { text: "أقراص", confidence: 0.92 },
        { text: "بانادول", confidence: 0.85 },
        { text: "خذ قرص واحد كل 4 ساعات", confidence: 0.78 },
      ],
      es: [
        { text: "PARACETAMOL", confidence: 0.95 },
        { text: "500mg", confidence: 0.88 },
        { text: "COMPRIMIDOS", confidence: 0.92 },
        { text: "Tomar 1 comprimido cada 4 horas", confidence: 0.78 },
      ],
      fr: [
        { text: "PARACÉTAMOL", confidence: 0.95 },
        { text: "500mg", confidence: 0.88 },
        { text: "COMPRIMÉS", confidence: 0.92 },
        { text: "Prendre 1 comprimé toutes les 4 heures", confidence: 0.78 },
      ],
    };

    return (
      textDatabase[language as keyof typeof textDatabase] || textDatabase.en
    );
  }

  /**
   * Translate text if needed (mock implementation)
   * In production, integrate with Google Translate API or similar
   */
  private async translateText(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<string> {
    // Mock translation - in production, use actual translation service
    if (fromLang === toLang) return text;

    const translations: Record<string, Record<string, string>> = {
      "ar->en": {
        باراسيتامول: "PARACETAMOL",
        مجم: "mg",
        أقراص: "TABLETS",
        بانادول: "Panadol",
      },
      "en->ar": {
        PARACETAMOL: "باراسيتامول",
        mg: "مجم",
        TABLETS: "أقراص",
        Panadol: "بانادول",
      },
    };

    const key = `${fromLang}->${toLang}`;
    const translationMap = translations[key];
    return translationMap?.[text] || text;
  }

  /**
   * Match extracted text against medicine database with multilingual support
   */
  async matchMedicines(extractedTexts: OCRResult[]): Promise<MedicineMatch[]> {
    const medicines = MEDICINES_DATABASE || [];
    const matches: MedicineMatch[] = [];

    // Combine all extracted text for better matching
    const combinedText = extractedTexts
      .map((t) => t.text)
      .join(" ")
      .toLowerCase();

    for (const medicine of medicines) {
      let confidence = 0;
      const matchedFields: string[] = [];

      // Check medicine name (including multilingual variations)
      const nameVariations = [
        medicine.name.toLowerCase(),
        medicine.genericName?.toLowerCase(),
        medicine.tradeName?.toLowerCase(),
      ].filter(Boolean);

      for (const variation of nameVariations) {
        if (
          combinedText.includes(variation) ||
          variation.includes(combinedText)
        ) {
          confidence += 0.4;
          matchedFields.push("name");
          break;
        }
      }

      // Check strength
      if (
        medicine.strength &&
        combinedText.includes(medicine.strength.toLowerCase())
      ) {
        confidence += 0.1;
        matchedFields.push("strength");
      }

      // Check dosage form
      if (
        medicine.dosageForm &&
        combinedText.includes(medicine.dosageForm.toLowerCase())
      ) {
        confidence += 0.1;
        matchedFields.push("dosageForm");
      }

      if (confidence > 0.3) {
        matches.push({
          medicine,
          confidence: Math.min(confidence, 1.0),
          matchedFields,
        });
      }
    }

    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  }

  /**
   * Extract medicine information from image with language support
   */
  async extractMedicineInfo(
    imageUri: string,
    targetLanguage?: string,
  ): Promise<{
    matches: MedicineMatch[];
    extractedTexts: OCRResult[];
    detectedLanguage: string;
  }> {
    const language = targetLanguage || this.getDeviceLanguage();
    const extractedTexts = await this.extractTextFromImage(imageUri, language);
    const matches = await this.matchMedicines(extractedTexts);

    return {
      matches,
      extractedTexts,
      detectedLanguage: language,
    };
  }
}

export const ocrService = new OCRService();
