const express = require('express');
const reviewRouter = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// GET /api/reviews/courses/:courseId/reviews
reviewRouter.get('/courses/:courseId/reviews', reviewController.getCourseReviews);

// POST /api/reviews/courses/:courseId/reviews
reviewRouter.post('/courses/:courseId/reviews', authenticate, reviewController.addReview);

// PUT /api/reviews/courses/:courseId/reviews/:reviewId
reviewRouter.put('/courses/:courseId/reviews/:reviewId', authenticate, authorize('Admin'), reviewController.editReview);

// DELETE /api/reviews/courses/:courseId/reviews/:reviewId
reviewRouter.delete('/courses/:courseId/reviews/:reviewId', authenticate, authorize('Admin'), reviewController.deleteReview);

// PUT /api/reviews/courses/:courseId/reviews/:reviewId/approve
reviewRouter.put('/courses/:courseId/reviews/:reviewId/approve', authenticate, authorize('Admin'), reviewController.approveReview);

module.exports = reviewRouter;