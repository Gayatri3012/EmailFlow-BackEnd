const express = require('express');
const router = express.Router();

const EmailFlowController = require('../controllers/emailFlowController');
const isAuth = require( '../middleware/isAuth');    // Middleware to check authentication

// Save or update a flowchart (protected route)
router.post('/flowchart', isAuth, EmailFlowController.saveFlowChart);

// Get all flowcharts for a specific user (protected route)
router.get('/flowcharts/:userId', isAuth, EmailFlowController.getAllFlowCharts);

// Get a single flowchart by its ID (protected route)
router.get('/flowchart/:flowchartId', isAuth, EmailFlowController.getFlowChartById)

// Generate an email using genAI (protected route)
router.post('/generate-email', isAuth, EmailFlowController.handleGenerateEmail);

// Generate a general AI response using genAI (protected route)
router.post('/generate-airesponse', isAuth, EmailFlowController.handleGenerateAIResponse);


module.exports = router;