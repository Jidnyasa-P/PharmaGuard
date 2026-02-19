const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const llmExplanation = async (drug, risk) => {

  const prompt = `
You are a pharmacogenomics clinical decision support AI.

Patient has been prescribed ${drug}.
Genetic analysis indicates a ${risk} pharmacogenomic risk.

Generate a short clinical explanation for dosage adjustment recommendation.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.choices[0].message.content;

};

module.exports = llmExplanation;
