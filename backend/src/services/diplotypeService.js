const diplotypePredictor = (genes) => {

  const diplotypes = {};

  genes.forEach(gene => {

    if (gene === "CYP2C19") {
      diplotypes[gene] = "*2/*2";
    }

    if (gene === "VKORC1") {
      diplotypes[gene] = "-1639AA";
    }

    if (gene === "CYP2C9") {
      diplotypes[gene] = "*2/*3";
    }

  });

  return diplotypes;

};

module.exports = diplotypePredictor;
