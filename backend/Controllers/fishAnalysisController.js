const mongoose = require('mongoose');
const FishAnalysis = require('../Models/FishAnalysis');
const FishData = require('../Models/FishData');

/**
 * Balığa yeni analiz ekle
 * POST /api/fish-data/:fishId/analyses
 */
exports.addAnalysisToFish = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fishId } = req.params;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            await session.abortTransaction();
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulama gerekli. Lütfen giriş yapın.'
            });
        }

        // Balık verisini kontrol et
        const fishData = await FishData.findById(fishId);
        if (!fishData) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Balık verisi bulunamadı.'
            });
        }

        // Yetki kontrolü - sadece kendi balığına veya admin ekleyebilir
        if (authenticatedUser.role !== 'admin' && fishData.user_id.toString() !== authenticatedUser._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: 'Bu balığa analiz ekleme yetkiniz yok.'
            });
        }

        const {
            analysis_type,
            test_name,
            test_code,
            value,
            unit,
            reference_range,
            result_status,
            laboratory,
            sample_date,
            analysis_date,
            methodology,
            notes,
            attachments
        } = req.body;

        // Zorunlu alan kontrolü
        if (!analysis_type || !test_name || value === undefined || !unit) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Analiz türü, test adı, değer ve birim zorunludur.'
            });
        }

        // Yeni analiz oluştur
        const analysisDoc = new FishAnalysis({
            fish_data_id: fishId,
            analysis_type,
            test_name,
            test_code,
            value,
            unit,
            reference_range: reference_range || {},
            result_status: result_status || 'normal',
            laboratory: laboratory || {},
            sample_date,
            analysis_date,
            methodology,
            notes,
            attachments: attachments || [],
            recorded_by: authenticatedUser._id
        });

        await analysisDoc.save({ session });

        // Balık verisine analiz ID'sini ekle
        fishData.analysis_ids.push(analysisDoc._id);
        await fishData.save({ session });

        await session.commitTransaction();

        // Populate ederek döndür
        const populatedAnalysis = await FishAnalysis.findById(analysisDoc._id)
            .populate('recorded_by', 'first_name last_name mail');

        res.status(201).json({
            success: true,
            message: 'Analiz başarıyla eklendi.',
            data: populatedAnalysis
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('❌ Analiz ekleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Analiz eklenirken bir hata oluştu.',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};

/**
 * Balığın tüm analizlerini getir
 * GET /api/fish-data/:fishId/analyses
 */
exports.getAnalysesByFish = async (req, res) => {
    try {
        const { fishId } = req.params;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulama gerekli.'
            });
        }

        // Balık verisini kontrol et
        const fishData = await FishData.findById(fishId);
        if (!fishData) {
            return res.status(404).json({
                success: false,
                message: 'Balık verisi bulunamadı.'
            });
        }

        // Yetki kontrolü
        if (authenticatedUser.role !== 'admin' && fishData.user_id.toString() !== authenticatedUser._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bu balığın analizlerini görüntüleme yetkiniz yok.'
            });
        }

        const analyses = await FishAnalysis.find({ fish_data_id: fishId })
            .populate('recorded_by', 'first_name last_name mail')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: analyses.length,
            data: analyses
        });

    } catch (error) {
        console.error('❌ Analizleri getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Analizler alınırken bir hata oluştu.',
            error: error.message
        });
    }
};

/**
 * Tek bir analizi getir
 * GET /api/analyses/:analysisId
 */
exports.getAnalysisById = async (req, res) => {
    try {
        const { analysisId } = req.params;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulama gerekli.'
            });
        }

        const analysis = await FishAnalysis.findById(analysisId)
            .populate('fish_data_id')
            .populate('recorded_by', 'first_name last_name mail');

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analiz bulunamadı.'
            });
        }

        // Yetki kontrolü
        const fishData = await FishData.findById(analysis.fish_data_id);
        if (authenticatedUser.role !== 'admin' && fishData.user_id.toString() !== authenticatedUser._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bu analizi görüntüleme yetkiniz yok.'
            });
        }

        res.status(200).json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('❌ Analiz getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Analiz alınırken bir hata oluştu.',
            error: error.message
        });
    }
};

/**
 * Analiz güncelle
 * PUT /api/analyses/:analysisId
 */
exports.updateAnalysis = async (req, res) => {
    try {
        const { analysisId } = req.params;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulama gerekli.'
            });
        }

        const analysis = await FishAnalysis.findById(analysisId);
        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analiz bulunamadı.'
            });
        }

        // Yetki kontrolü
        const fishData = await FishData.findById(analysis.fish_data_id);
        if (authenticatedUser.role !== 'admin' && fishData.user_id.toString() !== authenticatedUser._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Bu analizi güncelleme yetkiniz yok.'
            });
        }

        // Güncellenebilir alanlar
        const allowedUpdates = [
            'analysis_type', 'test_name', 'test_code', 'value', 'unit',
            'reference_range', 'result_status', 'laboratory',
            'sample_date', 'analysis_date', 'methodology', 'notes', 'attachments'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                analysis[field] = req.body[field];
            }
        });

        await analysis.save();

        const updatedAnalysis = await FishAnalysis.findById(analysisId)
            .populate('recorded_by', 'first_name last_name mail');

        res.status(200).json({
            success: true,
            message: 'Analiz başarıyla güncellendi.',
            data: updatedAnalysis
        });

    } catch (error) {
        console.error('❌ Analiz güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Analiz güncellenirken bir hata oluştu.',
            error: error.message
        });
    }
};

/**
 * Analiz sil
 * DELETE /api/analyses/:analysisId
 */
exports.deleteAnalysis = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { analysisId } = req.params;
        const authenticatedUser = req.user;

        if (!authenticatedUser) {
            await session.abortTransaction();
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulama gerekli.'
            });
        }

        const analysis = await FishAnalysis.findById(analysisId);
        if (!analysis) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Analiz bulunamadı.'
            });
        }

        // Yetki kontrolü
        const fishData = await FishData.findById(analysis.fish_data_id);
        if (authenticatedUser.role !== 'admin' && fishData.user_id.toString() !== authenticatedUser._id.toString()) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: 'Bu analizi silme yetkiniz yok.'
            });
        }

        // Balık verisinden analiz ID'sini kaldır
        fishData.analysis_ids = fishData.analysis_ids.filter(
            id => id.toString() !== analysisId
        );
        await fishData.save({ session });

        // Analizi sil
        await FishAnalysis.findByIdAndDelete(analysisId, { session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Analiz başarıyla silindi.'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('❌ Analiz silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Analiz silinirken bir hata oluştu.',
            error: error.message
        });
    } finally {
        session.endSession();
    }
};
