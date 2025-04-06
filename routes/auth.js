const express = require('express');
const router = express.Router();
const {body} = require('express-validator');

const AuthController = require('../controllers/authController');
const User = require( '../models/User.js' );

router.post('/google', AuthController.googleSignIn);

router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password')
        .trim(),
    body('name')
        .trim()
        .not()
        .isEmpty()
], AuthController.signup)

router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password')
        .trim(),
], AuthController.login)

module.exports = router;