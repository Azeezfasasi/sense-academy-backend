const express = require('express');
const cartRouter = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');

//  GET /api/cart
cartRouter.get('/', authenticate, cartController.getCartItems);

//  POST /api/cart/add/:courseId
cartRouter.post('/add/:courseId', authenticate, cartController.addToCart);

//  DELETE /api/cart/:id
cartRouter.delete('/:courseId', authenticate, cartController.removeFromCart);

//  GET /api/cart/clear
cartRouter.delete('/clear', authenticate, cartController.clearCart);


module.exports = cartRouter;
