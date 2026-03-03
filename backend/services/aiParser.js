const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parseReceiptWithAI(rawText) {
const model = genAI.getGenerativeModel({
  model: "models/gemini-1.0-pro"
});

  const prompt = `
Return ONLY valid JSON:

{
  "merchantName": "",
  "date": "YYYY-MM-DD",
  "category": "",
  "receiptType": "",
  "currency": "INR",
  "items": [
    { "name": "", "price": number }
  ],
  "totalAmount": number
}

Receipt Text:
${rawText}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return JSON.parse(text);
}

module.exports = parseReceiptWithAI;