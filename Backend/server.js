require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 5001;
const cors = require("cors");
const authMiddleware = require('./middleware/auth');
const { default: mongoose, connect } = require('mongoose');

app.use(express.json());
app.use(cors());

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("mongoDB connected");
    } catch(err){
        console.log(err);
    }
}

connectDB();

app.use("/fridge-items", authMiddleware, require("./routes/FridgeItemsRoutes"));
app.use("/analyze-nutrition", require("./routes/AnalyzeNutritionRoutes"));
app.use("/api/auth", require("./routes/UserRoutes"));
app.use("/api/nutrition-analyze", require("./gemini"));
app.use("/api/generate-recipe", require("./recipe-gemini"));
app.use("/api/generate-recipe-by-ingredients", require("./recipe-by-ingredients-gemini"));
app.listen(PORT, ()=> console.log(`Server is running at PORT : ${PORT}`));