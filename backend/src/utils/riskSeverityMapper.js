const riskMapper = (drug, phenotypes) => {

  if (drug === "WARFARIN") {

    if (phenotypes["CYP2C9"] === "Intermediate Metabolizer" ||
        phenotypes["VKORC1"] === "Sensitive") {

      return "HIGH";
    }

  }

  if (drug === "CLOPIDOGREL") {

    if (phenotypes["CYP2C19"] === "Poor Metabolizer") {

      return "HIGH";
    }

  }

  return "LOW";

};

module.exports = riskMapper;
