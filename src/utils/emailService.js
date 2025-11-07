const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"MahaYatra Bus Booking" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email - MahaYatra",
      html: `<h1>Email Setup Successful!</h1><p>Your Nodemailer configuration is working correctly</p>`
    });
    console.log("Test email sent:", info.messageId);
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

const sendBookingConfirmation = async (booking, user) => {
  try {
    const mailOptions = {
      from: `"MahaYatra Bus Booking" <${process.env.EMAIL_USER}>`,
      to: booking.contactEmail,
      subject: `Booking Confirmed - PNR: ${booking.pnr}`,
      html: `<h1>Booking Confirmed!</h1>`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: `"MahaYatra Bus Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Reset your password: ${resetUrl}</p>`
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendBookingConfirmation,
  sendPasswordResetEmail,
  sendTestEmail
};