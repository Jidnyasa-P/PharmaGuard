/**
 * drugRiskService.js
 * Maps gene phenotypes → drug-specific risk level using CPIC guidelines.
 *
 * Input:  phenotypes { GENE: "phenotype string" }, drug (string)
 * Output: "HIGH" | "MODERATE" | "LOW"
 *
 * References: CPIC Guidelines https://cpicpgx.org/guidelines/
 */

// Risk matrix: drug → gene → phenotype → risk
const RISK_MATRIX = {
  CODEINE: {
    gene: "CYP2D6",
    rules: [
      { phenotype: "Ultra-Rapid Metabolizer", risk: "HIGH" },    // toxicity (excess morphine)
      { phenotype: "Poor Metabolizer",         risk: "HIGH" },    // no analgesia + alternatives needed
      { phenotype: "Intermediate Metabolizer", risk: "MODERATE" },
      { phenotype: "Normal Metabolizer",       risk: "LOW" },
      { phenotype: "Rapid Metabolizer",        risk: "MODERATE" },
    ],
  },
  WARFARIN: {
    gene: "CYP2C9",
    rules: [
      { phenotype: "Poor Metabolizer",         risk: "HIGH" },    // major bleeding risk
      { phenotype: "Intermediate Metabolizer", risk: "MODERATE" }, // reduced dose needed
      { phenotype: "Normal Metabolizer",       risk: "LOW" },
    ],
    // Secondary gene check
    secondaryGene: "CYP2C19",
  },
  CLOPIDOGREL: {
    gene: "CYP2C19",
    rules: [
      { phenotype: "Poor Metabolizer",         risk: "HIGH" },    // no active metabolite → no antiplatelet effect
      { phenotype: "Intermediate Metabolizer", risk: "MODERATE" },
      { phenotype: "Normal Metabolizer",       risk: "LOW" },
      { phenotype: "Ultra-Rapid Metabolizer",  risk: "LOW" },
      { phenotype: "Rapid Metabolizer",        risk: "LOW" },
    ],
  },
  SIMVASTATIN: {
    gene: "SLCO1B1",
    rules: [
      { phenotype: "Poor Metabolizer",         risk: "HIGH" },    // high myopathy risk
      { phenotype: "Intermediate Metabolizer", risk: "MODERATE" }, // elevated myopathy risk
      { phenotype: "Normal Metabolizer",       risk: "LOW" },
    ],
  },
  AZATHIOPRINE: {
    gene: "TPMT",
    rules: [
      { phenotype: "Poor Metabolizer",         risk: "HIGH" },    // severe myelosuppression
      { phenotype: "Intermediate Metabolizer", risk: "MODERATE" }, // reduce dose
      { phenotype: "Normal Metabolizer",       risk: "LOW" },
    ],
  },
  FLUOROURACIL: {
    gene: "DPYD",
    rules: [
      { phenotype: "Poor Metabolizer",         risk: "HIGH" },    // life-threatening toxicity
      { phenotype: "Intermediate Metabolizer", risk: "MODERATE" }, // reduce starting dose
      { phenotype: "Normal Metabolizer",       risk: "LOW" },
    ],
  },
};

function predictDrugRisk(phenotypes, drug) {
  const config = RISK_MATRIX[drug.toUpperCase()];
  if (!config) return "LOW"; // unknown drug → default safe

  const { gene, rules } = config;
  const phenotype = phenotypes[gene];

  if (!phenotype || phenotype === "Unknown") {
    // No variant detected → assume normal metabolizer
    return "LOW";
  }

  // Find matching rule
  const rule = rules.find(r => r.phenotype === phenotype);
  if (rule) return rule.risk;

  return "LOW"; // fallback
}

module.exports = predictDrugRisk;
