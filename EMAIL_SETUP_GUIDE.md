# Email Setup Guide for E-Commerce Platform

## Overview

This e-commerce platform now includes NodeMailer integration for sending emails, including:
- Password reset emails
- Welcome emails for new users
- Email verification (ready for implementation)

## Current Status

✅ **Email functionality is implemented and ready to use**
⚠️ **Email sending is currently disabled due to missing SMTP configuration**

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env` file in your root directory (or update the existing one) with the following email configuration:

```bash
# Email Configuration (NodeMailer)
SMTP_HOST=smtp.gmail.com          # Your SMTP server host
SMTP_PORT=587                     # Usually 587 for TLS, 465 for SSL
SMTP_USER=your_email@gmail.com    # Your email address
SMTP_PASS=your_app_password       # Your email app password (not regular password)
SMTP_FROM_NAME=Your Store Name    # Display name for emails
SMTP_FROM_EMAIL=noreply@yourstore.com  # Sender email address

# Client URL (for email links)
CLIENT_URL=http://localhost:5000  # Your production domain in production
```

### 2. Gmail Setup (Recommended for Development)

If using Gmail:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account Settings
   - Navigate to "Security"
   - Under "Signing in to Google", click "App passwords"
   - Generate a new app password for "Mail"
   - Use this 16-character password as your `SMTP_PASS`

3. **Configure Environment**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=yourgmail@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM_NAME=Your E-Commerce Store
   SMTP_FROM_EMAIL=noreply@yourstore.com
   ```

### 3. Alternative Email Providers

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=youremail@outlook.com
SMTP_PASS=your-app-password
```

## Features Implemented

### 1. Password Reset Emails
- **Endpoint**: `POST /api/auth/forgot-password`
- **Trigger**: User clicks "Forgot password?" on login page
- **Email Content**: Professional HTML email with reset link
- **Security**: 1-hour token expiry, single-use tokens

### 2. Welcome Emails
- **Trigger**: Automatically sent when user signs up
- **Email Content**: Welcome message with call-to-action
- **Async**: Doesn't block user registration

### 3. Email Templates
- **Professional Design**: Clean, responsive HTML templates
- **Brand Colors**: Uses your store's color scheme
- **Mobile Friendly**: Responsive design for all devices

## Testing

### Test Password Reset Flow

1. **Navigate to Login Page**: `http://localhost:5000/auth`
2. **Click "Forgot password?"**
3. **Enter Email Address**: Use a valid email you can access
4. **Check Email**: Look for password reset email
5. **Click Reset Link**: Should redirect to password reset form
6. **Set New Password**: Complete the reset process

### Test Welcome Email

1. **Navigate to Signup Page**: `http://localhost:5000/auth`
2. **Create New Account**: Use a valid email address
3. **Check Email**: Look for welcome email in inbox

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables**:
   ```bash
   # Verify your .env file has all required variables
   cat .env | grep SMTP_
   ```

2. **Check Server Logs**:
   ```bash
   # Look for email-related messages
   npm run dev
   # Look for: "✅ Email transporter verified successfully"
   ```

3. **Test Email Configuration**:
   ```bash
   # Test the endpoint manually
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com"}'
   ```

### Common Issues

1. **Gmail Authentication Failed**:
   - Ensure you're using an app password, not your regular password
   - Check if 2FA is enabled on your account

2. **Port Blocked**:
   - Try different ports: 587 (TLS), 465 (SSL), 25 (unencrypted)
   - Check firewall settings

3. **Email in Spam**:
   - Check spam/junk folders
   - Add sender to contacts
   - Use a custom domain for better deliverability

## Security Best Practices

1. **Use App Passwords**: Never use your main email password
2. **Environment Variables**: Never commit email credentials to code
3. **Rate Limiting**: Email endpoints are rate-limited to prevent abuse
4. **Token Expiry**: Reset tokens expire after 1 hour
5. **Single Use**: Reset tokens can only be used once

## Production Considerations

1. **Custom Domain**: Use your business domain for better deliverability
2. **SPF/DKIM Records**: Set up proper DNS records for email authentication
3. **Email Service**: Consider using dedicated email services (SendGrid, Mailgun)
4. **Monitoring**: Set up email delivery monitoring
5. **Templates**: Customize email templates to match your brand

## Next Steps

1. **Configure Email**: Set up your SMTP credentials in `.env`
2. **Test Functionality**: Verify password reset and welcome emails work
3. **Customize Templates**: Modify email templates in `/server/email.ts`
4. **Add More Features**: Order confirmations, shipping notifications, etc.

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify your email provider settings
3. Test with different email providers
4. Ensure firewall/antivirus isn't blocking SMTP connections