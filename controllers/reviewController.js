const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Review= require("../models/Review");
const Course = require('../models/Course');
const Profile = require('../models/Profile');

const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const courseId = req.params.courseId; // Use courseId from route params

    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const userId = req.user.id;

    // Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Create and save the new review
    const newReview = new Review({
      user: userId,
      course: courseId,
      rating,
      comment: review,
    });
    await newReview.save();

    // Add review ID to the course's reviews array
    course.reviews = course.reviews || []; // Initialize if undefined
    course.reviews.push(newReview._id);
    await course.save();

    res.status(201).json({ message: 'Review added successfully, pending approval', review: newReview });
  } catch (error) {
    console.error('Error in addReview:', error.message);
    res.status(500).json({ error: error.message });
  }
};
  
  const editReview = async (req, res) => {
    try {
      const { courseId, reviewId } = req.params;
      const { rating, comment } = req.body;
  
      // Ensure req.user exists
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      const userId = req.user.id;
      const userRole = req.user.role; 
  
      // Validate courseId and reviewId
      if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: 'Invalid course or review ID' });
      }
  
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      // Allow admins to edit any review, but restrict regular users
      if (userRole !== 'Admin' && review.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      // Update the review
      review.rating = rating;
      review.comment = comment;
      review.edited = true; // Optional: Add an edited flag
      await review.save();
  
      res.json({ message: 'Review edited successfully', review });
    } catch (error) {
      console.error('Error in editReview:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteReview = async (req, res) => {
    try {
      const { courseId, reviewId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
  
      const course = await Course.findById(courseId);
      if (!course) {
        console.log('Course not found');
        return res.status(404).json({ message: 'Course not found' });
      }
  
      const review = await Review.findById(reviewId);
      if (!review) {
        console.log('Review not found');
        return res.status(404).json({ message: 'Review not found' });
      }
  
      // Allow admins to delete any review, but restrict regular users
      if (userRole !== 'Admin' && review.user.toString() !== userId.toString()) {
        console.log('Unauthorized: User does not own the review');
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      // Remove the review reference from the course
      course.reviews = course.reviews.filter((r) => r.toString() !== reviewId);
      await course.save();
  
      // Delete the review document
      await review.deleteOne();
  
      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error in deleteReview:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
  const approveReview = async (req, res) => {
      try {
        const { courseId, reviewId } = req.params;
        const { approved } = req.body; // true or false
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const reviewIndex = course.reviews.findIndex(r => r._id.toString() === reviewId);
        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }
        course.reviews[reviewIndex].approved = approved;
        await course.save();
        res.json({ message: `Review ${approved ? 'approved' : 'disapproved'}`, review: course.reviews[reviewIndex] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };

const getCourseReviews = async (req, res) => {
    try {
      const courseId = req.params.courseId;
  
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ error: 'Invalid course ID' });
      }
  
      const reviews = await Review.find({ course: courseId }).populate('user', 'firstName lastName profileImage');

      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching course reviews:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const getUserReviews = async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
  
      // Populate the course field with the title and _id
      const reviews = await Review.find({ user: req.user.id }).populate('course', 'title _id');
      // console.log('Fetched User Reviews:', reviews);

      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const getAllReviews = async (req, res) => {
    try {
      const reviews = await Review.find().populate('course', 'title').populate('user', 'firstName lastName');
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching all reviews:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  
  module.exports = { addReview, editReview, deleteReview, approveReview, getCourseReviews, getUserReviews, getAllReviews, };