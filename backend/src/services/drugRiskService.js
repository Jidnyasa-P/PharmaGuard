const riskMapper = require("../utils/riskSeverityMapper");

const drugRiskPredictor = (phenotypes, drug) => {

  return riskMapper(drug, phenotypes);

};

module.exports = drugRiskPredictor;
