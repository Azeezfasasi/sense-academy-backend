const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const Certificate = require("../models/Certificate");
const Message = require("../models/Message");
const Assessment = require("../models/Assessment");
const Review = require("../models/Review");
const generateVerificationToken = () => {
  return uuidv4();
};

const sendEmail = async (to, subject, html) => {
  // Use a test account or your own configured email service.
  const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
          user: 'hayzedboy20@gmail.com',  // Replace with your email
          pass: 'Bridge@20', // Replace with your password.  Use an app password for gmail
      },
  });

  const mailOptions = {
      from: 'hayzedboy20@gmail.com', // Replace with your email
      to,
      subject,
      html,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
  } catch (error) {
      console.error('Error sending email:', error);
      throw error; // Re-throw to be caught by the caller
  }
};

  module.exports = {sendEmail, }