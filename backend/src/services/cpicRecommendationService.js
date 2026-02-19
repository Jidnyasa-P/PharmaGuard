const cpicRecommender = (riskLevel, drug) => {

  if (riskLevel === "HIGH") {
    return "Reduce starting dose or consider alternative therapy";
  }

  if (riskLevel === "MODERATE") {
    return "Use with caution and monitor closely";
  }

  return "Standard dosing recommended";

};

module.exports = cpicRecommender;
