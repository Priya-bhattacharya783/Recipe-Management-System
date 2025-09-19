const express = require('express');
const router = express.Router();
const FridgeItem = require('../models/FridgeItems');

router.get('/', async (req, res) => {
    try {
        // req.user.id is set by the authMiddleware
        const fridgeItems = await FridgeItem.find({ userId: req.user.id }).sort({ expiryDate: 1 });
        res.json(fridgeItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', async (req, res) => {
    const { name, expiryDate } = req.body;

    try {
        const newItem = new FridgeItem({
            userId: req.user.id, // Associate item with the authenticated user
            name,
            expiryDate
        });

        const item = await newItem.save();
        res.status(201).json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:id', async (req, res) => {
    const { name, expiryDate } = req.body;

    try {
        let item = await FridgeItem.findOne({ _id: req.params.id, userId: req.user.id });

        if (!item) {
            return res.status(404).json({ msg: 'Fridge item not found or unauthorized' });
        }

        item.name = name || item.name;
        item.expiryDate = expiryDate || item.expiryDate;

        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const item = await FridgeItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

        if (!item) {
            return res.status(404).json({ msg: 'Fridge item not found or unauthorized' });
        }

        res.json({ msg: 'Fridge item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;