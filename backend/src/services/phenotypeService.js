/**
 * phenotypeService.js
 * Translates diplotype calls → CPIC metabolizer phenotypes.
 *
 * Input:  diplotypes { GENE: "*X/*Y" }
 * Output: phenotypes { GENE: "Poor Metabolizer" | "Intermediate Metabolizer" | "Normal Metabolizer" | "Rapid Metabolizer" | "Ultra-Rapid Metabolizer" | "Sensitive" }
 *
 * Based on CPIC diplotype-phenotype tables (2024).
 */

// Star alleles classified by functional impact
const GENE_ALLELE_FUNCTION = {
  CYP2D6: {
    nonfunctional: ["*3", "*4", "*5", "*6", "*7", "*8", "*11", "*12", "*13", "*14", "*15", "*16", "*19", "*20", "*21", "*38", "*40", "*42"],
    decreased:     ["*10", "*17", "*29", "*36", "*41"],
    normal:        ["*1", "*2", "*33", "*35"],
    increased:     ["*1xN", "*2xN"],
  },
  CYP2C19: {
    nonfunctional: ["*2", "*3", "*4", "*5", "*6", "*7", "*8"],
    decreased:     [],
    normal:        ["*1", "*38"],
    increased:     ["*17"],
  },
  CYP2C9: {
    nonfunctional: ["*3", "*5", "*6", "*8", "*11", "*13"],
    decreased:     ["*2"],
    normal:        ["*1"],
    increased:     [],
  },
  SLCO1B1: {
    nonfunctional: ["*15", "*17", "*19", "*37"],
    decreased:     ["*5", "*1B"],
    normal:        ["*1A", "*1"],
    increased:     [],
  },
  TPMT: {
    nonfunctional: ["*2", "*3A", "*3B", "*3C", "*4"],
    decreased:     [],
    normal:        ["*1"],
    increased:     [],
  },
  DPYD: {
    nonfunctional: ["*2A", "*13"],
    decreased:     ["*9A", "*5"],
    normal:        ["*1"],
    increased:     [],
  },
};

function getAlleleScore(gene, star) {
  const funcs = GENE_ALLELE_FUNCTION[gene];
  if (!funcs) return 1; // assume normal
  if (funcs.increased.includes(star)) return 2;
  if (funcs.normal.includes(star) || star === "*1" || star === "*1A") return 1;
  if (funcs.decreased.includes(star)) return 0.5;
  if (funcs.nonfunctional.includes(star)) return 0;
  return 1; // unknown → assume normal
}

function callPhenotype(gene, diplotype) {
  if (!diplotype) return "Unknown";

  const parts = diplotype.split("/");
  if (parts.length !== 2) return "Unknown";

  const [a1, a2] = parts;
  const score = getAlleleScore(gene, a1) + getAlleleScore(gene, a2);
  const maxScore = 2;

  // SLCO1B1 / TPMT use "Sensitive" / "Normal" terminology
  if (gene === "SLCO1B1" || gene === "TPMT") {
    if (score === 0) return "Poor Metabolizer";    // maps to Sensitive patient
    if (score < 1)   return "Intermediate Metabolizer";
    if (score < 2)   return "Intermediate Metabolizer";
    return "Normal Metabolizer";
  }

  // CYP2C19 *17 gain-of-function
  if (gene === "CYP2C19") {
    if (score >= 3) return "Ultra-Rapid Metabolizer";
    if (score === 2 && (a1 === "*17" || a2 === "*17")) return "Rapid Metabolizer";
    if (score === 2) return "Normal Metabolizer";
    if (score >= 1) return "Intermediate Metabolizer";
    return "Poor Metabolizer";
  }

  // General logic for CYP2D6, CYP2C9, DPYD
  if (score === 0)   return "Poor Metabolizer";
  if (score < 1)     return "Intermediate Metabolizer";
  if (score < 2)     return "Intermediate Metabolizer";
  if (score === 2)   return "Normal Metabolizer";
  if (score > 2)     return "Ultra-Rapid Metabolizer";
  return "Normal Metabolizer";
}

function predictPhenotypes(diplotypes) {
  const phenotypes = {};
  for (const [gene, diplotype] of Object.entries(diplotypes)) {
    phenotypes[gene] = callPhenotype(gene, diplotype);
  }
  return phenotypes;
}

module.exports = predictPhenotypes;
