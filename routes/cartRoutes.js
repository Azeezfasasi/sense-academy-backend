const express = require('express');
const cartRouter = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');
// const authorize = require('../middlewares/roleMiddleware');

//  POST /api/cart/add
cartRouter.post('/add', authenticate, cartController.addToCart);

//  GET /api/cart
cartRouter.get('/', authenticate, cartController.getCartItems);

//  DELETE /api/cart/:id
cartRouter.delete('/:id', authenticate, cartController.removeFromCart);

module.exports = cartRouter;
