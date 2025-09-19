const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // For loading environment variables from a .env file

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY environment variable not set. API calls will fail.");
    // In a real application, you might want to gracefully exit or prevent server startup.
    process.exit(1); // Exit if API key is not set
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the backend endpoint for generating recipes
router.post('/', async (req, res) => {
    console.log("hit object");
    try {
        const { ingredients } = req.body; // Correctly get "ingredients" from the request body

        if (!ingredients) {
            return res.status(400).json({ error: "No ingredients provided" });
        }

        // Construct the chat history for the API request
        const chatHistory = [
            {
                role: "user",
                parts: [{ text: `Generate a detailed recipe for a dish using these ingredients: "${ingredients}". Provide the recipe name, a brief description, a list of ingredients, a list of step-by-step instructions, prep time, cook time, and servings. Also, provide a placeholder image URL (e.g., https://placehold.co/800x300/e2e8f0/6366f1?text=Recipe+Image) for the recipe. Ensure the output is a JSON object.` }]
            }
        ];

        // Define the structured response schema for the recipe
        const generationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "recipeName": { "type": "STRING" },
                    "description": { "type": "STRING" },
                    "ingredients": { "type": "ARRAY", "items": { "type": "STRING" } },
                    "instructions": { "type": "ARRAY", "items": { "type": "STRING" } },
                    "prepTime": { "type": "STRING" },
                    "cookTime": { "type": "STRING" },
                    "servings": { "type": "STRING" },
                    "imageUrl": { "type": "STRING" }
                },
                required: ["recipeName", "description", "ingredients", "instructions", "prepTime", "cookTime", "servings", "imageUrl"]
            }
        };

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Generate content using the model
        const result = await model.generateContent({
            contents: chatHistory,
            generationConfig: generationConfig
        });

        const responseText = result.response.candidates[0].content.parts[0].text;
        const recipeData = JSON.parse(responseText); // Parse the JSON string

        // Send the parsed recipe data back to the frontend
        res.json(recipeData);

    } catch (error) {
        console.error('Error generating recipe on backend:', error);
        // Send a 500 status code for server errors
        res.status(500).json({ error: "Failed to generate recipe", details: error.message });
    }
});

module.exports = router;