const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

// Contact Form Route
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Use the email service for better compatibility on cloud providers like Render
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_USER, // Send it to self
    subject: `New Portfolio Message from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; }
          .email-header { background-color: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .email-body { background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
          .logo { color: #e21d1d; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
          .title { color: #333333; font-size: 20px; margin-top: 0; border-bottom: 2px solid #e21d1d; padding-bottom: 10px; display: inline-block; }
          .info-row { margin-bottom: 20px; }
          .label { font-weight: bold; color: #666666; font-size: 14px; text-transform: uppercase; display: block; margin-bottom: 5px; }
          .value { color: #333333; font-size: 16px; background-color: #f9f9f9; padding: 10px; border-radius: 5px; display: block; border-left: 3px solid #e21d1d; }
          .message-box { background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 5px solid #e21d1d; color: #444444; line-height: 1.6; font-style: italic; }
          .footer { text-align: center; margin-top: 30px; color: #999999; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 25px; background-color: #e21d1d; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <div class="logo">Ritika's Portfolio</div>
          </div>
          <div class="email-body">
            <h2 class="title">New Inquiry Received</h2>
            
            <div class="info-row">
              <span class="label">From</span>
              <span class="value">${name}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Email Address</span>
              <span class="value">${email}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Message</span>
              <div class="message-box">${message}</div>
            </div>

            <div style="text-align: center;">
              <a href="mailto:${email}" class="btn">Reply to ${name}</a>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from your Portfolio Contact Form.</p>
            <p>&copy; ${new Date().getFullYear()} Ritika Portfolio System</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('❌ Nodemailer Error Details:', error);
    res.status(500).json({
      message: 'Failed to send email. Check your .env credentials.',
      error: error.message // Sending more detail for debugging
    });
  }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('WARNING: MONGODB_URI is not defined. Falling back to localhost for development.');
}

const dbURI = MONGODB_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(dbURI)
  .then(() => console.log(`MongoDB Connected: ${dbURI.includes('localhost') ? 'Local' : 'Cloud Atlas'}`))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    console.error('Suggestion: Ensure MONGODB_URI is set correctly in your environment variables.');
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
