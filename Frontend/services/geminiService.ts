
import { GoogleGenAI } from "@google/genai";
import { DrugAnalysis, SystemSettings } from "../types";

export const getClinicalExplanation = async (analysis: DrugAnalysis, settings: SystemSettings): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const detailInstruction = {
    'Concise': 'Provide a very brief summary, focusing only on the primary risk and the core recommendation.',
    'Standard': 'Provide a balanced explanation including the interaction summary, clinical implications, and actionable recommendations.',
    'Exhaustive': 'Provide a deep clinical dive including biochemical pathways, specific CPIC guideline references, and multi-step management strategies.'
  }[settings.aiNarrativeDetail];

  const prompt = `
    You are a professional clinical pharmacogeneticist. 
    Explain the following pharmacogenomic risk to a physician:
    Drug: ${analysis.drug}
    Risk Level: ${analysis.risk}
    Genes Involved: ${analysis.geneProfiles.map(g => `${g.gene} (${g.diplotype}) - ${g.phenotype}`).join(', ')}
    
    Detail Level Preference: ${settings.aiNarrativeDetail}
    Instruction: ${detailInstruction}
    
    Please provide:
    1. A clear summary of the interaction.
    2. Clinical implications.
    3. Actionable dosage or alternative drug recommendations based on CPIC or DPWG guidelines.
    Keep the tone professional and trustworthy.
  `;

  try {
    // Using gemini-3-pro-preview for complex clinical reasoning tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "No explanation generated.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error generating clinical explanation. Please refer to manual CPIC guidelines.";
  }
};
