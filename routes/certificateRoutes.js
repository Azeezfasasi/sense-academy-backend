const express = require('express');
const certificateRouter = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate } = require('../middlewares/authMiddleware');
const authorize = require('../middlewares/roleMiddleware');

// POST /api/certificates/generate
certificateRouter.post('/generate', authenticate, certificateController.generateCertificate);

// GET /api/certificates/user
certificateRouter.get('/user', authenticate, certificateController.getUserCertificates);

// POST /api/certificates/verify/:link
certificateRouter.post('/verify/:link', certificateController.verifyCertificate);

// POST /api/certificates/template
certificateRouter.post('/template', authenticate, authorize('Admin'), certificateController.createCertificateTemplate);

// DELETE /api/certificates/template/:id
certificateRouter.delete('/template/:id', authenticate, authorize('Admin'), certificateController.deleteCertificateTemplate);

// PUT /api/certificates/template/:id
certificateRouter.put('/template/:id', authenticate, authorize('Admin'), certificateController.updateCertificateTemplate);

module.exports = certificateRouter;