const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Course = require("../models/Course");

const fetchAllCourses = async (req, res) => {
      try {
        const courses = await Course.find().populate('createdBy', 'firstName lastName'); // Populate creator's name
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
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
      const { title, subTitle, description, category, duration, video, regularPrice, discountedPrice, level, rating, language, introVideo, introImage, material, chapters } = req.body;
       //  get user id from req.user
      const instructorId = req.user.id;
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
          rating,
          language,
          introVideo,
          introImage,
          material,
          chapters,
          createdBy: instructorId,
      });
      await course.save();
      res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
  };
  
  const editCourses = async (req, res) => {
      try {
        const { id } = req.params;
        const { title, subTitle, description, category, duration, video, regularPrice, discountedPrice, level, rating, language, introVideo, introImage, material, chapters } = req.body;
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            { title, subTitle, description, category, duration, video, regularPrice, discountedPrice, level, rating, language, introVideo, introImage, material, chapters },
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
  
  
  module.exports = {fetchAllCourses, fetchCoursesByInstructor, addNewCourse, editCourses, editCoursesByInstructor, deleteCourses, deleteCoursesByInstructor, assignCourseToUsers, changeCourseStatus, viewEnrolledUsers, approveCourses, };