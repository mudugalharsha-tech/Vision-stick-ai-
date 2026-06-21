const nodemailer = require('nodemailer');
const logger = require('../config/logger');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const emailStyle = `
  body { margin:0; padding:0; background:#111318; font-family: Inter, sans-serif; }
  .wrap { max-width:520px; margin:32px auto; background:#1c1e26; border-radius:14px; overflow:hidden; border:1px solid #2a2d3a; }
  .header { background:#3b5bdb; padding:28px 32px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:22px; font-weight:800; }
  .header p  { color:#a5b4fc; margin:4px 0 0; font-size:13px; }
  .body { padding:28px 32px; }
  .body p  { color:#8b8fa8; font-size:14px; line-height:1.7; margin:0 0 16px; }
  .body h2 { color:#e8eaf0; font-size:18px; margin:0 0 12px; font-weight:700; }
  .btn { display:block; background:#3b5bdb; color:#fff; text-decoration:none; padding:14px 28px; border-radius:10px; font-weight:600; font-size:15px; text-align:center; margin:24px 0; }
  .footer { padding:16px 32px; border-top:1px solid #2a2d3a; text-align:center; }
  .footer p { color:#555870; font-size:11px; margin:0; }
`;

async function sendVerification(email, name, token) {
  const link = `${BASE_URL}/verify-email/${token}`;
  await getTransporter().sendMail({
    from: `"VisionStick AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your VisionStick AI account',
    html: `<style>${emailStyle}</style>
      <body><div class="wrap">
        <div class="header"><h1>👁 VisionStick AI</h1><p>Smart Navigation Assistant</p></div>
        <div class="body">
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for creating your VisionStick AI account. Please verify your email address to get started.</p>
          <a href="${link}" class="btn">Verify Email Address →</a>
          <p>This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer"><p>© 2024 VisionStick AI. All rights reserved.</p></div>
      </div></body>`,
  });
  logger.info(`Verification email sent to ${email}`);
}

async function sendPasswordReset(email, name, token) {
  const link = `${BASE_URL}/reset-password/${token}`;
  await getTransporter().sendMail({
    from: `"VisionStick AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your VisionStick AI password',
    html: `<style>${emailStyle}</style>
      <body><div class="wrap">
        <div class="header"><h1>👁 VisionStick AI</h1><p>Password Reset</p></div>
        <div class="body">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password. Click the button below to choose a new one.</p>
          <a href="${link}" class="btn">Reset Password →</a>
          <p>This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore this email — your password will remain unchanged.</p>
        </div>
        <div class="footer"><p>© 2024 VisionStick AI. All rights reserved.</p></div>
      </div></body>`,
  });
  logger.info(`Password reset email sent to ${email}`);
}

async function sendWelcome(email, name) {
  await getTransporter().sendMail({
    from: `"VisionStick AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to VisionStick AI 👁',
    html: `<style>${emailStyle}</style>
      <body><div class="wrap">
        <div class="header"><h1>👁 VisionStick AI</h1><p>You're all set!</p></div>
        <div class="body">
          <h2>Welcome aboard, ${name}!</h2>
          <p>Your account is now verified and ready to use. VisionStick AI uses real-time AI detection to help you navigate safely.</p>
          <a href="${BASE_URL}/detect" class="btn">Start Navigation →</a>
        </div>
        <div class="footer"><p>© 2024 VisionStick AI. All rights reserved.</p></div>
      </div></body>`,
  });
}

module.exports = { sendVerification, sendPasswordReset, sendWelcome };
