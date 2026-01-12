const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middlewares/authMiddleware');
const {
    previewData,
    createEndpoint,
    listEndpoints,
    deleteEndpoint,
    regenerateApiKey,
    fetchData,
    getApiKey,
    changePassword
} = require('../Controllers/DeveloperController');

/**
 * Developer Routes
 * Base path: /api/dev
 */

// Protected routes (require login as developer)
router.post('/preview', protect, authorize('developer', 'admin'), previewData);
router.post('/endpoints', protect, authorize('developer', 'admin'), createEndpoint);
router.get('/endpoints', protect, authorize('developer', 'admin'), listEndpoints);
router.delete('/endpoints/:id', protect, authorize('developer', 'admin'), deleteEndpoint);
router.post('/regenerate-key', protect, authorize('developer', 'admin'), regenerateApiKey);
router.get('/api-key', protect, authorize('developer', 'admin'), getApiKey);
router.put('/change-password', protect, authorize('developer', 'admin'), changePassword);

// Public route (uses API key for auth)
router.get('/data/:slug', fetchData);

module.exports = router;
