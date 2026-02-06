
import { GoogleGenAI, Type } from "@google/genai";
import { PatientRecord, AnemiaType, RiskLevel, ScreeningResult } from "../types";
import { predictAnemiaWithML, trainRidgeClassifier, isMLModelReady } from "./mlService";

// Initialize AI client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
console.log('🔑 Gemini API Key Status:', {
  exists: !!apiKey,
  length: apiKey?.length || 0,
  prefix: apiKey?.substring(0, 10) || 'missing',
  isPlaceholder: apiKey === 'your_api_key_here'
});

if (!apiKey || apiKey === 'your_api_key_here') {
  console.warn('⚠️ Gemini API key not configured. AI features will not work.');
}
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

/**
 * Hybrid Analysis: Combines ML Ridge Classifier + Gemini AI for maximum accuracy
 */
export const analyzeAnemiaRisk = async (record: PatientRecord): Promise<ScreeningResult> => {
  console.log('🧬 Starting Hybrid ML + AI Analysis...');
  
  // Step 1: ML Prediction (Fast, reliable baseline)
  const genderCode = record.gender.toLowerCase() === 'female' ? 0 : 1;
  const mlResult = await predictAnemiaWithML(
    genderCode,
    record.hemoglobin,
    record.mcv,
    record.mch,
    record.mchc
  );
  
  console.log('📊 ML Analysis Complete:', mlResult);
  
  // Step 2: AI Analysis (Deep clinical reasoning) - only if API available
  let aiAnalysis: any = null;
  let useAIAnalysis = false;
  
  if (apiKey && apiKey !== 'your_api_key_here' && apiKey !== 'dummy-key') {
    try {
      console.log('🤖 Running Gemini AI Analysis...');
      
      const prompt = `Perform a comprehensive hematology risk assessment for the following patient profile:
  - Gender: ${record.gender}
  - Age: ${record.age}
  - Hemoglobin (Hb): ${record.hemoglobin} g/dL
  - MCV (Mean Corpuscular Volume): ${record.mcv} fL
  - MCH (Mean Corpuscular Hemoglobin): ${record.mch} pg
  - MCHC (MCH Concentration): ${record.mchc} g/dL
  
  Our ML model predicts: ${mlResult.prediction === 1 ? 'ANEMIC' : 'NORMAL'} (confidence: ${(mlResult.confidence * 100).toFixed(1)}%)
  
  Evaluate the relationship between these primary red cell indices. 
  Classify the anemia type (if present) and provide a professional clinical summary that considers both the ML prediction and the blood values.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a Senior Hematopathology Consultant working with ML predictions. Analyze blood lab data and provide precise clinical classifications based on WHO guidelines. Consider the ML prediction but rely on your medical expertise for final classification.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              classification: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING },
              analysisSummary: { type: Type.STRING }
            },
            required: ["classification", "confidenceScore", "riskLevel", "analysisSummary"]
          }
        }
      });

      aiAnalysis = JSON.parse(response.text || '{}');
      useAIAnalysis = true;
      console.log('✅ AI Analysis Complete');
      
    } catch (e: any) {
      console.warn('⚠️ AI Analysis unavailable (quota/API issue), using ML-only mode:', e.message);
      useAIAnalysis = false;
    }
  } else {
    console.log('⚠️ No Gemini API key, using ML-only analysis');
  }
  
  // Step 3: Combine Results (ML + AI = Best accuracy)
  if (useAIAnalysis && aiAnalysis) {
    // Hybrid mode: Use AI classification with ML-boosted confidence
    const combinedConfidence = (aiAnalysis.confidenceScore + mlResult.confidence) / 2;
    
    return {
      classification: aiAnalysis.classification as AnemiaType,
      confidenceScore: combinedConfidence,
      riskLevel: aiAnalysis.riskLevel as RiskLevel,
      analysisSummary: `🤖 Hybrid Analysis (ML + AI):\n\nML Prediction: ${mlResult.prediction === 1 ? 'Anemic' : 'Normal'} (${(mlResult.confidence * 100).toFixed(1)}% confidence)\n\n${aiAnalysis.analysisSummary}\n\n✨ Combined Accuracy Score: ${(combinedConfidence * 100).toFixed(1)}%`
    };
  } else {
    // ML-only mode: Use rule-based classification
    const classification = determineClassificationFromML(record, mlResult);
    const summary = generateMLOnlySummary(record, mlResult, classification);
    
    return {
      classification,
      confidenceScore: mlResult.confidence,
      riskLevel: mlResult.riskLevel as RiskLevel,
      analysisSummary: summary
    };
  }
};

/**
 * Rule-based classification when AI is unavailable
 */
function determineClassificationFromML(record: PatientRecord, mlResult: any): AnemiaType {
  if (mlResult.prediction === 0) {
    return "Normal - No Anemia Detected";
  }
  
  // MCV-based classification (standard hematology rules)
  if (record.mcv < 80) return "Microcytic Anemia (Iron Deficiency Likely)";
  if (record.mcv > 100) return "Macrocytic Anemia (B12/Folate Deficiency)";
  return "Normocytic Anemia";
}

/**
 * Generate summary for ML-only analysis
 */
function generateMLOnlySummary(record: PatientRecord, mlResult: any, classification: string): string {
  const hbNormal = record.gender.toLowerCase() === 'female' 
    ? record.hemoglobin >= 12 
    : record.hemoglobin >= 13;
  
  return `🤖 ML-Powered Analysis (Ridge Classifier):

Prediction: ${mlResult.prediction === 1 ? 'ANEMIC' : 'NORMAL'}
Confidence: ${(mlResult.confidence * 100).toFixed(1)}%
Risk Level: ${mlResult.riskLevel}

Blood Values:
• Hemoglobin: ${record.hemoglobin} g/dL ${!hbNormal ? '⚠️ LOW' : '✅'}
• MCV: ${record.mcv} fL
• MCH: ${record.mch} pg
• MCHC: ${record.mchc} g/dL

Classification: ${classification}

📊 This analysis used our trained ML model (500 patient dataset) with Ridge Classifier algorithm for accurate anemia detection.

${mlResult.prediction === 1 ? '⚠️ Recommendation: Consult a healthcare provider for comprehensive evaluation and treatment plan.' : '✅ Blood values appear within normal ranges based on ML analysis.'}`;
};

/**
 * Parses medical lab report images or PDFs into structured biometric data.
 * Accepts any supported MIME type (image/jpeg, image/png, application/pdf).
 */
export const parseLabReport = async (base64Data: string, mimeType: string): Promise<Partial<PatientRecord>> => {
  console.log('📄 parseLabReport called:', { 
    mimeType, 
    dataLength: base64Data?.length,
    apiKeyConfigured: !!apiKey && apiKey !== 'your_api_key_here' && apiKey !== 'dummy-key'
  });

  if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'dummy-key') {
    const error = 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to .env.local and restart the dev server.';
    console.error('❌', error);
    throw new Error(error);
  }

  console.log('🚀 Sending request to Gemini API...');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: "Act as a Medical Clinical Data Specialist. Extract the following from this lab report:\n1. Hemoglobin (Hb) in g/dL\n2. MCV (Mean Corpuscular Volume) in fL\n3. MCH (Mean Corpuscular Hemoglobin) in pg\n4. MCHC (Mean Corpuscular Hemoglobin Concentration) in g/dL\n5. Patient's Name\n6. Age (years)\n7. Gender (M/F/Male/Female)\n8. Test Date or Report Date (format: YYYY-MM-DD)\n\nIMPORTANT: Ensure MCHC is between 28-38 g/dL (normal range). If outside this range or missing, calculate it as: MCHC = (Hb / Hematocrit) × 100, or estimate as 33 if data unavailable.\n\nOutput strictly in JSON format." }
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
            gender: { type: Type.STRING },
            age: { type: Type.NUMBER },
            name: { type: Type.STRING },
            testDate: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    
    // Validate and sanitize values to meet database constraints
    const sanitized = {
      name: parsed.name || 'Unknown Patient',
      age: Math.max(1, Math.min(149, parsed.age || 30)),
      gender: (parsed.gender || 'M').charAt(0).toUpperCase(), // M, F, or O
      hemoglobin: Math.max(0, Math.min(30, parsed.hemoglobin || 12)),
      mcv: Math.max(0, Math.min(200, parsed.mcv || 90)),
      mch: Math.max(0, Math.min(100, parsed.mch || 30)),
      mchc: Math.max(28, Math.min(38, parsed.mchc || 33)), // Force MCHC into valid range
      testDate: parsed.testDate || new Date().toISOString().split('T')[0]
    };
    
    console.log('✅ Successfully parsed and sanitized lab report:', sanitized);
    return sanitized;
  } catch (e: any) {
    console.error("❌ OCR Data Parsing Error:", e);
    if (e.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your configuration.');
    }
    throw new Error('Failed to extract data from report. Please try a clearer image.');
    return {};
  }
};
