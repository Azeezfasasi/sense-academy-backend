const cloudinary = require('../config/cloudinaryConfig');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const multer = require('multer');
const path = require('path');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    const result = await cloudinary.uploader.upload(req.file.buffer, {
      folder: 'profile_images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      resource_type: 'image' ,
      upload_preset: 'sense'
    });

    res.status(200).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image to Cloudinary' });
  }
};

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided.' });
    }

    const result = await cloudinary.uploader.upload(req.file.buffer, {
      resource_type: 'video',
      folder: 'profile_videos', // Optional: Specify a folder
      allowed_formats: ['mp4', 'mov', 'avi', 'webm'], // Optional: Allowed video formats
    });

    res.status(200).json({
      message: 'Video uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary video upload error:', error);
    res.status(500).json({ message: 'Failed to upload video to Cloudinary' });
  }
};

const register = async (req, res) => {
    try {
      const { email, password, firstName, lastName, } = req.body;
      const existing = await Profile.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already exists" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await Profile.create({ ...req.body, password: hashedPassword });
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Profile.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
      if (user.disabled) {
        return res.status(403).json({ message: 'Account is disabled. Please contact an administrator.' });
    }
      // const token = jwt.sign({ id: user._id, role: user.role }, "SECRET", { expiresIn: "7d" });
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.status(200).json({ token, user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const profile = await Profile.findOne({ email });

      if (!profile) {
          return res.status(404).json({ message: 'Email not found.' });
      }

      const resetToken = generateVerificationToken();  // Reuse the function.
      profile.resetToken = resetToken;
      profile.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
      await profile.save();

      // Send reset password email
      const resetLink = `http://yourdomain.com/api/profile/reset-password/${resetToken}`; // Change this
      const emailHtml = `
          <p>Please click the following link to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
      `;
      await sendEmail(email, 'Reset your password', emailHtml);

      res.json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const profile = await Profile.findOne({
          resetToken: token,
          resetTokenExpiry: { $gt: Date.now() },
      });

      if (!profile) {
          return res.status(400).json({ message: 'Invalid or expired reset token.' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      profile.password = hashedPassword;
      profile.resetToken = undefined; // Clear the tokens
      profile.resetTokenExpiry = undefined;
      await profile.save();

      res.json({ message: 'Password reset successfully.' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const fetchAllUsers = async (req, res) => {
      try {
        const users = await Profile.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };

  const fetchRoleCounts = async (req, res) => {
    try {
        const adminCount = await Profile.countDocuments({ role: 'Admin' });
        const instructorCount = await Profile.countDocuments({ role: 'Instructor' });
        const studentCount = await Profile.countDocuments({ role: 'Student' });

        res.status(200).json({
            admins: adminCount,
            instructors: instructorCount,
            students: studentCount,
        });
    } catch (error) {
        console.error('Error fetching role counts:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

  const getCurrentUser = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await Profile.findById(userId).select('-password'); // exclude password from the response
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };  
  
const editCurrentUser = async (req, res) => {
  try {
      const userId = req.user.id;
      const { firstName, lastName, otherName, email, headline, bio, phoneNumber, language, socialLinks, country } = req.body;
      let profileImage = req.body.profileImage;

      if (req.file) {
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        try {
            const result = await cloudinary.uploader.upload(base64Image, {
                resource_type: 'image'
            });
            profileImage = result.secure_url;
            console.log("Cloudinary Upload Result (Base64):", result);
        } catch (cloudinaryError) {
            console.error("Cloudinary Upload Error (Base64):", cloudinaryError);
            return res.status(500).json({ error: 'Failed to upload image to Cloudinary (base64)' });
        }
    }

      const updatedProfile = await Profile.findByIdAndUpdate(
          userId,
          { firstName, lastName, otherName, email, headline, bio, phoneNumber, language, socialLinks, profileImage, country },
          { new: true }
      );

      if (!updatedProfile) {
          return res.status(404).json({ message: 'Profile not found' });
      }
      res.json(updatedProfile);
  } catch (error) {
      console.error('Error updating profile with image:', error);
      res.status(500).json({ error: error.message });
  }
};

  const deleteUsers = async (req, res) => {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized action' });
      }

      const { id } = req.params;
      const deletedUser = await Profile.findByIdAndDelete(id);
      if (!deletedUser) {
          return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const updateUsers = async (req, res) => {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized action' });
      }

      const { id } = req.params;
      const { firstName, lastName, otherName, headline, bio, email, phoneNumber, language, socialLinks, profileImage, country } = req.body;

      const updatedProfile = await Profile.findByIdAndUpdate(
          id,
          { firstName, lastName, otherName, headline, bio, email, phoneNumber, language, socialLinks, profileImage, country },
          { new: true } // Return the updated document
      );

      if (!updatedProfile) {
          return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json(updatedProfile);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const changeUserRole = async (req, res) => {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
      const { id } = req.params;
      const { role } = req.body;

      if (!['Admin', 'Student', 'Instructor'].includes(role)) {
          return res.status(400).json({ message: 'Invalid role' });
      }

      const updatedProfile = await Profile.findByIdAndUpdate(
          id,
          { role },
          { new: true }
      );

      if (!updatedProfile) {
          return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedProfile);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const disableUsers = async (req, res) => {
    try {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized action' });
      }

      const { id } = req.params;
      const { disabled } = req.body;

      const updatedProfile = await Profile.findByIdAndUpdate(
          id,
          { disabled },
          { new: true }
      );

      if (!updatedProfile) {
          return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: `User ${disabled ? 'disabled' : 'enabled'} successfully` });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const addUsers = async (req, res) => {
    try {
      const { firstName, lastName, email, password, role } = req.body;
       const hashedPassword = await bcrypt.hash(password, 10);
      const profile = new Profile({
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: role
      });
      await profile.save();
      res.status(201).json({ message: 'User created successfully', profile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };

  module.exports = {register, login, forgotPassword, resetPassword, fetchAllUsers, getCurrentUser, editCurrentUser, deleteUsers, updateUsers, changeUserRole, disableUsers, addUsers, fetchRoleCounts, uploadImage, uploadVideo };


