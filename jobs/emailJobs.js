const agenda = require('../config/agenda');
const nodemailer = require('nodemailer');
require('dotenv').config();



agenda.define('send-email', async (job) => {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
  const { emailAddress:to, subject, body:text } = job.attrs.data;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(` Email sent to ${to}`);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error(` Failed to send email to ${to}:`, error);
  }
});