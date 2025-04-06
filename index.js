const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const http = require("http");
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth')
const emailFlowRoutes = require('./routes/emailFlow')
const port = 8080;
require('dotenv').config(); 
require('./jobs/emailJobs.js');

const app = express();

// Allowlist of frontend domains for CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://email-flow-front-end.vercel.app',
];

// CORS setup to handle cross-origin requests securely
app.use(
    cors({
      origin: allowedOrigins, 
      credentials: true, 
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Parse incoming JSON and form-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route setup
app.use("/auth", authRoutes);
app.use('/emailFlow', emailFlowRoutes)

// Global Error Handling Middleware
app.use((error, req, res, next) => {
    console.error(error); 

    const status = error.statusCode || 500; 
    const message = error.message || "Internal Server Error";

    res.status(status).json({
        success: false,
        message: message,
        error: error.field || null,
    });
});

// Connect to MongoDB and start server once connected
mongoose.connect(process.env.MONGO_URI)
.then(result => {
    app.listen(port, () => { 
        console.log(`Server is listening on port ${port}`);
    });
})
.catch(err => {
    console.log(err);
})



