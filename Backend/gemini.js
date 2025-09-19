require('dotenv').config();
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/nutrition-analyze
router.post('/', async (req, res) => {
  const { recipeName } = req.body;

  if (!recipeName) {
    return res.status(400).json({ error: 'Recipe name is required.' });
  }

  const prompt = `Provide a brief nutritional analysis for "${recipeName}". Include estimated calories, protein, carbs, and fats. Also, suggest one healthy substitute for an ingredient if applicable. Format the response clearly. Dont give any bold letters or in any other style , just maintain a simple and professional text.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });
  } catch (error) {
    console.error('LLM Error:', error);
    res.status(500).json({ error: 'Failed to analyze recipe' });
  }
});

module.exports = router;

