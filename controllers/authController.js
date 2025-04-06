const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const jwt = require('jsonwebtoken')
require('dotenv').config(); 

// Create Google OAuth2 client instance using client ID from environment variables
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Handle Google OAuth login
exports.googleSignIn = async (req, res, next) => {
    const { token } = req.body;

    try {
        // Verify the ID token using Google's OAuth2 client
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        // Extract user info from the verified payload
        const {email, name, picture} = ticket.getPayload();

        // Check if user already exists in the database
        let user = await User.findOne({email})

        // If user doesn't exist, create a new one
        if(!user){
            user = new User({
                name,
                email,
                profilePicture: picture
            })
            await user.save();
        }

        // Generate a session token using JWT
        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
           process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        // Send the user data and token to the frontend
        res.json({ success: true, user, token: sessionToken });

    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(401).json({ error: "Invalid Google token" });
    }
}


// Handle manual user signup
exports.signup = async (req, res, next) => {
    const {email, name, password}= req.body;

    console.log(email, name, password)

    try {
        // Check if the email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('E-mail address already exists!');
            error.statusCode = 401;
            error.field = 'email'
            throw error;
        }

        // Hash the password securely
        const hashedPw = await bcrypt.hash(password, 12);

        // Create and save the new user
        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const result = await user.save();
        // Create and save the new user
        res.status(201).json({ message: 'User created!', userId: result._id });
    }catch(err) {
        next(err);
    }
}

// Handle manual user login
exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try{
        // Find the user by email
        const user = await User.findOne({ email: email });
            if (!user) {
                const error = new Error('No account found with this email.');
                error.statusCode = 401;
                error.field = 'email'
                throw error;
            }

            loadedUser = user;

            // Compare provided password with stored hash
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                const error = new Error("Incorrect password. Please try again.");
                error.statusCode = 401;
                error.field = 'password'
                throw error;
            }

            // Generate a token for the authenticated user
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Respond with token and user details
            res.status(200).json({ success: true, token: token, userId: loadedUser._id.toString(), user: loadedUser })
        } catch(err){
            next(err);
        }
}