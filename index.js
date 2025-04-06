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


app.use(
    cors({
      origin: 'http://localhost:3000', 
      credentials: true, 
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
);



// app.use((req, res, next) => {
//     res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
//     res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
//     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

//     if (req.method === "OPTIONS") {
//         return res.sendStatus(200);
//     }
//     next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


mongoose.connect(process.env.MONGO_URI)
.then(result => {
    app.listen(port, () => { 
        console.log(`Server is listening on port ${port}`);
    });
})
.catch(err => {
    console.log(err);
})



