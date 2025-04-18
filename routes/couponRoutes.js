const express = require('express');
const couponRouter = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// POST /api/coupons
couponRouter.post('/', authenticate, authorize('Admin'), couponController.createCoupon);

// GET /api/coupons
couponRouter.get('/', couponController.getAllCoupons);

// POST /api/coupons/apply
couponRouter.post('/apply', authenticate, couponController.applyCoupon);

// PUT /api/coupons/:id
couponRouter.put('/:id', authenticate, authorize('Admin'), couponController.updateCoupon);

// DELETE /api/coupons/:id
couponRouter.delete('/:id', authenticate, authorize('Admin'), couponController.deleteCoupon);

// POST /api/coupons/validate
couponRouter.post('/validate', authenticate, couponController.validateCoupon);

// PATCH /api/coupons/:id/disable
couponRouter.patch('/:id/disable', authenticate, authorize('Admin'), couponController.disableCoupon);

module.exports = couponRouter;
