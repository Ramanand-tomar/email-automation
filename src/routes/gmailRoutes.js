const express = require('express');
const router = express.Router();
const gmailController = require('../controllers/gmailController');

router.get('/emails', gmailController.getEmails);
router.get('/emails/:id', gmailController.getEmailById);
router.get('/threads/:id', gmailController.getThreadById);
router.post('/emails/:id/reply', gmailController.replyToEmail);
router.post('/send', gmailController.sendEmail);
router.post('/modify/:id', gmailController.modifyEmail);
router.delete('/emails/:id', gmailController.deleteEmail);

module.exports = router;
