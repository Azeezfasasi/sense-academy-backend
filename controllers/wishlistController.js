const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Wishlist = require("../models/Wishlist");

const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
     //  get user id from req.user
     const userId = req.user.id;
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: 'Course not found' });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
        wishlist = new Wishlist({ user: userId, courses: [courseId] });
    } else {
         if (!wishlist.courses.includes(courseId)) {
            wishlist.courses.push(courseId);
        } else {
            return res.status(200).json({ message: 'Course already in wishlist' });
        }
    }
    await wishlist.save();
    res.status(201).json({ message: 'Course added to wishlist', wishlist });
} catch (error) {
    res.status(500).json({ error: error.message });
}
  };
  
  const getWishlistItems = async (req, res) => {
        try {
          //  get user id from req.user
        const userId = req.user.id;
        const wishlist = await Wishlist.findOne({ user: userId }).populate('courses');
        if (!wishlist) {
            return res.status(200).json({ message: 'Wishlist is empty', courses: [] });
        }
        res.json(wishlist.courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
  const removeFromWishlist = async (req, res) => {
        try {
          const { courseId } = req.params;
          //  get user id from req.user
          const userId = req.user.id;
          let wishlist = await Wishlist.findOne({ user: userId });
          if (!wishlist) {
              return res.status(404).json({ message: 'Wishlist not found' });
          }
          wishlist.courses = wishlist.courses.filter(id => id.toString() !== courseId);
          await wishlist.save();
          res.json({ message: 'Course removed from wishlist', wishlist });
      } catch (error) {
          res.status(500).json({ error: error.message });
      }
  };

  const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const wishlist = await Wishlist.findOneAndRemove({ user: userId });
         if (!wishlist) {
             return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.json({ message: 'Wishlist cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { addToWishlist, getWishlistItems, removeFromWishlist, clearWishlist };