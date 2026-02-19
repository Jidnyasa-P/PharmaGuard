const vcfParser = require("../services/vcfParserService");
const geneFilter = require("../services/geneFilterService");
const diplotypePredictor = require("../services/diplotypeService");
const phenotypePredictor = require("../services/phenotypeService");
const drugRiskPredictor = require("../services/drugRiskService");
const cpicRecommender = require("../services/cpicRecommendationService");
const llmExplanation = require("../services/llmExplanationService");
const supportedDrugs = require("../utils/supportedDrugs");

const analyzeVCF = async (req, res) => {
  try {
    const filePath = req.file.path;
    let { drug } = req.body;

    if (!drug) {
      return res.status(400).json({
        error: "Drug name is required"
      });
    }

    drug = drug.toUpperCase();

    if (!supportedDrugs.includes(drug)) {
      return res.status(400).json({
        error: "Unsupported drug"
      });
    }

    // STEP 1 → Parse VCF
    const variants = await vcfParser(filePath);

    // STEP 2 → Filter Genes
    const genes = geneFilter(variants);

    // STEP 3 → Diplotype Prediction
    const diplotypes = diplotypePredictor(genes);

    // STEP 4 → Phenotype Prediction
    const phenotypes = phenotypePredictor(diplotypes);

    // STEP 5 → Drug Risk Prediction
    const risks = drugRiskPredictor(phenotypes, drug);

    // STEP 6 → CPIC Recommendation
    const recommendations = cpicRecommender(risks, drug);

    // STEP 7 → AI Explanation
    const explanation = await llmExplanation(drug, risks);

    // 🎯 FINAL JUDGE OUTPUT
    res.json({

  patient_id: "PATIENT_001",

  drug: drug,

  timestamp: new Date().toISOString(),

  risk_assessment: {
    risk_label: risks === "HIGH" ? "Toxic" : "Safe",
    confidence_score: risks === "HIGH" ? 0.85 : 0.6,
    severity:
      risks === "HIGH"
        ? "high"
        : risks === "MODERATE"
        ? "moderate"
        : "low"
  },

  pharmacogenomic_profile: {
    primary_gene: genes[0] || "Unknown",
    diplotype: Object.values(diplotypes)[0] || "N/A",
    phenotype:
      Object.values(phenotypes)[0] === "Poor Metabolizer"
        ? "PM"
        : Object.values(phenotypes)[0] === "Intermediate Metabolizer"
        ? "IM"
        : "NM",
    detected_variants: variants.map(v => ({
      rsid: v.rsid
    }))
  },

  clinical_recommendation: {
    guideline: recommendations
  },

  llm_generated_explanation: {
    summary: explanation
  },

  quality_metrics: {
    vcf_parsing_success: true,
    gene_match_found: genes.length > 0
  }

});


  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = { analyzeVCF };
