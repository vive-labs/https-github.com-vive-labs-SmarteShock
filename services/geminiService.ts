
import { GoogleGenAI, Type } from "@google/genai";
import { AiAnalysisResult, TradeType, UrgencyLevel } from "../types";

const parseJson = (text: string) => {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            return JSON.parse(text.substring(start, end + 1));
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return null;
    }
}

export const analyzeIssue = async (
  description: string,
  base64Image?: string
): Promise<AiAnalysisResult | null> => {
  try {
    // Fix: Always initialize GoogleGenAI with named parameters as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fix: Removed non-existent 'Schema' import and simplified schema object
    const schema = {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          enum: [
            TradeType.PLUMBING,
            TradeType.ELECTRICAL,
            TradeType.HVAC,
            TradeType.PAINTING,
            TradeType.GENERAL,
            TradeType.OTHER
          ],
          description: "The type of tradesperson required based on the issue.",
        },
        urgency: {
            type: Type.STRING,
            enum: [UrgencyLevel.LOW, UrgencyLevel.NORMAL, UrgencyLevel.HIGH, UrgencyLevel.EMERGENCY],
            description: "The urgency level. Water leaks, gas, or power outages are EMERGENCY."
        },
        estimatedPriceRange: {
            type: Type.STRING,
            description: "A realistic price range estimation (e.g. '$100 - $200') for this specific task."
        },
        summary: {
            type: Type.STRING,
            description: "A professional, concise summary of the issue for a contractor."
        }
      },
      required: ["category", "urgency", "estimatedPriceRange", "summary"]
    };

    const parts: any[] = [{ text: `Analyze this home maintenance issue description: "${description}". Categorize it, determine urgency, and estimate price.` }];

    if (base64Image) {
        // Strip prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = base64Image.split(',')[1] || base64Image;
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
            }
        });
    }

    // Fix: Using correct model name 'gemini-3-flash-preview' as per task type guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    // Fix: Access response.text as a property, not a method, as per SDK guidelines
    const result = parseJson(response.text || "{}");
    
    if (!result) throw new Error("Failed to parse AI response");

    return result as AiAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback for demo purposes if API fails or key is missing
    return {
        category: TradeType.GENERAL,
        urgency: UrgencyLevel.NORMAL,
        estimatedPriceRange: "$100 - $300 (Est. Unavailable)",
        summary: description
    };
  }
};
