const fs = require("fs");

const vcfParser = async (filePath) => {

  const data = fs.readFileSync(filePath, "utf8");

  const lines = data.split("\n");
  const variants = [];

  lines.forEach(line => {

    if (!line.startsWith("#") && line.trim() !== "") {

      // handles BOTH spaces and tabs
      const cols = line.trim().split(/\s+/);

      variants.push({
        chromosome: cols[0],
        position: cols[1],
        rsid: cols[2],
        ref: cols[3],
        alt: cols[4],
        genotype: cols[9]
      });

    }

  });

  return variants;

};

module.exports = vcfParser;
