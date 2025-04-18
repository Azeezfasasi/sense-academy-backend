const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Cart = require("../models/Review");

const addReview = async (req, res) => {
      try {
        const { courseId, rating, review } = req.body;
        //  get user id from req.user
        const userId = req.user.id;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // In a real application, you might want to check if the user is enrolled in the course

        const newReview = {
            user: userId,
            rating,
            review,
            approved: false, // Initial status, needs admin approval
        };

        course.reviews = course.reviews || [];  // Initialize if undefined
        course.reviews.push(newReview);
        await course.save();

        res.status(201).json({ message: 'Review added successfully, pending approval', review: newReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
  const editReview = async (req, res) => {
      try {
        const { courseId, reviewId } = req.params;
        const { rating, review } = req.body;
        //  get user id from req.user
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const reviewIndex = course.reviews.findIndex(r => r._id.toString() === reviewId);
        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }
        // Only allow the user who wrote the review to edit it
        if (course.reviews[reviewIndex].user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        course.reviews[reviewIndex].rating = rating;
        course.reviews[reviewIndex].review = review;
        course.reviews[reviewIndex].edited = true;  // add edited flag
        await course.save();

        res.json({ message: 'Review edited successfully', review: course.reviews[reviewIndex] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
  const deleteReview = async (req, res) => {
      try {
        const { courseId, reviewId } = req.params;
        //  get user id from req.user
        const userId = req.user.id;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const reviewIndex = course.reviews.findIndex(r => r._id.toString() === reviewId);
        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found' });
        }
        // Only allow the user who wrote the review to delete it
        if (course.reviews[reviewIndex].user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        course.reviews.splice(reviewIndex, 1);
        await course.save();
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
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
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        // Filter only approved reviews and populate user details
        const approvedReviews = course.reviews.filter(review => review.approved);
        await Course.populate(approvedReviews, { path: 'user', select: 'firstName lastName' });  // Populate user
        res.json(approvedReviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  
  module.exports = { addReview, editReview, deleteReview, approveReview, getCourseReviews };