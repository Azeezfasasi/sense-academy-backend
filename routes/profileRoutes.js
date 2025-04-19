const express = require('express');
const profileRouter = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

profileRouter.put('/me', authenticate, upload.single('profileImage'), profileController.editCurrentUser);

profileRouter.post('/upload/image', authenticate, upload.single('image'), profileController.uploadImage);

profileRouter.post('/upload/video', authenticate, upload.single('video'), profileController.uploadVideo);

// POST /api/profile/register
profileRouter.post('/register', profileController.register);

// POST /api/profile/login
profileRouter.post('/login', profileController.login);

// POST /api/profile/forgot-password
profileRouter.post('/forgot-password', profileController.forgotPassword);

// POST /api/profile/reset-password
profileRouter.post('/reset-password', profileController.resetPassword);

// GET /api/profile/users
profileRouter.get('/users', authenticate, authorize('Admin'), profileController.fetchAllUsers);

// GET /api/profile/counts
profileRouter.get('/counts', authenticate, authorize('Admin'), profileController.fetchRoleCounts);

// GET /api/profile/me
profileRouter.get('/me', authenticate, profileController.getCurrentUser);

// PUT /api/profile/me
profileRouter.put('/me', authenticate, profileController.editCurrentUser);

// DELETE /api/profile/:id
profileRouter.delete('/:id', authenticate, authorize('Admin'), profileController.deleteUsers);

// PUT /api/profile/:id
profileRouter.put('/:id', authenticate, authorize('Admin'), profileController.updateUsers);

// PATCH /api/profile/role/:id
profileRouter.patch('/role/:id', authenticate, authorize('Admin'), profileController.changeUserRole);

// PATCH /api/profile/disable/:id
profileRouter.patch('/disable/:id', authenticate, authorize('Admin'), profileController.disableUsers);

// POST /api/profile/add
profileRouter.post('/add', authenticate, authorize('Admin'), profileController.addUsers);

module.exports = profileRouter;

