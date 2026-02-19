/**
 * llmExplanationService.js
 * Calls Groq API (llama-3.3-70b-versatile) to generate a clinical pharmacogenomic explanation.
 *
 * Input:  drug, riskLevel, genes[], diplotypes{}, phenotypes{}
 * Output: explanation string
 */

const Groq = require("groq-sdk");

const PHENOTYPE_LABELS = {
  "Poor Metabolizer":         "PM (Poor Metabolizer)",
  "Intermediate Metabolizer": "IM (Intermediate Metabolizer)",
  "Normal Metabolizer":       "NM (Normal Metabolizer)",
  "Rapid Metabolizer":        "RM (Rapid Metabolizer)",
  "Ultra-Rapid Metabolizer":  "URM (Ultra-Rapid Metabolizer)",
  "Unknown":                  "Unknown",
};

const DRUG_GENE_MAP = {
  CODEINE:      "CYP2D6",
  WARFARIN:     "CYP2C9",
  CLOPIDOGREL:  "CYP2C19",
  SIMVASTATIN:  "SLCO1B1",
  AZATHIOPRINE: "TPMT",
  FLUOROURACIL: "DPYD",
};

async function generateExplanation(drug, riskLevel, genes, diplotypes, phenotypes) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return generateFallbackExplanation(drug, riskLevel, genes, diplotypes, phenotypes);
  }

  try {
    const client = new Groq({ apiKey });

    const primaryGene = DRUG_GENE_MAP[drug.toUpperCase()] || (genes[0] || "Unknown");
    const diplotype = diplotypes[primaryGene] || "N/A";
    const phenotype = phenotypes[primaryGene] || "Unknown";
    const phenotypeLabel = PHENOTYPE_LABELS[phenotype] || phenotype;

    const genoSummary = genes.map(g =>
      `${g}: diplotype ${diplotypes[g] || "N/A"}, phenotype ${phenotypes[g] || "Unknown"}`
    ).join("; ") || "No pharmacogenomic variants detected";

    const prompt = `You are a clinical pharmacogenomics expert. Generate a concise, clinically accurate explanation for the following patient case.

DRUG: ${drug}
PRIMARY GENE: ${primaryGene}
DIPLOTYPE: ${diplotype}
PHENOTYPE: ${phenotypeLabel}
RISK LEVEL: ${riskLevel}
ALL DETECTED GENES: ${genoSummary}

Write a 3-4 sentence clinical explanation that:
1. Explains why the patient has this risk level based on their specific genetic variants
2. Describes the biological mechanism (enzyme activity, drug metabolism impact)
3. States the clinical consequence for this specific drug
4. Is written for a healthcare provider audience

Be specific, mention the gene and alleles. Do not use bullet points. Write in clear medical prose.`;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 350,
      temperature: 0.3,
    });

    return response.choices?.[0]?.message?.content?.trim() || generateFallbackExplanation(drug, riskLevel, genes, diplotypes, phenotypes);
  } catch (err) {
    console.error("Groq API error:", err.message);
    return generateFallbackExplanation(drug, riskLevel, genes, diplotypes, phenotypes);
  }
}

function generateFallbackExplanation(drug, riskLevel, genes, diplotypes, phenotypes) {
  const primaryGene = DRUG_GENE_MAP[drug.toUpperCase()] || (genes[0] || "Unknown");
  const diplotype = diplotypes[primaryGene] || "N/A";
  const phenotype = phenotypes[primaryGene] || "Normal Metabolizer";

  const riskText = {
    HIGH: "high-risk scenario requiring alternative therapy or significant dose modification",
    MODERATE: "moderate-risk scenario requiring dose adjustment and enhanced monitoring",
    LOW: "low-risk scenario where standard dosing protocols are appropriate",
  }[riskLevel] || "risk scenario requiring clinical evaluation";

  const mechanismMap = {
    CYP2D6:  "CYP2D6 enzymatic activity for opioid and antidepressant metabolism",
    CYP2C19: "CYP2C19-mediated bioactivation of prodrug compounds",
    CYP2C9:  "CYP2C9 hepatic clearance of anticoagulant substrates",
    SLCO1B1: "SLCO1B1 transporter-mediated hepatic uptake of statin compounds",
    TPMT:    "TPMT-mediated inactivation of thiopurine cytotoxic metabolites",
    DPYD:    "DPD enzyme catabolism of fluoropyrimidine compounds",
  };

  const mechanism = mechanismMap[primaryGene] || "drug metabolizing enzyme activity";

  return `This patient's ${primaryGene} diplotype (${diplotype}) results in a ${phenotype} classification, indicating altered ${mechanism}. ` +
    `This represents a ${riskText} when prescribing ${drug}. ` +
    `The identified genetic variant(s) directly impact ${drug} pharmacokinetics, potentially leading to ${riskLevel === "HIGH" ? "therapeutic failure or adverse drug reactions" : riskLevel === "MODERATE" ? "suboptimal drug exposure requiring dose individualization" : "predictable drug response within expected therapeutic ranges"}. ` +
    `Clinical decision-making should incorporate this pharmacogenomic profile in accordance with current CPIC guidelines.`;
}

module.exports = generateExplanation;
