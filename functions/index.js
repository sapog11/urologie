const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Gmail transporter configuration
// For production, use App Password if 2FA is enabled
// See: https://support.google.com/accounts/answer/185833
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'jekazorich@gmail.com',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic validation)
function isValidPhone(phone) {
  // Accept numbers, spaces, dashes, plus, parentheses
  const phoneRegex = /^[+\d\s\-()]{7,}$/;
  return phoneRegex.test(phone);
}

// Sanitize input to prevent injection
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().substring(0, 1000);
}

// Send appointment email
exports.sendAppointmentEmail = functions.https.onCall(async (data, context) => {
  // Optional: Check if user is authenticated
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  // }

  try {
    // Extract and validate input
    const name = sanitizeInput(data.name || '');
    const email = sanitizeInput(data.email || '');
    const phone = sanitizeInput(data.phone || '');
    const problem = sanitizeInput(data.problem || '');

    // Validate required fields
    if (!name || !email || !phone || !problem) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'All fields are required: name, email, phone, problem'
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid email format'
      );
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid phone format'
      );
    }

    // Get recipient email (configurable)
    const recipientEmail = process.env.APPOINTMENT_RECIPIENT || 'jekazorich@gmail.com';

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'jekazorich@gmail.com',
      to: recipientEmail,
      subject: `New Appointment Request from ${name}`,
      html: `
        <h2>New Appointment Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Problem Description:</strong></p>
        <p>${escapeHtml(problem).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Received: ${new Date().toISOString()}</em></p>
      `,
      replyTo: email,
      text: `
New Appointment Request

Name: ${name}
Email: ${email}
Phone: ${phone}

Problem Description:
${problem}

---
Received: ${new Date().toISOString()}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Log successful submission
    console.log(`Appointment email sent to ${recipientEmail} from ${email}`);

    return {
      success: true,
      message: 'Your appointment request has been sent successfully. We will contact you soon.',
    };
  } catch (error) {
    console.error('Error sending appointment email:', error);

    // Don't expose internal error details to client
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to send appointment request. Please try again later.'
    );
  }
});

// HTTP endpoint for form submissions (alternative to callable)
exports.appointmentForm = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, phone, problem } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !problem) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    // Validate email and phone
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        error: 'Invalid phone format',
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhone = sanitizeInput(phone);
    const sanitizedProblem = sanitizeInput(problem);

    const recipientEmail = process.env.APPOINTMENT_RECIPIENT || 'jekazorich@gmail.com';

    const mailOptions = {
      from: process.env.EMAIL_USER || 'jekazorich@gmail.com',
      to: recipientEmail,
      subject: `New Appointment Request from ${sanitizedName}`,
      html: `
        <h2>New Appointment Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(sanitizedName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(sanitizedPhone)}</p>
        <p><strong>Problem Description:</strong></p>
        <p>${escapeHtml(sanitizedProblem).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Received: ${new Date().toISOString()}</em></p>
      `,
      replyTo: sanitizedEmail,
    };

    await transporter.sendMail(mailOptions);

    console.log(`Appointment form submitted by ${sanitizedEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Appointment request sent successfully',
    });
  } catch (error) {
    console.error('Error processing appointment form:', error);
    return res.status(500).json({
      error: 'Failed to process appointment request',
    });
  }
});

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
