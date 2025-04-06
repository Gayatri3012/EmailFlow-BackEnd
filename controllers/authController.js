const { OAuth2Client } = require('google-auth-library');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const jwt = require('jsonwebtoken')
require('dotenv').config(); 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleSignIn = async (req, res, next) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const {email, name, picture} = ticket.getPayload();

        let user = await User.findOne({email})

        if(!user){
            user = new User({
                name,
                email,
                profilePicture: picture
            })
            await user.save();
        }
        const sessionToken = jwt.sign(
            { id: user._id, email: user.email },
           process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ success: true, user, token: sessionToken });

    } catch (error) {
        console.error('Google authentication error:', error);
        res.status(401).json({ error: "Invalid Google token" });
    }
}

exports.signup = async (req, res, next) => {
    const {email, name, password}= req.body;

    console.log(email, name, password)

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('E-mail address already exists!');
            error.statusCode = 401;
            error.field = 'email'
            throw error;
        }

        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const result = await user.save();
        res.status(201).json({ message: 'User created!', userId: result._id });
    }catch(err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try{
        const user = await User.findOne({ email: email });
            if (!user) {
                const error = new Error('No account found with this email.');
                error.statusCode = 401;
                error.field = 'email'
                throw error;
            }
            loadedUser = user;
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                const error = new Error("Incorrect password. Please try again.");
                error.statusCode = 401;
                error.field = 'password'
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ success: true, token: token, userId: loadedUser._id.toString(), user: loadedUser })
        } catch(err){
            next(err);
        }
}