const express = require('express');
const assessmentRouter = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// POST /api/assessments
assessmentRouter.post('/', authenticate, authorize('Instructor', 'Admin'), assessmentController.createAssessment);

//  GET /api/assessments/:assessmentId
assessmentRouter.get('/:assessmentId', authenticate, assessmentController.getAssessmentById);

//  GET /api/courses/:courseId/assessments
assessmentRouter.get('/:courseId/assessments', authenticate, assessmentController.getAssessmentsByCourse);

//  PUT /api/assessments/:assessmentId
assessmentRouter.put('/:assessmentId', authenticate, authorize('Instructor', 'Admin'), assessmentController.editAssessment);

//  DELETE /api/assessments/:assessmentId
assessmentRouter.delete('/:assessmentId', authenticate, authorize('Instructor', 'Admin'), assessmentController.deleteAssessment);

//  POST /api/assessments/:assessmentId/submit
assessmentRouter.post('/:assessmentId/submit', authenticate, assessmentController.submitAssessment);

module.exports = assessmentRouter;