# MenCare Clinic - Appointment Form Setup Guide

This guide will help you set up the appointment booking form with Firebase Cloud Functions.

## Overview

The appointment booking system consists of:
1. **Frontend Modal Form** - Collects user information (name, email, phone, problem)
2. **Firebase Cloud Function** - Sends appointment emails to your inbox
3. **Multiple Language Support** - English, Russian, Czech, Ukrainian

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Node.js installed
- Gmail account with 2FA enabled (recommended)
- Firebase project already created (urologie-9b2bf)

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **urologie-9b2bf**
3. Click ⚙️ Settings → Project Settings
4. Scroll down to "Your apps" section
5. Look for the web app and copy the Firebase config object
6. Update `js/firebase-config.js` with the real values:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "urologie-9b2bf.firebaseapp.com",
     projectId: "urologie-9b2bf",
     storageBucket: "urologie-9b2bf.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

## Step 2: Set Up Gmail for Cloud Functions

### Option A: Gmail with 2FA (Recommended)

1. Go to [Google Account](https://myaccount.google.com)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Select "Mail" and "Windows Computer"
5. Google will generate a 16-character password
6. Copy this password

### Option B: Gmail without 2FA

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Less secure app access → Turn ON
3. Use your regular Gmail password

## Step 3: Deploy Cloud Functions

1. Navigate to the functions directory:
   ```bash
   cd functions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from template:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your Gmail credentials:
   ```
   EMAIL_USER=jekazorich@gmail.com
   EMAIL_PASSWORD=your_app_password_here
   APPOINTMENT_RECIPIENT=jekazorich@gmail.com
   ```

5. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

6. Wait for the deployment to complete. You should see:
   ```
   ✔  Deploy complete!
   ```

## Step 4: Update Firebaseconfig.js with Correct Values

Get your actual Firebase credentials:

1. Go to Firebase Console → Project Settings
2. Copy all config values
3. Update `js/firebase-config.js` with real values (not placeholders)

## Step 5: Deploy Website with Hosting

From the root directory:

```bash
firebase deploy --only hosting
```

## Step 6: Test the Form

1. Visit your website (https://urologie-9b2bf.web.app/)
2. Click "Записаться на приём" / "Book appointment" button
3. Fill in the form with test data
4. Click "Отправить" / "Send"
5. Check your email at jekazorich@gmail.com for the appointment request

### Expected Email Format

You'll receive an email with:
- Sender: Your configured EMAIL_USER
- Subject: "New Appointment Request from [Name]"
- Body contains: Name, Email, Phone, Problem description
- Reply-To: The user's email

## Step 7: Customize Email Recipient (Optional)

To change who receives appointment emails:

1. Go to Firebase Console → Functions
2. Find `sendAppointmentEmail` function
3. Click on it and go to Runtime settings
4. Update environment variable: `APPOINTMENT_RECIPIENT=new_email@example.com`
5. Or manually:
   ```bash
   firebase functions:config:set mencare.appointment_recipient="new_email@example.com"
   firebase deploy --only functions
   ```

## Future Migration to mencare.cz Domain

When you purchase mencare.cz domain:

1. Update DNS records to point to Firebase Hosting
2. Update Firebase hosting custom domain in console
3. Optionally update `APPOINTMENT_RECIPIENT` if using domain email
4. No code changes needed - everything is environment-based

## Troubleshooting

### "Failed to send email" Error

**Problem**: Form submission fails with email error

**Solutions**:
1. Check `.env` file exists in `functions/` directory
2. Verify `EMAIL_USER` matches the Gmail account
3. If using 2FA, make sure you're using App Password (not regular password)
4. Check Gmail security settings allow "Less secure apps" (if not using App Password)
5. Check Firebase logs: `firebase functions:log`

### "Firebase is not defined" Error

**Problem**: Modal appears but form doesn't submit

**Solutions**:
1. Check Firebase SDK loads in Network tab (Chrome DevTools)
2. Verify `firebase-config.js` has correct values
3. Check browser console for errors: F12 → Console tab

### Form Modal Doesn't Open

**Problem**: Clicking buttons doesn't show form

**Solutions**:
1. Check `js/form-handler.js` loads in Network tab
2. Check browser console for JavaScript errors
3. Verify HTML has `id="appointment-modal"` dialog element
4. Clear browser cache (Ctrl+Shift+Delete)

### Emails Not Received

**Problem**: Form submits successfully but no email arrives

**Solutions**:
1. Check spam/junk folder
2. Verify `APPOINTMENT_RECIPIENT` in Cloud Function config
3. Check Firebase logs for errors:
   ```bash
   firebase functions:log
   ```
4. Test with `firebase emulators:start` locally first

## Local Testing with Emulator

1. Install Firebase emulator (included with Firebase CLI)
2. In functions/ directory:
   ```bash
   firebase emulators:start
   ```
3. Open http://localhost:3000 (adjust port as shown)
4. Test form submissions locally
5. Emails won't actually send, but you'll see logs

## Files Modified/Created

### New Files:
- `functions/package.json` - Cloud Functions dependencies
- `functions/index.js` - Email sending logic
- `functions/.env.example` - Configuration template
- `functions/README.md` - Functions documentation
- `js/form-handler.js` - Form modal management
- `js/firebase-config.js` - Firebase initialization

### Modified Files:
- `index.html` - Added modal and buttons (Russian)
- `en/index.html` - Added modal and buttons (English)
- `cz/index.html` - Added modal and buttons (Czech)
- `ua/index.html` - Added modal and buttons (Ukrainian)
- `css/style.css` - Added modal styling
- `firebase.json` - Added functions configuration

## Security Notes

- All form inputs are validated server-side
- HTML content is escaped to prevent injection
- Phone and email formats are validated
- Input length limited to 1000 characters
- No sensitive data stored - direct email delivery only
- Environment variables never exposed to client

## Support

If you encounter issues:

1. Check the detailed logs:
   ```bash
   firebase functions:log
   ```

2. Check browser console (F12 → Console)

3. Verify all Firebase config values are correct

4. Make sure you're in the correct Firebase project:
   ```bash
   firebase use urologie-9b2bf
   ```

## What Users See

### Desktop:
- "Записаться" button in header/footer
- Floating CTA button in bottom right
- All buttons open same modal form

### Mobile:
- "Записаться" button in menu
- Floating CTA button
- Modal adapts to mobile screen

### Form Fields (All Validated):
1. **Name** - Required, text input
2. **Email** - Required, valid email format
3. **Phone** - Required, valid phone format
4. **Problem** - Required, minimum 10 characters

### User Experience:
1. Click button → Modal opens
2. Fill form → Submit button becomes active
3. Click submit → Loading state
4. Success → Green confirmation message, modal closes after 2 seconds
5. Error → Red error message, can retry

## Next Steps

1. Complete Step 1-5 above
2. Test the form thoroughly
3. Monitor `firebase functions:log` for issues
4. When domain is ready, update `APPOINTMENT_RECIPIENT`
5. Consider adding email templates for custom branding (future enhancement)
