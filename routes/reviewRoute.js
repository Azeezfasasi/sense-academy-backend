const express = require('express');
const reviewRouter = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// GET /api/reviews/courses/:courseId/reviews
reviewRouter.get('/courses/:courseId/reviews', reviewController.getCourseReviews);

// GET /api/reviews/user
reviewRouter.get('/user', authenticate, reviewController.getUserReviews);

// POST /api/reviews/courses/:courseId/reviews
reviewRouter.post('/courses/:courseId/reviews', authenticate, reviewController.addReview);

// PUT /api/reviews/courses/:courseId/reviews/:reviewId
reviewRouter.put('/courses/:courseId/reviews/:reviewId', authenticate, authorize('Admin', 'Student', 'Instructor'), reviewController.editReview);

// DELETE /api/reviews/courses/:courseId/reviews/:reviewId
reviewRouter.delete('/courses/:courseId/reviews/:reviewId', authenticate, authorize('Admin'), reviewController.deleteReview);

// PUT /api/reviews/courses/:courseId/reviews/:reviewId/approve
reviewRouter.put('/courses/:courseId/reviews/:reviewId/approve', authenticate, authorize('Admin'), reviewController.approveReview);

// GET /api/reviews/courses/all
reviewRouter.get('/courses/all', authenticate, authorize('Admin'), reviewController.getAllReviews);

module.exports = reviewRouter;