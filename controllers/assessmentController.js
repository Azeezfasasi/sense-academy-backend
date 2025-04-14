const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Assessment = require("../models/Assessment");

const createAssessment = async (req, res) => {
      try {
        const { courseId, title, questions, passingScore, dueDate, attemptsAllowed } = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const assessment = new Assessment({
            course: courseId,
            title,
            questions,
            passingScore,
            dueDate,
            attemptsAllowed,
        });
        await assessment.save();
        res.status(201).json({ message: 'Assessment created successfully', assessment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };

  const getAssessmentById = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const assessment = await Assessment.findById(assessmentId).populate('course', 'title');
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAssessmentsByCourse = async (req, res) => {
  try {
      const { courseId } = req.params;
      const assessments = await Assessment.find({ course: courseId });
      res.json(assessments);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const editAssessment = async (req, res) => {
  try {
      const { assessmentId } = req.params;
      const { title, questions, passingScore, dueDate, attemptsAllowed } = req.body;
      const updatedAssessment = await Assessment.findByIdAndUpdate(
          assessmentId,
          { title, questions, passingScore, dueDate, attemptsAllowed },
          { new: true }
      );
      if (!updatedAssessment) {
          return res.status(404).json({ message: 'Assessment not found' });
      }
      res.json(updatedAssessment);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const deleteAssessment = async (req, res) => {
  try {
      const { assessmentId } = req.params;
      const deletedAssessment = await Assessment.findByIdAndDelete(assessmentId);
      if (!deletedAssessment) {
          return res.status(404).json({ message: 'Assessment not found' });
      }
      res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

const submitAssessment = async (req, res) => {
  try {
      const { assessmentId } = req.params;
      const { answers } = req.body;  // { questionId: answer, ... }
       //  get user id from req.user
      const userId = req.user.id;

      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
          return res.status(404).json({ message: 'Assessment not found' });
      }
       //  check if user has already submitted.  -- simplified, you might want to track attempts
      //  For simplicity,  I am not creating a new model for tracking submissions.
      const userProfile = await Profile.findById(userId);
      if (userProfile.submissions && userProfile.submissions[assessmentId]){
           return res.status(400).json({ message: 'You have already submitted this assessment' });
      }

      let score = 0;
      assessment.questions.forEach(question => {
          const userAnswer = answers[question._id];  // Get the user's answer
          if (userAnswer && userAnswer === question.correctAnswer) {
              score++;
          }
      });
      const percentage = (score / assessment.questions.length) * 100;

      const passed = percentage >= assessment.passingScore;
       // Store the result
       if (!userProfile.submissions){
           userProfile.submissions = {};
       }
      userProfile.submissions[assessmentId] = {
          score: percentage,
          passed: passed,
          submissionDate: new Date()
      }
      await userProfile.save();
      res.json({
          message: passed ? 'Assessment passed' : 'Assessment failed',
          score: percentage,
          passed,
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

  module.exports = { createAssessment, getAssessmentById, getAssessmentsByCourse, editAssessment, deleteAssessment, submitAssessment, };