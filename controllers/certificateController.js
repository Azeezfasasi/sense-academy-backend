const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Certificate = require("../models/Certificate");

const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificates = await Certificate.find({ user: userId });
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Debugging logs
    console.log('Request Body:', { userId, courseId });

    const user = await Profile.findById(userId);
    const course = await Course.findById(courseId).populate('progress.userId');

    // Debugging logs for fetched data
    console.log('Fetched User:', user);
    console.log('Fetched Course:', course);

    if (!user || !course) {
      return res.status(404).json({ message: 'User or Course not found' });
    }

    // Check if the user has purchased the course
    console.log('Enrolled Users:', course.enrolledUsers);
    if (!course.enrolledUsers.some((user) => user.toString() === userId)) {
      return res.status(403).json({ message: 'User has not purchased this course' });
    }

    // Check if the user has completed the course
    const userProgress = course.progress.find((p) => p.userId.toString() === userId);
    console.log('User Progress:', userProgress);

    if (!userProgress || userProgress.progressPercentage < 70) {
      return res.status(403).json({ message: 'User has not completed this course' });
    }

    const certificate = new Certificate({
      firstName: user.firstName,
      lastName: user.lastName,
      otherName: user.otherName,
      courseTitle: course.title,
      certificateDescription: `This is to certify that ${user.firstName} ${user.lastName} has successfully completed the course: ${course.title}`,
      issueDate: new Date(),
      certificateSignature: 'Sense Academy Signature',
      verifyLink: uuidv4(),
      user: userId,
    });

    // Debugging log for certificate data
    console.log('Certificate Data:', certificate);

    try {
      await certificate.save();
      console.log('Certificate saved successfully');
    } catch (saveError) {
      console.error('Error Saving Certificate:', saveError.message);
      return res.status(500).json({ message: 'Failed to save certificate' });
    }

    // Send email with the certificate verification link
    const emailHtml = `
      <p>Your certificate is ready. Here is the verification link:</p>
      <a href="http://yourdomain.com/api/certificates/verify/${certificate.verifyLink}">${certificate.verifyLink}</a>
    `;
    await sendEmail(user.email, 'Your Certificate is Ready', emailHtml);

    res.status(201).json({ message: 'Certificate generated successfully', certificate });
  } catch (error) {
    console.error('Error in generateCertificate:', error.message);
    res.status(500).json({ error: error.message });
  }
};
  
  const verifyCertificate = async (req, res) => {
      try {
        const { link } = req.params;
        const certificate = await Certificate.findOne({ verifyLink: link });
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }
        res.json({ message: 'Certificate verified successfully', certificate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };
  
  const createCertificateTemplate = async (req, res) => {
      try {
        //  would be an upload, or a form to design a template.  Not implemented in the description.
        res.status(501).json({ message: 'Not Implemented' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  const deleteCertificateTemplate = async (req, res) => {
    try {
      await Certificate.findByIdAndDelete(req.params.id);
      res.json({ message: "Template deleted" });
      res.status(501).json({ message: 'Not Implemented' });
  } catch (error) {
     res.status(500).json({ error: error.message });
 }
  };
  
  const updateCertificateTemplate = async (req, res) => {
    const updated = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  };

  module.exports = { getUserCertificates, generateCertificate, verifyCertificate, createCertificateTemplate, deleteCertificateTemplate, updateCertificateTemplate };