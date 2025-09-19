const express = require('express');
const router = express.Router();

router.post("/", async(req,res)=>{
    const {recipeName} = req.body;
    console.log(recipeName);
    res.status(200).send(`Analyzed Nutrition for this recipe: ${recipeName}`);
})

module.exports = router;