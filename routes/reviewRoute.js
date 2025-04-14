const express = require('express');
const reviewRouter = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// POST
reviewRouter.post('/api/courses/:courseId/reviews', authenticate, reviewController.addReview);
reviewRouter.put('/api/courses/:courseId/reviews/:reviewId', authenticate, reviewController.editReview);
reviewRouter.delete('/api/courses/:courseId/reviews/:reviewId', authenticate, reviewController.deleteReview);
reviewRouter.put('/api/courses/:courseId/reviews/:reviewId/approve', authenticate, authorize('Admin'), reviewController.approveReview);
reviewRouter.get('/api/courses/:courseId/reviews', reviewController.getCourseReviews); //get approved reviews for a course

module.exports = reviewRouter;