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
        const { code } = req.params;
        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };


  const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
         //  get user id from req.user
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate('courses');
        if (!cart) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        const coupon = await Coupon.findOne({ code });
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        if (coupon.expiryDate && coupon.expiryDate < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon has reached its usage limit' });
        }
         // Check if the coupon applies to any of the courses in the cart
        let applicableCourses = cart.courses.filter(course =>
            coupon.courses.length === 0 || coupon.courses.some(c => c._id.toString() === course._id.toString())
        );

        if (applicableCourses.length === 0) {
             if (coupon.courses.length > 0){
                return res.status(400).json({ message: 'Coupon is not applicable to any course in your cart' });
             }
        }
        let totalDiscount = 0;
        applicableCourses.forEach(course => {
            if (coupon.type === 'Percentage') {
                totalDiscount += course.regularPrice * (coupon.discount / 100);
            } else if (coupon.type === 'Fixed') {
              totalDiscount += coupon.discount;
            }
        });
        coupon.usedCount += 1;
        await coupon.save();
        res.json({ message: 'Coupon applied successfully', discount: totalDiscount, cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  
  const deleteCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        const deletedCoupon = await Coupon.findOneAndDelete({ code });
        if (!deletedCoupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon deleted successfully' });
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
  
  module.exports = {createCoupon, getAllCoupons, applyCoupon, deleteCoupon, validateCoupon  }