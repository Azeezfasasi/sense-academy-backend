const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Coupon = require('../models/Coupon');

const createCoupon = async (req, res) => {
      try {
        const { code, discount, type, expiryDate, usageLimit, usedCount, isActive, courses } = req.body;
        const coupon = new Coupon({
            code,
            discount,
            type,
            expiryDate,
            usageLimit,
            courses,
            usedCount,
            isActive,
        });
        await coupon.save();
        res.status(201).json({ message: 'Coupon created successfully', coupon });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
const getAllCoupons = async (req, res) => {
    try {
      const coupons = await Coupon.find(); // Fetch all coupons
      res.status(200).json(coupons);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch coupons' });
    }
  };

const applyCoupon = async (req, res) => {
  try {
    const { code, cartItems } = req.body; // Get coupon code and cart items from the request body

    // Log the incoming request for debugging
    console.log('Applying coupon:', code, 'with cart items:', cartItems);
    console.log('Request body:', req.body);
    console.log('Coupon code:', code);
    console.log('Cart items:', cartItems);

    // Fetch the coupon
    const coupon = await Coupon.findOne({ code }); // Ensure code is a string
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if the coupon is active
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is not active' });
    }

    // Check if the coupon has expired
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if the coupon has reached its usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check if the coupon applies to any courses in the cart
    const applicableCourses = cartItems.filter((item) =>
      coupon.courses.length === 0 || coupon.courses.some((c) => c.toString() === item._id)
    );

    if (applicableCourses.length === 0) {
      return res.status(400).json({ message: 'Coupon is not applicable to any course in your cart' });
    }

    // Calculate the total discount
    let totalDiscount = 0;
    applicableCourses.forEach((course) => {
      if (coupon.type === 'Percentage') {
        totalDiscount += course.regularPrice * (coupon.discount / 100);
      } else if (coupon.type === 'Fixed') {
        totalDiscount += coupon.discount;
      }
    });

    // Increment the coupon's used count
    coupon.usedCount += 1;
    await coupon.save();

    // Respond with the discount and applicable courses
    res.json({ message: 'Coupon applied successfully', discount: totalDiscount, applicableCourses });
  } catch (error) {
    console.error('Error applying coupon:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updatedData, { new: true }); // Update the coupon
    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update coupon', error: error.message });
  }
};
  
  const deleteCoupon = async (req, res) => {
    try {
      const { id } = req.params; // Get the coupon ID from the route parameters
      const deletedCoupon = await Coupon.findByIdAndDelete(id); // Delete the coupon by ID
      if (!deletedCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      res.json({ message: 'Coupon deleted successfully', coupon: deletedCoupon });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const validateCoupon = async (req, res) => {
    try {
      const { code } = req.body;
      const coupon = await Coupon.findOne({ code });
      if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
      res.status(200).json(coupon);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const disableCoupon = async (req, res) => {
    try {
      const { id } = req.params; // Get the coupon ID from the route parameters
  
      const disabledCoupon = await Coupon.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true } // Return the updated document
      );
  
      if (!disabledCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
  
      res.status(200).json({ message: 'Coupon disabled successfully', coupon: disabledCoupon });
    } catch (error) {
      res.status(500).json({ message: 'Failed to disable coupon', error: error.message });
    }
  };
  
  module.exports = {createCoupon, getAllCoupons, applyCoupon, updateCoupon, deleteCoupon, validateCoupon, disableCoupon  }