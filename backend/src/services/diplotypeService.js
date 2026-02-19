/**
 * diplotypeService.js
 * Predicts the diplotype (e.g. *1/*4) for each gene based on detected variants.
 * Uses a simplified star-allele calling approach based on known rsID → star allele mapping.
 *
 * Input:  genes[] — array of gene names (from geneFilterService)
 * Output: { GENE: "*X/*Y", ... }
 */

// Default (reference) alleles per gene when no variant is detected
const DEFAULT_STAR = {
  CYP2D6:  "*1",
  CYP2C19: "*1",
  CYP2C9:  "*1",
  SLCO1B1: "*1A",
  TPMT:    "*1",
  DPYD:    "*1",
};

// Known loss/reduced function allele pairs commonly reported
// In a full implementation this would use PharmVar data
const LOSS_ALLELES = {
  CYP2D6:  ["*3", "*4", "*5", "*6", "*7", "*8"],
  CYP2C19: ["*2", "*3", "*4", "*5"],
  CYP2C9:  ["*2", "*3", "*5", "*6"],
  SLCO1B1: ["*5", "*15"],
  TPMT:    ["*2", "*3A", "*3B", "*3C", "*4"],
  DPYD:    ["*2A", "*13"],
};

const REDUCED_ALLELES = {
  CYP2D6:  ["*10", "*17", "*29", "*41"],
  CYP2C19: ["*17"],  // *17 is gain-of-function, treated separately
  CYP2C9:  ["*2"],
  SLCO1B1: ["*1B"],
  TPMT:    [],
  DPYD:    ["*9A", "*5"],
};

// rsID → star allele reference (same mapping as vcfParserService for consistency)
const RS_TO_STAR = {
  rs3892097:  { gene: "CYP2D6",  star: "*4" },
  rs35742686: { gene: "CYP2D6",  star: "*3" },
  rs5030655:  { gene: "CYP2D6",  star: "*6" },
  rs16947:    { gene: "CYP2D6",  star: "*2" },
  rs1065852:  { gene: "CYP2D6",  star: "*10" },
  rs28371706: { gene: "CYP2D6",  star: "*41" },
  rs4244285:  { gene: "CYP2C19", star: "*2" },
  rs4986893:  { gene: "CYP2C19", star: "*3" },
  rs28399504: { gene: "CYP2C19", star: "*4" },
  rs12248560: { gene: "CYP2C19", star: "*17" },
  rs1799853:  { gene: "CYP2C9",  star: "*2" },
  rs1057910:  { gene: "CYP2C9",  star: "*3" },
  rs28371686: { gene: "CYP2C9",  star: "*5" },
  rs9332131:  { gene: "CYP2C9",  star: "*6" },
  rs4149056:  { gene: "SLCO1B1", star: "*5" },
  rs2306283:  { gene: "SLCO1B1", star: "*1B" },
  rs11045819: { gene: "SLCO1B1", star: "*15" },
  rs1800462:  { gene: "TPMT",    star: "*2" },
  rs1800460:  { gene: "TPMT",    star: "*3B" },
  rs1142345:  { gene: "TPMT",    star: "*3C" },
  rs3918290:  { gene: "DPYD",    star: "*2A" },
  rs55886062: { gene: "DPYD",    star: "*13" },
  rs67376798: { gene: "DPYD",    star: "*9A" },
  rs1801159:  { gene: "DPYD",    star: "*5" },
};

function predictDiplotypes(genes, variants = []) {
  const diplotypes = {};

  // Build a map of gene → detected star alleles from variants
  const geneStars = {};
  for (const v of (variants || [])) {
    const entry = v.rsid ? RS_TO_STAR[v.rsid] : null;
    const star = (entry && entry.star) || v.star;
    const gene = (entry && entry.gene) || v.gene;
    if (gene && star && star !== "*1" && star !== "*1A") {
      if (!geneStars[gene]) geneStars[gene] = [];
      if (!geneStars[gene].includes(star)) geneStars[gene].push(star);
    }
  }

  for (const gene of genes) {
    const detected = geneStars[gene] || [];
    const def = DEFAULT_STAR[gene] || "*1";

    if (detected.length === 0) {
      diplotypes[gene] = `${def}/${def}`;
    } else if (detected.length === 1) {
      diplotypes[gene] = `${def}/${detected[0]}`;
    } else {
      // Use two most significant detected alleles
      // Loss > Reduced > Gain in priority
      const sorted = detected.sort((a, b) => {
        const aLoss = (LOSS_ALLELES[gene] || []).includes(a);
        const bLoss = (LOSS_ALLELES[gene] || []).includes(b);
        if (aLoss && !bLoss) return -1;
        if (!aLoss && bLoss) return 1;
        return 0;
      });
      diplotypes[gene] = `${sorted[0]}/${sorted[1]}`;
    }
  }

  return diplotypes;
}

module.exports = predictDiplotypes;
