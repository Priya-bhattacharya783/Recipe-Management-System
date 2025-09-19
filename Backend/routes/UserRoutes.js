const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    // console.log(email)
    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // Create new user
        user = new User({
            name,
            email,
            password
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Create and sign JWT
        const payload = {
            user: {
                id: user.id,
                email: user.email, // Include email in payload for dashboard display
                name: user.name
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ message: 'Logged in successfully!', token, userEmail: user.email, userName: user.name });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;