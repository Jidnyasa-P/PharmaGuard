const phenotypePredictor = (diplotypes) => {

  const phenotypes = {};

  Object.keys(diplotypes).forEach(gene => {

    if (gene === "CYP2C19") {
      phenotypes[gene] = "Poor Metabolizer";
    }

    if (gene === "VKORC1") {
      phenotypes[gene] = "Sensitive";
    }

    if (gene === "CYP2C9") {
      phenotypes[gene] = "Intermediate Metabolizer";
    }

  });

  return phenotypes;

};

module.exports = phenotypePredictor;
