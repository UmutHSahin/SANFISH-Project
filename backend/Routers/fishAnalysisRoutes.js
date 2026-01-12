const express = require('express');
const router = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const {
    addAnalysisToFish,
    getAnalysesByFish,
    getAnalysisById,
    updateAnalysis,
    deleteAnalysis
} = require('../Controllers/fishAnalysisController');

/**
 * Fish Analysis Routes
 * Balık analizi (lab sonuçları) için CRUD işlemleri
 */

// Balığa analiz ekle
// POST /api/fish-data/:fishId/analyses
router.post('/fish-data/:fishId/analyses', protect, addAnalysisToFish);

// Balığın tüm analizlerini getir
// GET /api/fish-data/:fishId/analyses
router.get('/fish-data/:fishId/analyses', protect, getAnalysesByFish);

// Tek bir analizi getir
// GET /api/analyses/:analysisId
router.get('/analyses/:analysisId', protect, getAnalysisById);

// Analiz güncelle
// PUT /api/analyses/:analysisId
router.put('/analyses/:analysisId', protect, updateAnalysis);

// Analiz sil
// DELETE /api/analyses/:analysisId
router.delete('/analyses/:analysisId', protect, deleteAnalysis);

module.exports = router;
