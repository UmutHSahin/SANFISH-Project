// routes/fishDataRoutes.js
const express = require('express');
const router = express.Router();
const fishDataController = require('../Controllers/fishDataController');
const { validateBulkFishDataCreation } = require('../Middlewares/bulkFishDataValidation');
const { protect } = require('../Middlewares/authMiddleware'); // Kimlik doğrulama middleware'i

/**
 * @route   POST /api/fish-data/create-with-all-data
 * @desc    Balık + Lokasyon + Hastalıklar + Images (base64) toplu kayıt
 * @access  Private
 */
router.post(
  '/create-with-all-data',
  protect, // Kullanıcı giriş yapmış olmalı
  fishDataController.createFishDataWithAllData
);

/**
 * @route   POST /api/fish-data/:id/add-diseases
 * @desc    Mevcut balığa yeni hastalık ekle
 * @access  Private
 */
router.post(
  '/:id/add-diseases',
  protect,
  fishDataController.addDiseasesToFishData
);

// Export Routes
router.get('/export/csv', protect, fishDataController.exportFishDataCSV);
router.get('/export/pdf', protect, fishDataController.exportFishDataPDF);

// Diğer standart route'lar...
router.get('/', protect, fishDataController.getAllFishData);
router.get('/:id', protect, fishDataController.getFishDataById);
router.put('/:id', protect, fishDataController.updateFishData);
router.delete('/:id', protect, fishDataController.deleteFishData);

module.exports = router;