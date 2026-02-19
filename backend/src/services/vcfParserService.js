/**
 * vcfParserService.js
 * Parses VCF v4.2 files and extracts pharmacogenomically relevant variant records.
 * Returns an array of variant objects: { chrom, pos, rsid, ref, alt, gene, star, filter, info }
 */

const fs = require("fs");

const PHARMA_GENES = new Set(["CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"]);

// Known pharmacogenomic rsIDs mapped to gene + star allele
const KNOWN_VARIANTS = {
  // CYP2D6
  rs3892097:  { gene: "CYP2D6",  star: "*4",  effect: "loss" },
  rs35742686: { gene: "CYP2D6",  star: "*3",  effect: "loss" },
  rs5030655:  { gene: "CYP2D6",  star: "*6",  effect: "loss" },
  rs16947:    { gene: "CYP2D6",  star: "*2",  effect: "normal" },
  rs1065852:  { gene: "CYP2D6",  star: "*10", effect: "reduced" },
  rs28371706: { gene: "CYP2D6",  star: "*41", effect: "reduced" },
  rs1135840:  { gene: "CYP2D6",  star: "*2",  effect: "normal" },
  // CYP2C19
  rs4244285:  { gene: "CYP2C19", star: "*2",  effect: "loss" },
  rs4986893:  { gene: "CYP2C19", star: "*3",  effect: "loss" },
  rs28399504: { gene: "CYP2C19", star: "*4",  effect: "loss" },
  rs12248560: { gene: "CYP2C19", star: "*17", effect: "gain" },
  rs7616467:  { gene: "CYP2C19", star: "*1",  effect: "normal" },
  // CYP2C9
  rs1799853:  { gene: "CYP2C9",  star: "*2",  effect: "reduced" },
  rs1057910:  { gene: "CYP2C9",  star: "*3",  effect: "loss" },
  rs28371686: { gene: "CYP2C9",  star: "*5",  effect: "loss" },
  rs9332131:  { gene: "CYP2C9",  star: "*6",  effect: "loss" },
  // SLCO1B1
  rs4149056:  { gene: "SLCO1B1", star: "*5",  effect: "reduced" },
  rs2306283:  { gene: "SLCO1B1", star: "*1B", effect: "normal" },
  rs11045819: { gene: "SLCO1B1", star: "*15", effect: "loss" },
  // TPMT
  rs1800462:  { gene: "TPMT",    star: "*2",  effect: "loss" },
  rs1800460:  { gene: "TPMT",    star: "*3B", effect: "loss" },
  rs1142345:  { gene: "TPMT",    star: "*3C", effect: "loss" },
  rs1800584:  { gene: "TPMT",    star: "*4",  effect: "loss" },
  // DPYD
  rs3918290:  { gene: "DPYD",    star: "*2A", effect: "loss" },
  rs55886062: { gene: "DPYD",    star: "*13", effect: "loss" },
  rs67376798: { gene: "DPYD",    star: "*9A", effect: "reduced" },
  rs1801159:  { gene: "DPYD",    star: "*5",  effect: "reduced" },
};

async function parseVCF(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const variants = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("##")) continue;
    if (line.startsWith("#CHROM")) continue; // header row

    const parts = line.split("\t");
    if (parts.length < 5) continue;

    const [chrom, pos, id, ref, alt, , filter, info = ""] = parts;
    if (!chrom || !pos) continue;

    // Extract rsid from ID column
    let rsid = null;
    if (id && id.startsWith("rs")) rsid = id;

    // Try to extract rsid from INFO field (RS= tag)
    if (!rsid) {
      const rsMatch = info.match(/(?:^|;)RS=([^;]+)/);
      if (rsMatch) rsid = "rs" + rsMatch[1];
    }

    // Extract GENE from INFO field
    let gene = null;
    const geneMatch = info.match(/(?:^|;)GENE=([^;]+)/);
    if (geneMatch) gene = geneMatch[1].trim();

    // Extract STAR allele from INFO
    let star = null;
    const starMatch = info.match(/(?:^|;)STAR=([^;]+)/);
    if (starMatch) star = starMatch[1].trim();

    // Supplement from known variants db
    if (rsid && KNOWN_VARIANTS[rsid]) {
      const known = KNOWN_VARIANTS[rsid];
      if (!gene) gene = known.gene;
      if (!star) star = known.star;
    }

    // Only include if we can associate with a pharma gene
    if (!gene && rsid && !KNOWN_VARIANTS[rsid]) {
      // Skip unknown variants with no gene annotation
      continue;
    }

    if (gene && !PHARMA_GENES.has(gene)) continue;

    variants.push({
      chrom: chrom.replace(/^chr/i, ""),
      pos: parseInt(pos, 10),
      rsid: rsid || ".",
      ref: ref || ".",
      alt: alt || ".",
      gene: gene || "Unknown",
      star: star || "*1",
      filter: filter || "PASS",
      info,
    });
  }

  return variants;
}

module.exports = parseVCF;
