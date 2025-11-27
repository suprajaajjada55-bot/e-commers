import { createTransport } from 'nodemailer';

// Create a transporter using environment variables
const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

// Verify the transporter configuration
export async function verifyTransporter() {
  try {
    // Skip verification if no auth credentials are provided
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('⚠️  Email transporter: No SMTP credentials configured, email functionality disabled');
      return false;
    }
    
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetLink: string, userName: string = 'User') {
  // Check if email is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Email not configured - password reset email not sent');
    return false;
  }
  
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Your Store'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #ff6b35; }
            .content { margin-bottom: 30px; }
            .button { display: inline-block; background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${process.env.SMTP_FROM_NAME || 'Your Store'}</div>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Your Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #ff6b35;">${resetLink}</p>
              
              <div class="warning">
                <strong>Important:</strong>
                <ul>
                  <li>This link expires in 1 hour for security reasons</li>
                  <li>If you didn't request this password reset, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || 'Your Store'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${userName},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

Important:
- This link expires in 1 hour for security reasons
- If you didn't request this password reset, please ignore this email
- Never share this link with anyone

This is an automated message. Please do not reply to this email.

© ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || 'Your Store'}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, userName: string = 'User') {
  // Check if email is configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Email not configured - welcome email not sent');
    return false;
  }
  
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Your Store'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Our Store!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #ff6b35; }
            .content { margin-bottom: 30px; }
            .button { display: inline-block; background-color: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${process.env.SMTP_FROM_NAME || 'Your Store'}</div>
            </div>
            
            <div class="content">
              <h2>Welcome, ${userName}!</h2>
              <p>Thank you for creating an account with us. We're excited to have you as part of our community!</p>
              <p>Start exploring our amazing products and enjoy your shopping experience.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}" class="button">Start Shopping</a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
              <p>&copy; ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || 'Your Store'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome, ${userName}!

Thank you for creating an account with us. We're excited to have you as part of our community!

Start exploring our amazing products and enjoy your shopping experience.

Visit us at: ${process.env.CLIENT_URL || 'http://localhost:5000'}

© ${new Date().getFullYear()} ${process.env.SMTP_FROM_NAME || 'Your Store'}
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
}

export default transporter;