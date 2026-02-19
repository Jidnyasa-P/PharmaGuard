const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const llmExplanation = async (drug, riskLevel, genes = [], diplotypes = {}, phenotypes = {}) => {
  const geneContext = genes.length > 0
    ? genes.map(g => `${g}: diplotype ${diplotypes[g] || "N/A"}, phenotype ${phenotypes[g] || "Unknown"}`).join("; ")
    : "No pharmacogenomic variants detected";

  const prompt = `You are a clinical pharmacogenomics expert AI providing decision support.

Patient Genetic Profile:
- Drug: ${drug}
- Risk Level: ${riskLevel}
- Pharmacogenomic Findings: ${geneContext}

Write a concise 3-4 sentence clinical explanation that:
1. States the specific gene variant and its effect on drug metabolism
2. Explains the clinical consequence for this specific drug
3. Gives a clear actionable recommendation aligned with CPIC guidelines
4. Mentions the biological mechanism (e.g. CYP enzyme activity)

Be precise, clinical, and cite the gene and drug interaction specifically. Do not use bullet points.`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
    temperature: 0.3,
  });

  return response.choices[0].message.content.trim();
};

module.exports = llmExplanation;
