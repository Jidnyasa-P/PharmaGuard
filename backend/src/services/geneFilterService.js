/**
 * geneFilterService.js
 * Takes an array of variant objects and returns a deduplicated list of
 * pharmacogenomically relevant gene names found in the VCF.
 */

const SUPPORTED_GENES = ["CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"];

function filterGenes(variants) {
  const geneSet = new Set();

  for (const variant of variants) {
    if (variant.gene && SUPPORTED_GENES.includes(variant.gene)) {
      geneSet.add(variant.gene);
    }
  }

  // Return in canonical order
  return SUPPORTED_GENES.filter(g => geneSet.has(g));
}

module.exports = filterGenes;
