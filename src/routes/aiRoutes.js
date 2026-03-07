const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate-reply', aiController.generateReply);

module.exports = router;
