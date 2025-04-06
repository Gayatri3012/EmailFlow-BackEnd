const express = require('express');
const router = express.Router();

const EmailFlowController = require('../controllers/emailFlowController');
const isAuth = require( '../middleware/isAuth' );

router.post('/flowchart', isAuth, EmailFlowController.saveFlowChart);
router.get('/flowcharts/:userId', isAuth, EmailFlowController.getAllFlowCharts);
router.get('/flowchart/:flowchartId', isAuth, EmailFlowController.getFlowChartById)

module.exports = router;