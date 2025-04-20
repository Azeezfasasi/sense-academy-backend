const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Course = require("../models/Course");
const cloudinary = require('../config/cloudinaryConfig');

const fetchAllCourses = async (req, res) => {
      try {
        const courses = await Course.find().populate('createdBy', 'firstName lastName'); // Populate creator's name
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: error.message });
    }
  };

  const fetchCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.params;
        
      // Validate courseId
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
  
      const course = await Course.findById(courseId)
        .select('-progress') // Remove -enrolledUsers to include the array
        .populate('createdBy', 'firstName lastName headline profileImage bio'); // Populate creator details
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Remove videoLink from lessons
      const sanitizedChapters = course.chapters.map((chapter) => ({
        ...chapter.toObject(),
        lessons: chapter.lessons.map(({ _id, title, duration }) => ({
          _id,
          title,
          duration,
        })),
      }));
  
      res.json({
        ...course.toObject(),
        chapters: sanitizedChapters,
        creator: course.createdBy, // Include the creator data in the response
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
      res.status(500).json({ error: error.message });
    }
  };

  const fetchPurchasedCourses = async (req, res) => {
    try {
      const userId = req.user.id; // Get the logged-in user's ID
      const courses = await Course.find({ enrolledUsers: userId }).populate('createdBy', 'firstName lastName'); // Fetch courses where the user is enrolled
  
      // Add progressPercentage and rating for each course
      const coursesWithProgress = courses.map((course) => {
        const userProgress = course.progress.find((p) => p.userId.toString() === userId);
        const progressPercentage = userProgress ? userProgress.progressPercentage : 0;
        return {
          ...course.toObject(),
          progressPercentage, // Include progress percentage
          rating: course.rating || 0, // Include rating
        };
      });
  
      res.json(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
      res.status(500).json({ error: error.message });
    }
  };

  const updatePurchasedCourses = async (req, res) => {
    try {
      const userId = req.user.id; 
      const { cartItems } = req.body;
      
      const updatePromises = cartItems.map((item) =>
        Course.findByIdAndUpdate(item.id, { $addToSet: { enrolledUsers: userId } })
      );
  
      await Promise.all(updatePromises);
  
      res.status(200).json({ message: 'Purchased courses updated successfully' });
    } catch (error) {
      console.error('Error updating purchased courses:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const fetchCoursesByInstructor = async (req, res) => {
      try {
        const { instructorId } = req.params;
        const courses = await Course.find({ createdBy: instructorId }).populate('createdBy', 'firstName lastName');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };

  const addNewCourse = async (req, res) => {
    try {
      console.log('Request Body:', req.body);
  
      const { 
        title, 
        subTitle, 
        description, 
        category, 
        duration, 
        video, 
        regularPrice, 
        discountedPrice, 
        level, 
        language, 
        introVideo,
        material, 
        chapters, // This will be a stringified JSON
      } = req.body;
  
      // Parse the chapters field from a string to an array
      let parsedChapters = [];
      try {
        parsedChapters = chapters ? JSON.parse(chapters) : [];
      } catch (error) {
        console.error('Error parsing chapters:', error);
        return res.status(400).json({ message: 'Invalid chapters format' });
      }
  
      const instructorId = req.user.id; // Get the authenticated user's ID
  
      // Upload introImage to Cloudinary
      let introImageUrl = '';
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'courses',
        });
        introImageUrl = result.secure_url; // Get the Cloudinary URL
      }
  
      const course = new Course({
        title,
        subTitle,
        description,
        category,
        duration,
        video,
        regularPrice,
        discountedPrice,
        level,
        language,
        introVideo,
        introImage: introImageUrl,
        material,
        chapters: parsedChapters, // Save the parsed chapters
        createdBy: instructorId, // Set the createdBy field
      });
  
      await course.save();
      res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  const editCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        subTitle,
        description,
        category,
        duration,
        video,
        regularPrice,
        discountedPrice,
        level,
        rating,
        language,
        introVideo,
        material,
        chapters, // This might be a stringified JSON
      } = req.body;
  
      // Parse the chapters field from a string to an array if it exists
      const parsedChapters = chapters ? JSON.parse(chapters) : undefined;
  
      // Handle introImage upload to Cloudinary if a new file is provided
      let introImageUrl = undefined;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'courses',
        });
        introImageUrl = result.secure_url; // Get the Cloudinary URL
      }
  
      // Build the update object dynamically
      const updateData = {
        title,
        subTitle,
        description,
        category,
        duration,
        video,
        regularPrice,
        discountedPrice,
        level,
        rating,
        language,
        introVideo,
        material,
      };
  
      // Add parsed chapters if provided
      if (parsedChapters) {
        updateData.chapters = parsedChapters;
      }
  
      // Add introImage URL if a new image was uploaded
      if (introImageUrl) {
        updateData.introImage = introImageUrl;
      }
  
      // Update the course in the database
      const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true });
  
      if (!updatedCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ error: error.message });
    }
  };

  const editCoursesByInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subTitle, description, category, duration, video, regularPrice, discountedPrice, level, rating, language, introVideo, introImage, material, chapters } = req.body;
        //  get user id from req.user
        const instructorId = req.user.id;
        const course = await Course.findOne({ _id: id, createdBy: instructorId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found or you are not the creator' });
        }
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { title, subTitle, description, category, duration, video, regularPrice, discountedPrice, level, rating, language, introVideo, introImage, material, chapters },
            { new: true }
        );

        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  
  const deleteCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCourse = await Course.findByIdAndDelete(id);
      if (!deletedCourse) {
          return res.status(404).json({ message: 'Course not found' });
      }
      res.json({ message: 'Course deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };

  const deleteCoursesByInstructor = async (req, res) => {
    try {
        const { id } = req.params;
         //  get user id from req.user
        const instructorId = req.user.id;
        const course = await Course.findOne({ _id: id, createdBy: instructorId });
         if (!course) {
            return res.status(404).json({ message: 'Course not found or you are not the creator' });
        }
        const deletedCourse = await Course.findByIdAndDelete(id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  
  const assignCourseToUsers = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { userIds } = req.body; // Array of user IDs
       // Input validation: Check if userIds is an array
      if (!Array.isArray(userIds)) {
          return res.status(400).json({ message: 'Invalid input: userIds must be an array' });
      }

      const course = await Course.findById(courseId);
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }

      //  check if users exist
      const users = await Profile.find({ _id: { $in: userIds } });
      if (users.length !== userIds.length) {
           return res.status(400).json({ message: 'One or more user IDs are invalid' });
      }
      // Add users to the course's enrolledUsers array, avoiding duplicates
      userIds.forEach(userId => {
          if (!course.enrolledUsers.includes(userId)) {
              course.enrolledUsers.push(userId);
          }
      });
      await course.save();
      res.json({ message: 'Course assigned to users successfully', course });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const changeCourseStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Pending', 'Approved', 'Published'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
      }

      const updatedCourse = await Course.findByIdAndUpdate(
          id,
          { status },
          { new: true }
      );

      if (!updatedCourse) {
          return res.status(404).json({ message: 'Course not found' });
      }
      res.json(updatedCourse);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const viewEnrolledUsers = async (req, res) => {
    try {
      const { courseId } = req.params;
      const course = await Course.findById(courseId).populate('enrolledUsers', 'firstName lastName email'); // Populate user details
      if (!course) {
          return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course.enrolledUsers);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const approveCourses = async (req, res) => {
      try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({ message: 'Course not found' });
        }
        course.status = 'Approved';
        await course.save();
        res.json({ message: 'Course approved successfully', course });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };


  const updateLessonProgress = async (req, res) => {
    try {
      const { courseId } = req.params;
      const { lessonId } = req.body; // Lesson ID to mark as completed
      const userId = req.user.id;
  
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
  
      // Ensure the user is enrolled in the course
      if (!course.enrolledUsers.includes(userId)) {
        return res.status(403).json({ message: "You are not enrolled in this course" });
      }
  
      // Find or create the user's progress record
      let userProgress = course.progress.find((p) => p.userId.toString() === userId);
      if (!userProgress) {
        userProgress = {
          userId,
          completedLessons: [],
          progressPercentage: 0,
        };
        course.progress.push(userProgress);
      }
  
      // Mark the lesson as completed
      if (!userProgress.completedLessons.includes(lessonId)) {
        userProgress.completedLessons.push(lessonId);
      }
  
      // Calculate the progress percentage
      const totalLessons = course.chapters.reduce(
        (total, chapter) => total + chapter.lessons.length,
        0
      );
      userProgress.progressPercentage = ((userProgress.completedLessons.length / totalLessons) * 100).toFixed(2);
  
      await course.save();
  
      res.status(200).json({
        message: "Lesson progress updated successfully",
        progress: userProgress,
      });
    } catch (error) {
      console.error("Error updating lesson progress:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const getUserProgress = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
  
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
  
      // Find the user's progress
      const userProgress = course.progress.find((p) => p.userId.toString() === userId);
      if (!userProgress) {
        return res.status(404).json({ message: "No progress found for this user" });
      }
  
      res.status(200).json(userProgress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ error: error.message });
    }
  };  
  
  module.exports = {fetchAllCourses, fetchCourseDetails, fetchPurchasedCourses, updatePurchasedCourses, fetchCoursesByInstructor, addNewCourse, editCourses, editCoursesByInstructor, deleteCourses, deleteCoursesByInstructor, assignCourseToUsers, changeCourseStatus, viewEnrolledUsers, approveCourses, updateLessonProgress, getUserProgress };