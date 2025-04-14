const express = require('express');
const wishlistRouter = express.Router();
const wishlistController = require('../controllers/wishlistController');

// POST /api/wishlist/add
wishlistRouter.post('/add', wishlistController.addToWishlist);

// GET /api/wishlist
wishlistRouter.get('/', wishlistController.getWishlistItems);

// DELETE /api/wishlist/:id
wishlistRouter.delete('/:id', wishlistController.removeFromWishlist);

module.exports = wishlistRouter;