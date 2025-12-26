const express = require('express');
const router = express.Router();
const { createPaper, getPapers, getAnalytics } = require('../controllers/paperController');

router.post('/', createPaper);
router.post('/library', getPapers);
router.get('/analytics', getAnalytics);

module.exports = router;
