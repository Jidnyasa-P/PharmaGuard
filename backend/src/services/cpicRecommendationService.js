/**
 * cpicRecommendationService.js
 * Returns CPIC guideline-aligned clinical recommendation text.
 */

const RECOMMENDATIONS = {
  CODEINE: {
    HIGH: "CODEINE IS CONTRAINDICATED. CYP2D6 Ultra-Rapid Metabolizers risk morphine toxicity (respiratory depression); Poor Metabolizers derive no analgesic benefit. Select an alternative analgesic such as morphine (with caution in URM) or a non-opioid analgesic (NSAIDs, acetaminophen). CPIC Level A — avoid use.",
    MODERATE: "Use codeine with caution. CYP2D6 Intermediate Metabolizers may have reduced analgesic response. Start at lowest effective dose; monitor for efficacy and adverse effects. Consider alternative if pain control is inadequate. CPIC Level B.",
    LOW: "Standard codeine dosing appropriate. CYP2D6 Normal Metabolizers achieve expected analgesia. Use lowest effective dose; follow standard opioid prescribing guidelines.",
  },
  WARFARIN: {
    HIGH: "REDUCE WARFARIN DOSE SIGNIFICANTLY (50-75%). CYP2C9 Poor Metabolizers have markedly decreased clearance, elevating INR and major bleeding risk. Frequent INR monitoring required (every 2-3 days until stable). Consider anticoagulation clinic referral. CPIC Level A.",
    MODERATE: "REDUCE WARFARIN STARTING DOSE by 25-50%. CYP2C9 Intermediate Metabolizers require dose reduction. Monitor INR every 5-7 days until stable. Educate patient on bleeding signs. CPIC Level B.",
    LOW: "Standard warfarin dosing protocol. Initiate at 5 mg/day, adjust per INR (target 2-3). Routine INR monitoring weekly until stable.",
  },
  CLOPIDOGREL: {
    HIGH: "CLOPIDOGREL IS INEFFECTIVE. CYP2C19 Poor Metabolizers cannot activate clopidogrel, resulting in no antiplatelet effect and increased cardiovascular event risk (MI, stent thrombosis). Switch to prasugrel or ticagrelor. CPIC Level A.",
    MODERATE: "CONSIDER ALTERNATIVE ANTIPLATELET. CYP2C19 Intermediate Metabolizers have reduced clopidogrel activation. For high-risk patients (ACS, PCI), consider prasugrel or ticagrelor. Monitor for inadequate platelet inhibition. CPIC Level B.",
    LOW: "Standard clopidogrel dosing (75 mg/day maintenance). CYP2C19 Normal Metabolizers achieve adequate antiplatelet response.",
  },
  SIMVASTATIN: {
    HIGH: "AVOID SIMVASTATIN HIGH DOSES. SLCO1B1 Poor Metabolizers have severely impaired hepatic uptake, up to 17-fold increased myopathy/rhabdomyolysis risk. Switch to rosuvastatin, pravastatin, or fluvastatin. CPIC Level A.",
    MODERATE: "CAP SIMVASTATIN at 20 mg/day or consider alternative statin. SLCO1B1 Intermediate Metabolizers have elevated plasma exposure. Monitor CK levels periodically. Rosuvastatin preferred for aggressive LDL goals. CPIC Level B.",
    LOW: "Standard simvastatin dosing. SLCO1B1 Normal Metabolizers have expected hepatic uptake. Limit to 40 mg/day per standard prescribing guidelines.",
  },
  AZATHIOPRINE: {
    HIGH: "AZATHIOPRINE CONTRAINDICATED. TPMT Poor Metabolizers accumulate toxic thioguanine nucleotides causing life-threatening myelosuppression. Use alternative non-thiopurine immunosuppressant. If unavoidable, reduce dose by ≥10-fold with intensive CBC monitoring. CPIC Level A.",
    MODERATE: "REDUCE AZATHIOPRINE DOSE by 30-70%. TPMT Intermediate Metabolizers have reduced methylation; titrate from 30-70% of normal dose. Monitor CBC weekly (first month), then monthly. CPIC Level B.",
    LOW: "Standard azathioprine dosing (1-3 mg/kg/day). TPMT Normal Metabolizers tolerate standard doses; routine CBC monitoring per protocol.",
  },
  FLUOROURACIL: {
    HIGH: "FLUOROURACIL CONTRAINDICATED. DPYD Poor Metabolizers cannot catabolize 5-FU, causing life-threatening toxicity (mucositis, neutropenia, neurotoxicity). Use alternative chemotherapy. If essential, reduce dose ≥50% under specialist supervision. CPIC Level A.",
    MODERATE: "REDUCE FLUOROURACIL STARTING DOSE by 25-50%. DPYD Intermediate Metabolizers have partial DPD deficiency. Escalate cautiously based on tolerance. Monitor closely for mucositis, diarrhea, neutropenia. CPIC Level B.",
    LOW: "Standard fluorouracil dosing per oncology protocol. DPYD Normal Metabolizers have adequate DPD activity. Monitor for standard chemotherapy adverse effects.",
  },
};

function getCPICRecommendation(riskLevel, drug) {
  const drugUpper = (drug || "").toUpperCase();
  const drugRecs = RECOMMENDATIONS[drugUpper];
  if (!drugRecs) {
    return `No specific CPIC pharmacogenomic guideline available for ${drug}. Consult clinical pharmacist for individualized recommendation.`;
  }
  return drugRecs[riskLevel] || drugRecs["LOW"];
}

module.exports = getCPICRecommendation;
