const express = require('express');
const router = express.Router();
const partnerController = require('../Controllers/partnerController');
const { protect } = require('../Middlewares/authMiddleware');

/**
 * Partner Profile Routes
 * All routes require authentication and partner role
 */

// Get partner profile
router.get('/profile', protect, partnerController.getPartnerProfile);

// Update partner profile
router.put('/profile', protect, partnerController.updatePartnerProfile);

// Complete first login (sets first_login_completed = true)
router.post('/complete-first-login', protect, partnerController.completeFirstLogin);

module.exports = router;
