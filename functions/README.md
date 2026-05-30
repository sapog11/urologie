# MenCare Clinic - Firebase Cloud Functions

This directory contains the Firebase Cloud Functions for the MenCare clinic website appointment booking system.

## Setup Instructions

### 1. Install Dependencies

From the `functions/` directory:

```bash
npm install
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values:
   - `EMAIL_USER`: Your Gmail address (should match `APPOINTMENT_RECIPIENT` or be the sender)
   - `EMAIL_PASSWORD`: Gmail App Password (not your regular password)
   - `APPOINTMENT_RECIPIENT`: Email address where appointment requests should be sent

### 3. Gmail App Password Setup

If you have 2FA enabled on your Gmail account:

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Generate the app password
4. Use this password in your `.env` file as `EMAIL_PASSWORD`

### 4. Local Testing with Firebase Emulator

```bash
firebase emulators:start --only functions
```

This will start the local emulator on `http://localhost:5001`

### 5. Deploy to Firebase

```bash
firebase deploy --only functions
```

## Function Details

### `sendAppointmentEmail` (Callable)

- **Endpoint**: Cloud Function
- **Method**: Called from client-side JavaScript
- **Parameters**:
  - `name`: Appointment requester's name
  - `email`: Appointment requester's email
  - `phone`: Appointment requester's phone number
  - `problem`: Description of the problem/reason for appointment

- **Returns**: Success/error message

### `appointmentForm` (HTTP)

- **Endpoint**: HTTP POST
- **Method**: Alternative endpoint for form submissions
- **Headers**: Content-Type: application/json
- **Body**: JSON with same parameters as callable function
- **Returns**: JSON response with success/error

## Future Migration to mencare.cz

When you purchase the mencare.cz domain:

1. Update `APPOINTMENT_RECIPIENT` in `.env`
2. Optionally update `EMAIL_USER` if you set up a dedicated email for the clinic
3. Re-deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

No code changes needed - just environment variables.

## Email Sending Details

- **Service**: Gmail (nodemailer)
- **Template**: HTML formatted email with all form fields
- **Reply-To**: Set to the appointment requester's email
- **Subject**: "New Appointment Request from [Name]"

## Security Notes

- All inputs are validated and sanitized server-side
- HTML content is escaped to prevent injection
- Phone and email formats are validated
- All fields are required
- Input length is limited to 1000 characters

## Troubleshooting

### "Failed to send email" error

Check:
1. `EMAIL_USER` and `EMAIL_PASSWORD` are correct
2. If using Gmail 2FA, make sure you're using an App Password, not your regular password
3. Less Secure App Access is enabled (if not using App Password)

### Function not found

Make sure you've deployed:
```bash
firebase deploy --only functions
```

### Local testing issues

Clear the emulator state:
```bash
firebase emulators:start --only functions --import=none
```
