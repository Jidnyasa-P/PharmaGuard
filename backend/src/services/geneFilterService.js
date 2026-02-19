const supportedGenes = require("../utils/supportedGenes");

const geneFilter = (variants) => {

  const detectedGenes = [];

  variants.forEach(variant => {

    if (supportedGenes[variant.rsid]) {

      detectedGenes.push(supportedGenes[variant.rsid]);

    }

  });

  return [...new Set(detectedGenes)];

};

module.exports = geneFilter;
