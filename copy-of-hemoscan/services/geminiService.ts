
import { GoogleGenAI, Type } from "@google/genai";
import { PatientRecord, AnemiaType, RiskLevel, ScreeningResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAnemiaRisk = async (record: PatientRecord): Promise<ScreeningResult> => {
  const prompt = `Analyze the following CBC (Complete Blood Count) parameters for anemia risk assessment. 
  Patient Gender: ${record.gender}
  Hemoglobin (Hb): ${record.hemoglobin} g/dL
  MCV: ${record.mcv} fL
  MCH: ${record.mch} pg
  MCHC: ${record.mchc} g/dL
  
  Provide a professional clinical classification and summary.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          classification: { 
            type: Type.STRING, 
            description: "Anemia classification from common types (Iron Deficiency, Vitamin Deficiency, Aplastic, etc.)" 
          },
          confidenceScore: { type: Type.NUMBER, description: "Confidence level between 0 and 1" },
          riskLevel: { type: Type.STRING, description: "Risk level: Low, Moderate, High, or Critical" },
          analysisSummary: { type: Type.STRING, description: "A detailed but concise clinical summary and recommended next steps." }
        },
        required: ["classification", "confidenceScore", "riskLevel", "analysisSummary"]
      }
    }
  });

  const result = JSON.parse(response.text);
  
  return {
    classification: result.classification as AnemiaType,
    confidenceScore: result.confidenceScore,
    riskLevel: result.riskLevel as RiskLevel,
    analysisSummary: result.analysisSummary
  };
};

export const parseLabReport = async (base64Image: string): Promise<Partial<PatientRecord>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Extract clinical lab values from this blood report: Hemoglobin, MCV, MCH, and MCHC. If gender is specified, extract it." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hemoglobin: { type: Type.NUMBER },
          mcv: { type: Type.NUMBER },
          mch: { type: Type.NUMBER },
          mchc: { type: Type.NUMBER },
          gender: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text);
};
