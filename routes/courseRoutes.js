const express = require('express');
const courseRouter = express.Router();
const courseController = require('../controllers/courseController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

courseRouter.post('/add', authenticate, authorize('Admin', 'Instructor'), upload.single('introImage'), courseController.addNewCourse);

courseRouter.put('/:id', authenticate, authorize('Admin'), upload.single('introImage'), courseController.editCourses);

//  GET /api/courses
courseRouter.get('/', courseController.fetchAllCourses);

// GET /api/courses/purchased
courseRouter.get('/purchased', authenticate, courseController.fetchPurchasedCourses);

// POST /api/courses/purchase
courseRouter.post('/purchase', authenticate, courseController.updatePurchasedCourses);

//  GET /api/courses/instructor/:id
courseRouter.get('/instructor/:id', courseController.fetchCoursesByInstructor);

//  PUT /api/courses/:id
courseRouter.put('/:id', authenticate, authorize('Admin'), courseController.editCourses);

//  PUT /api/courses/instructor/:id
courseRouter.put('/instructor/:id', authenticate, authorize('Instructor'), courseController.editCoursesByInstructor);

//  DELETE /api/courses/:id
courseRouter.delete('/:id', authenticate, authorize('Admin'), courseController.deleteCourses);

//  DELETE /api/courses/instructor/:id
courseRouter.delete('/instructor/:id', authenticate, authorize('Instructor'), courseController.deleteCoursesByInstructor);

//  POST /api/courses/assign
courseRouter.post('/assign', authenticate, authorize('Admin'), courseController.assignCourseToUsers);

//  PATCH /api/courses/status/:id
courseRouter.patch('/status/:id', authenticate, authorize('Admin', 'Instructor'), courseController.changeCourseStatus);

//  GET /api/courses/enrolled/:courseId
courseRouter.get('/enrolled/:courseId', authenticate, authorize('Admin', 'Instructor'), courseController.viewEnrolledUsers);

//  POST /api/courses/add
courseRouter.post('/add', authenticate, authorize('Admin', 'Instructor'), courseController.addNewCourse);

//  POST /api/courses/approve/:id
courseRouter.post('/approve/:id', authenticate, authorize('Admin'), courseController.approveCourses);

courseRouter.post('/:courseId/progress', authenticate, courseController.updateLessonProgress);

module.exports = courseRouter;
