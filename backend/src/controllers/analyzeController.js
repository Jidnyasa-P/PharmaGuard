const vcfParser = require("../services/vcfParserService");
const geneFilter = require("../services/geneFilterService");
const diplotypePredictor = require("../services/diplotypeService");
const phenotypePredictor = require("../services/phenotypeService");
const drugRiskPredictor = require("../services/drugRiskService");
const cpicRecommender = require("../services/cpicRecommendationService");
const llmExplanation = require("../services/llmExplanationService");
const supportedDrugs = require("../utils/supportedDrugs");

const analyzeVCF = async (req, res) => {
  const startTime = Date.now();

  try {
    const filePath = req.file.path;
    let { drug } = req.body;

    if (!drug) {
      return res.status(400).json({ error: "Drug name is required" });
    }

    drug = drug.toUpperCase().trim();

    if (!supportedDrugs.includes(drug)) {
      return res.status(400).json({
        error: `Unsupported drug: ${drug}. Supported drugs: ${supportedDrugs.join(", ")}`
      });
    }

    let vcfParsingSuccess = false;
    let parseError = null;
    let variants = [];

    // STEP 1 → Parse VCF
    try {
      variants = await vcfParser(filePath);
      vcfParsingSuccess = variants.length > 0;
    } catch (err) {
      parseError = err.message;
    }

    // STEP 2 → Filter Genes
    const genes = geneFilter(variants);
    const geneMatchFound = genes.length > 0;

    // STEP 3 → Diplotype Prediction (pass variants for rsid → star allele lookup)
    const diplotypes = diplotypePredictor(genes, variants);

    // STEP 4 → Phenotype Prediction
    const phenotypes = phenotypePredictor(diplotypes);

    // STEP 5 → Drug Risk Prediction
    const riskLevel = drugRiskPredictor(phenotypes, drug);

    // STEP 6 → CPIC Recommendation
    const recommendation = cpicRecommender(riskLevel, drug);

    // STEP 7 → AI Explanation
    let explanation = "Clinical explanation unavailable.";
    try {
      explanation = await llmExplanation(drug, riskLevel, genes, diplotypes, phenotypes);
    } catch (llmErr) {
      console.error("LLM error:", llmErr.message);
    }

    // Risk → judge schema labels
    const riskLabelMap = { HIGH: "Toxic", MODERATE: "Adjust Dosage", LOW: "Safe" };
    const severityMap  = { HIGH: "high", MODERATE: "moderate", LOW: "none" };
    const confidenceMap = { HIGH: 0.92, MODERATE: 0.78, LOW: 0.65 };

    const phenotypeCode = (fullPheno) => {
      if (!fullPheno) return "Unknown";
      if (fullPheno === "Poor Metabolizer")         return "PM";
      if (fullPheno === "Intermediate Metabolizer")  return "IM";
      if (fullPheno === "Normal Metabolizer")        return "NM";
      if (fullPheno === "Rapid Metabolizer")         return "RM";
      if (fullPheno === "Ultra-Rapid Metabolizer")   return "URM";
      return "Unknown";
    };

    const primaryGene = genes[0] || "Unknown";
    const primaryDiplotype = diplotypes[primaryGene] || "N/A";
    const primaryPhenotypeFull = phenotypes[primaryGene] || "Unknown";
    const primaryPhenotypeCode = phenotypeCode(primaryPhenotypeFull);

    const relevantVariants = variants
      .filter(v => v.rsid && v.rsid !== "." && v.rsid.startsWith("rs"))
      .slice(0, 20)
      .map(v => ({ rsid: v.rsid }));

    const elapsedMs = Date.now() - startTime;

    res.json({
      patient_id: "PATIENT_001",
      drug: drug,
      timestamp: new Date().toISOString(),

      risk_assessment: {
        risk_label: riskLabelMap[riskLevel] || "Safe",
        confidence_score: confidenceMap[riskLevel] || 0.65,
        severity: severityMap[riskLevel] || "none",
      },

      pharmacogenomic_profile: {
        primary_gene: primaryGene,
        diplotype: primaryDiplotype,
        phenotype: primaryPhenotypeCode,
        detected_variants: relevantVariants.length > 0 ? relevantVariants : [],
      },

      clinical_recommendation: {
        guideline: recommendation,
        cpic_level: riskLevel === "HIGH" ? "A" : riskLevel === "MODERATE" ? "B" : "C",
        action: riskLevel === "HIGH"
          ? "Avoid use or select alternative therapy"
          : riskLevel === "MODERATE"
          ? "Reduce starting dose and monitor closely"
          : "Standard dosing recommended",
      },

      llm_generated_explanation: {
        summary: explanation,
        model: "llama-3.3-70b-versatile",
        provider: "Groq",
      },

      quality_metrics: {
        vcf_parsing_success: vcfParsingSuccess,
        gene_match_found: geneMatchFound,
        variants_detected: variants.length,
        processing_time_ms: elapsedMs,
        parse_error: parseError,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { analyzeVCF };
