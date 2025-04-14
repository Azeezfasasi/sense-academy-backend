const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Cart = require("../models/Cart");

const addToCart = async (req, res) => {
      try {
        const { courseId } = req.params;
        //  get user id from req.user
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, courses: [courseId] });
        } else {
            // Check if the course is already in the cart
            if (!cart.courses.includes(courseId)) {
                cart.courses.push(courseId);
            } else {
                return res.status(200).json({ message: 'Course already in cart' });
            }
        }
        await cart.save();
        res.status(201).json({ message: 'Course added to cart', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
  const getCartItems = async (req, res) => {
        try {//  get user id from req.user
          const userId = req.user.id;
          const cart = await Cart.findOne({ user: userId }).populate('courses'); // Populate the courses in the cart
          if (!cart) {
              return res.status(200).json({ message: 'Cart is empty', courses: [] }); // Return empty cart
          }
          res.json(cart.courses);
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  };
  
  const removeFromCart = async (req, res) => {
      try {
        const { courseId } = req.params;
        //  get user id from req.user
        const userId = req.user.id;
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        // Use filter to create a new array without the specified courseId
        cart.courses = cart.courses.filter(id => id.toString() !== courseId);
        await cart.save();
        res.json({ message: 'Course removed from cart', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };

  const clearCart = async (req, res) => {
    try {
         //  get user id from req.user
         const userId = req.user.id;
        const cart = await Cart.findOneAndRemove({ user: userId });
        if (!cart) {
             return res.status(404).json({ message: 'Cart not found' });
        }
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

  module.exports = {addToCart, getCartItems, removeFromCart, clearCart, }