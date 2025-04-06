const express = require('express');
const router = express.Router();
const {body} = require('express-validator');

const AuthController = require('../controllers/authController');
const User = require( '../models/User.js' );

// Route for Google OAuth login
router.post('/google', AuthController.googleSignIn);

// Route for email/password signup with validations
router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),  // Sanitize email input
    body('password')
        .trim(),    // Remove whitespace from start and end
    body('name')
        .trim()
        .not()
        .isEmpty()
], AuthController.signup)

// Route for login with validations
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password')
        .trim(),
], AuthController.login)

module.exports = router;