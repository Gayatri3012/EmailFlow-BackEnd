const agenda = require('../config/agenda');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Define an Agenda job called "send-email"
agenda.define('send-email', async (job) => {

  // Create a test email account using Ethereal (useful for development/testing)
    const testAccount = await nodemailer.createTestAccount();

    // Configure the Nodemailer transporter using Ethereal SMTP
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    // Destructure job data to extract recipient address, subject, and message body
    const { emailAddress:to, subject, body:text } = job.attrs.data;

  try {
    // Send the email using the transporter
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(` Email sent to ${to}`);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); // Viewable in console for testing
  } catch (error) {
    console.error(` Failed to send email to ${to}:`, error);
  }
});