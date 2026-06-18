import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Brews Lee Backend is running!' });
});

// Endpoint to send welcome email
app.post('/api/send-welcome', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`Sending welcome email to: ${email}`);
    
    // Read the premium HTML template
    const templatePath = path.join(__dirname, 'email-welcome.html');
    const htmlTemplate = await fs.readFile(templatePath, 'utf8');

    const { data, error } = await resend.emails.send({
      from: 'Brews Lee <onboarding@resend.dev>', // Update this to your verified domain when going to production
      to: email,
      subject: 'Welcome to Brews Lee ✦ Early Access',
      html: htmlTemplate,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`=================================`);
  console.log(`🍵 Brews Lee Backend Running!`);
  console.log(`📡 URL: http://localhost:${port}`);
  console.log(`=================================`);
});
