const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Certificate = require("../models/Certificate");

const generateCertificate = async (req, res) => {
      try {
        const { userId, courseId } = req.body;

        const user = await Profile.findById(userId);
        const course = await Course.findById(courseId);
        if (!user || !course) {
            return res.status(404).json({ message: 'User or Course not found' });
        }
        // In real app, check if user is enrolled and has completed the course.

        const certificate = new Certificate({
            firstName: user.firstName,
            lastName: user.lastName,
            otherName: user.otherName,
            courseTitle: course.title,
            certificateDescription: `This is to certify that ${user.firstName} ${user.lastName} has successfully completed the course: ${course.title}`, // make this dynamic
            issueDate: new Date(),
            certificateSignature: 'Sense Academy Signature', //  from admin
            verifyLink: uuidv4(), // Generate a unique verification link/code
            user: userId,
        });

        await certificate.save();
        //send email
        const emailHtml = `
            <p>Your certificate is ready.  Here is the verification link:</p>
            <a href="http://yourdomain.com/api/certificate/verify/${certificate.verifyLink}">${certificate.verifyLink}</a>
        `;
        await sendEmail(user.email, 'Your Certificate is Ready', emailHtml);

        res.status(201).json({ message: 'Certificate generated successfully', certificate });
    } catch (error) {
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

  module.exports = { generateCertificate, verifyCertificate, createCertificateTemplate, deleteCertificateTemplate, updateCertificateTemplate };