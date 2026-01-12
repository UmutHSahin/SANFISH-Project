const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middlewares/authMiddleware');
const {
  getAllUsers,
  getUserById,
  getUserFishData,
  createUser,
  updateUser,
  deleteUser,
  getAllFish,
  getAdminStats,
  // New settings controllers
  getSystemSettings,
  updateSystemSettings,
  changeAdminPassword,
  exportUsers,
  exportFishData
} = require('../Controllers/AdminController');

/**
 * Admin Routes
 * All routes are protected and require admin role
 * Base path: /api/admin
 */

// Dashboard statistics
router.get('/stats', protect, authorize('admin'), getAdminStats);

// User management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.get('/users/:id', protect, authorize('admin'), getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Get fish data submitted by specific user
router.get('/users/:id/fish', protect, authorize('admin'), getUserFishData);


// Fish data management (system-wide)
router.get('/fish', protect, authorize('admin'), getAllFish);

// ===================================
// System Settings & Tools
// ===================================

// Settings
router.get('/settings', protect, authorize('admin'), getSystemSettings);
router.put('/settings', protect, authorize('admin'), updateSystemSettings);

// Security
router.put('/change-password', protect, authorize('admin'), changeAdminPassword);

// Data Export
router.get('/export/users', protect, authorize('admin'), exportUsers);
router.get('/export/fish', protect, authorize('admin'), exportFishData);

module.exports = router;

