const mongoose = require('mongoose');
const FishData = require('../Models/FishData');
const FishDisease = require('../Models/FishDiseases');
const FishSpecies = require('../Models/FishSpecies');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');

/**
 * Kullanıcı tek formda tüm bilgileri girer ve toplu kayıt yapar
 * POST /api/fish-data/create-with-all-data
 */
exports.createFishDataWithAllData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Debug logging for file uploads
    console.log('📥 Incoming request:');
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   Files received:', req.files ? req.files.length : 'none');
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, i) => console.log(`   File ${i}:`, file.filename, file.size + ' bytes'));
    }
    console.log('   Body keys:', Object.keys(req.body));

    // Get authenticated user from middleware
    const authenticatedUser = req.user; // Comes from auth middleware

    if (!authenticatedUser) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    // Parse body data - when using FormData, nested objects come as JSON strings
    let bodyData = req.body;
    if (typeof req.body.data === 'string') {
      bodyData = JSON.parse(req.body.data);
    }

    const {
      // Ana balık verisi
      species_id,
      fish_name,
      common_name,
      scientific_name,
      catch_date,
      catch_details,
      physical_characteristics,
      notes,

      // Lokasyon verisi (artık FishData içinde)
      location,

      // Hastalık verileri (array)
      diseases,

      // Image data (base64)
      newImages,
      existingImages
    } = bodyData;

    // Process images - combine existing and new base64 images
    let imageUrls = [];
    if (existingImages && existingImages.length > 0) {
      imageUrls = [...existingImages];
    }
    if (newImages && newImages.length > 0) {
      imageUrls = [...imageUrls, ...newImages];
      console.log('📷 New base64 images added:', newImages.length);
    }

    // ===============================
    // 1. ZORUNLU ALAN KONTROLLERI
    // ===============================
    if (!species_id) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Balık türü seçilmelidir.'
      });
    }

    if (!catch_date) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Yakalama tarihi zorunludur.'
      });
    }

    if (!location) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Lokasyon bilgisi zorunludur.'
      });
    }

    // ===============================
    // 2. SPECIES KONTROLÜ
    // ===============================
    let speciesExists;
    try {
      speciesExists = await FishSpecies.findById(species_id);
    } catch (err) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Geçersiz tür ID formatı.',
        error: err.message
      });
    }

    if (!speciesExists) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Seçilen balık türü bulunamadı. Lütfen önce bir tür ekleyin.'
      });
    }

    // ===============================
    // 3. KOORDINAT KONTROLÜ (Opsiyonel ama önerilir)
    // ===============================
    if (location.coordinates) {
      const { latitude, longitude } = location.coordinates;

      if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Geçersiz enlem değeri (-90 ile 90 arasında olmalı).'
        });
      }

      if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Geçersiz boylam değeri (-180 ile 180 arasında olmalı).'
        });
      }
    }

    // ===============================
    // 4. FISH DATA OLUŞTUR (Lokasyon dahil)
    // ===============================
    const fishDataDoc = new FishData({
      user_id: authenticatedUser._id,           // Automatically set from authenticated user
      submitted_by: authenticatedUser._id,       // Automatically set from authenticated user
      submitted_by_role: authenticatedUser.role, // Automatically set user role
      species_id,
      disease_ids: [], // Şimdilik boş, sonra eklenecek
      fish_name,
      common_name,
      scientific_name,
      catch_date,
      catch_details,
      physical_characteristics,
      location: {
        location_name: location.location_name,
        coordinates: location.coordinates || {},
        location_type: location.location_type || 'ocean',
        water_conditions: location.water_conditions || {},
        environmental_data: location.environmental_data || {},
        region: location.region,
        country: location.country,
        recorded_at: location.recorded_at || new Date()
      },
      images: imageUrls,
      notes,
      analysis_ids: [], // Lab analizleri sonradan eklenecek
      status: req.body.status || 'active' // Support draft status from request
    });

    await fishDataDoc.save({ session });
    console.log('✅ Fish Data oluşturuldu:', fishDataDoc._id);

    // ===============================
    // 5. HASTALIKLARI OLUŞTUR (Toplu)
    // ===============================
    let createdDiseases = [];

    if (diseases && diseases.length > 0) {
      // Hastalık verilerini kontrol et
      for (let i = 0; i < diseases.length; i++) {
        const disease = diseases[i];
        if (!disease.disease_name) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Hastalık #${i + 1} için hastalık adı zorunludur.`
          });
        }
      }

      const diseasePromises = diseases.map(diseaseData => {
        const diseaseDoc = new FishDisease({
          fish_data_id: fishDataDoc._id,
          disease_name: diseaseData.disease_name,
          disease_code: diseaseData.disease_code,
          severity: diseaseData.severity || 'medium',
          detected_date: diseaseData.detected_date || new Date(),
          detection_method: diseaseData.detection_method,
          symptoms: diseaseData.symptoms || [],
          treatment: diseaseData.treatment || {},
          status: diseaseData.status || 'active',
          images: diseaseData.images || [],
          lab_results: diseaseData.lab_results || {}
        });

        return diseaseDoc.save({ session });
      });

      createdDiseases = await Promise.all(diseasePromises);
      console.log(`✅ ${createdDiseases.length} hastalık kaydı oluşturuldu`);

      // ===============================
      // 6. FISH DATA'YA DISEASE ID'LERİ EKLE
      // ===============================
      fishDataDoc.disease_ids = createdDiseases.map(d => d._id);
      await fishDataDoc.save({ session });
      console.log('✅ Fish Data güncellendi (disease_ids eklendi)');
    }

    // ===============================
    // 7. TRANSACTION'I TAMAMLA
    // ===============================
    await session.commitTransaction();
    session.endSession(); // End session immediately after commit

    // ===============================
    // 8. POPULATE EDEREK DÖNÜŞ YAP (Outside transaction)
    // ===============================
    try {
      const populatedFishData = await FishData.findById(fishDataDoc._id)
        .populate('species_id', 'scientific_name common_name family genus species')
        .populate('disease_ids')
        .populate({
          path: 'user_id',
          select: 'first_name last_name mail role'
        })
        .populate({
          path: 'submitted_by',
          select: 'first_name last_name mail role'
        });

      res.status(201).json({
        success: true,
        message: 'Balık verisi tüm detaylarıyla başarıyla oluşturuldu.',
        data: {
          fish_data: populatedFishData,
          summary: {
            fish_data_id: fishDataDoc._id,
            location: populatedFishData.location,
            diseases_count: createdDiseases.length,
            disease_ids: createdDiseases.map(d => d._id)
          }
        }
      });
    } catch (populateError) {
      console.error('❌ Error populating data:', populateError);
      // Data is saved, just return without full population
      res.status(201).json({
        success: true,
        message: 'Balık verisi başarıyla kaydedildi (bazı ilişkili veriler yüklenemedi).',
        data: {
          fish_data: fishDataDoc,
          summary: {
            fish_data_id: fishDataDoc._id,
            diseases_count: createdDiseases.length,
            disease_ids: createdDiseases.map(d => d._id)
          }
        }
      });
    }
    return; // Exit here to avoid the catch block

  } catch (error) {
    // Hata durumunda tüm işlemleri geri al
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error('❌ Error aborting transaction:', abortError.message);
    }

    console.error('❌ Transaction hatası:', error);
    console.error('Error stack:', error.stack);

    // Check for specific MongoDB errors
    let errorMessage = 'Balık verisi kaydedilirken bir hata oluştu.';

    if (error.name === 'ValidationError') {
      errorMessage = 'Veri doğrulama hatası: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = `Geçersiz ID formatı: ${error.path}`;
    } else if (error.code === 11000) {
      errorMessage = 'Bu kayıt zaten mevcut (duplicate key error).';
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

  } finally {
    // Make sure session is ended
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
  }
};

/**
 * Mevcut fish data'ya yeni hastalık ekle
 * POST /api/fish-data/:id/add-diseases
 */
exports.addDiseasesToFishData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { diseases } = req.body;

    if (!diseases || !Array.isArray(diseases) || diseases.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'En az bir hastalık verisi gönderilmelidir.'
      });
    }

    const fishData = await FishData.findById(id);
    if (!fishData) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Balık verisi bulunamadı.'
      });
    }

    // Hastalık verilerini kontrol et
    for (let i = 0; i < diseases.length; i++) {
      const disease = diseases[i];
      if (!disease.disease_name) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Hastalık #${i + 1} için hastalık adı zorunludur.`
        });
      }
    }

    const diseasePromises = diseases.map(diseaseData => {
      const diseaseDoc = new FishDisease({
        fish_data_id: fishData._id,
        disease_name: diseaseData.disease_name,
        disease_code: diseaseData.disease_code,
        severity: diseaseData.severity || 'medium',
        detected_date: diseaseData.detected_date || new Date(),
        detection_method: diseaseData.detection_method,
        symptoms: diseaseData.symptoms || [],
        treatment: diseaseData.treatment || {},
        status: diseaseData.status || 'active',
        images: diseaseData.images || [],
        lab_results: diseaseData.lab_results || {}
      });
      return diseaseDoc.save({ session });
    });

    const createdDiseases = await Promise.all(diseasePromises);

    fishData.disease_ids.push(...createdDiseases.map(d => d._id));
    await fishData.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: `${createdDiseases.length} hastalık başarıyla eklendi.`,
      data: createdDiseases
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: 'Hastalık eklenirken bir hata oluştu.',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Tüm fish data kayıtlarını listele (filtreleme ve sayfalama ile)
 * GET /api/fish-data
 * Returns only user's own fish unless user is admin
 */
exports.getAllFishData = async (req, res) => {
  try {
    // Get authenticated user
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    const {
      page = 1,
      limit = 10,
      species_id,
      status,
      country,
      region
    } = req.query;

    const filter = {};

    // IMPORTANT: Filter by user unless admin
    if (authenticatedUser.role !== 'admin') {
      filter.user_id = authenticatedUser._id; // Only show user's own fish
    }
    // If admin, show all fish (no user_id filter)

    if (species_id) filter.species_id = species_id;
    if (status) filter.status = status;
    if (country) filter['location.country'] = country;
    if (region) filter['location.region'] = region;

    const skip = (page - 1) * limit;

    const fishDataList = await FishData.find(filter)
      .populate('species_id', 'scientific_name common_name family')
      .populate('disease_ids', 'disease_name severity status')
      .populate('analysis_ids')
      .populate('user_id', 'first_name last_name mail role')
      .populate('submitted_by', 'first_name last_name mail role')
      .sort({ catch_date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FishData.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: fishDataList,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Veriler alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Belirli bir fish data kaydını getir
 * GET /api/fish-data/:id
 * Users can only view their own fish unless admin
 */
exports.getFishDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    const fishData = await FishData.findById(id)
      .populate('species_id')
      .populate('disease_ids')
      .populate('analysis_ids')
      .populate('user_id', 'first_name last_name mail phone role')
      .populate('submitted_by', 'first_name last_name mail role');

    if (!fishData) {
      return res.status(404).json({
        success: false,
        message: 'Balık verisi bulunamadı.'
      });
    }

    // Check if user has permission to view this fish
    if (authenticatedUser.role !== 'admin' && fishData.user_id._id.toString() !== authenticatedUser._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this fish record.'
      });
    }

    res.status(200).json({
      success: true,
      data: fishData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Veri alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Fish data güncelle
 * PUT /api/fish-data/:id
 * Supports updating fish data, status changes (draft to published), and diseases
 */
exports.updateFishData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const updateData = req.body;
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    const fishData = await FishData.findById(id);
    if (!fishData) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Balık verisi bulunamadı.'
      });
    }

    // Check if user has permission to update this fish
    if (authenticatedUser.role !== 'admin' && fishData.user_id.toString() !== authenticatedUser._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Bu balığı güncelleme yetkiniz yok.'
      });
    }

    // Parse body data - when using FormData, nested objects come as JSON strings
    let bodyData = req.body;
    if (typeof req.body.data === 'string') {
      bodyData = JSON.parse(req.body.data);
    }

    // Handle images - use existingImages (kept) and newImages (new base64)
    let updatedImages = [];

    // Add existing images that weren't deleted
    if (bodyData.existingImages && bodyData.existingImages.length > 0) {
      updatedImages = [...bodyData.existingImages];
      console.log('📷 Keeping existing images:', updatedImages.length);
    }

    // Add new base64 images
    if (bodyData.newImages && bodyData.newImages.length > 0) {
      updatedImages = [...updatedImages, ...bodyData.newImages];
      console.log('📷 Adding new base64 images:', bodyData.newImages.length);
    }

    // Update fish images
    fishData.images = updatedImages;

    // Güncelleme yapılabilecek alanlar
    const allowedUpdates = [
      'species_id', 'fish_name', 'common_name', 'scientific_name',
      'catch_date', 'catch_details', 'physical_characteristics',
      'location', 'notes', 'tags', 'metadata', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (bodyData[field] !== undefined) {
        fishData[field] = bodyData[field];
      }
    });

    // Handle disease updates if provided
    if (bodyData.diseases && Array.isArray(bodyData.diseases)) {
      // Delete existing diseases
      await FishDisease.deleteMany({ fish_data_id: id }, { session });

      // Create new diseases if any
      if (bodyData.diseases.length > 0) {
        const diseasePromises = bodyData.diseases.map(diseaseData => {
          const diseaseDoc = new FishDisease({
            fish_data_id: fishData._id,
            disease_name: diseaseData.disease_name,
            disease_code: diseaseData.disease_code,
            severity: diseaseData.severity || 'medium',
            detected_date: diseaseData.detected_date || new Date(),
            detection_method: diseaseData.detection_method,
            symptoms: diseaseData.symptoms || [],
            treatment: diseaseData.treatment || {},
            status: diseaseData.status || 'active',
            images: diseaseData.images || [],
            lab_results: diseaseData.lab_results || {}
          });
          return diseaseDoc.save({ session });
        });

        const createdDiseases = await Promise.all(diseasePromises);
        fishData.disease_ids = createdDiseases.map(d => d._id);
      } else {
        fishData.disease_ids = [];
      }
    }

    await fishData.save({ session });
    await session.commitTransaction();

    const updatedFishData = await FishData.findById(id)
      .populate('species_id')
      .populate('disease_ids')
      .populate('user_id', 'first_name last_name mail role')
      .populate('submitted_by', 'first_name last_name mail role');

    res.status(200).json({
      success: true,
      message: 'Balık verisi başarıyla güncellendi.',
      data: updatedFishData
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Güncelleme sırasında bir hata oluştu.',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Fish data sil (hard delete from database)
 * DELETE /api/fish-data/:id
 * Deletes the fish and all associated diseases from the database
 */
exports.deleteFishData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      await session.abortTransaction();
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    const fishData = await FishData.findById(id);
    if (!fishData) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Balık verisi bulunamadı.'
      });
    }

    // Check if user has permission to delete this fish
    if (authenticatedUser.role !== 'admin' && fishData.user_id.toString() !== authenticatedUser._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Bu balığı silme yetkiniz yok.'
      });
    }

    // Delete images from disk first
    if (fishData.images && fishData.images.length > 0) {
      const uploadDir = path.join(__dirname, '..');
      fishData.images.forEach(imageUrl => {
        try {
          const imagePath = path.join(uploadDir, imageUrl);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('🗑️ Deleted image:', imagePath);
          }
        } catch (err) {
          console.error('❌ Error deleting image:', err.message);
        }
      });
    }

    // Delete all associated diseases
    const deletedDiseases = await FishDisease.deleteMany(
      { fish_data_id: id },
      { session }
    );

    console.log(`✅ ${deletedDiseases.deletedCount} hastalık kaydı silindi`);

    // Delete the fish data
    await FishData.findByIdAndDelete(id, { session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Balık verisi ve ilişkili tüm kayıtlar başarıyla veritabanından silindi.',
      deletedCount: {
        fish: 1,
        diseases: deletedDiseases.deletedCount
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Silme işlemi sırasında bir hata oluştu.',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Genel istatistikler
 * GET /api/fish-data/statistics/summary
 */
exports.getFishDataStatistics = async (req, res) => {
  try {
    const stats = await FishData.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byLocationType: [
            { $group: { _id: '$location.location_type', count: { $sum: 1 } } }
          ],
          byCountry: [
            { $group: { _id: '$location.country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          recentSubmissions: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                fish_name: 1,
                scientific_name: 1,
                catch_date: 1,
                'location.country': 1,
                createdAt: 1
              }
            }
          ]
        }
      }
    ]);

    const totalDiseases = await FishDisease.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        ...stats[0],
        totalDiseases
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken bir hata oluştu.',
      error: error.message
    });
  }
};

/**
 * Export Fish Data as CSV
 * GET /api/fish-data/export/csv
 */
exports.exportFishDataCSV = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Fetch fish data based on role
    let query = {};
    if (userRole !== 'admin') {
      query.user_id = userId;
    }

    const fishRecords = await FishData.find(query)
      .populate('species_id')
      .populate('diseases')
      .sort({ createdAt: -1 });

    // Define CSV file path
    const fileName = `fish-data-${Date.now()}.csv`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);

    // Ensure uploads directory exists
    if (!fs.existsSync(path.join(__dirname, '..', 'uploads'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'uploads'));
    }

    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Fish Name' },
        { id: 'species', title: 'Species' },
        { id: 'date', title: 'Catch Date' },
        { id: 'location', title: 'Location' },
        { id: 'status', title: 'Status' },
        { id: 'diseases', title: 'Disease Count' }
      ]
    });

    const records = fishRecords.map(fish => ({
      id: fish._id,
      name: fish.fish_name || 'N/A',
      species: fish.species_id?.common_name || 'Unknown',
      date: new Date(fish.catch_date).toLocaleDateString(),
      location: fish.location?.location_name || 'N/A',
      status: fish.status,
      diseases: fish.diseases?.length || 0
    }));

    await csvWriter.writeRecords(records);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading CSV:', err);
      }
      // Delete file after download
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV',
      error: error.message
    });
  }
};

/**
 * Export Fish Data as PDF
 * GET /api/fish-data/export/pdf
 */
exports.exportFishDataPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Fetch fish data based on role
    let query = {};
    if (userRole !== 'admin') {
      query.user_id = userId;
    }

    const fishRecords = await FishData.find(query)
      .populate('species_id')
      .populate('diseases')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument();
    const fileName = `fish-report-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Fish Data Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Table Header
    const startX = 50;
    let currentY = doc.y;

    doc.font('Helvetica-Bold');
    doc.text('Fish Name', startX, currentY);
    doc.text('Species', startX + 150, currentY);
    doc.text('Date', startX + 300, currentY);
    doc.text('Status', startX + 400, currentY);
    doc.moveDown();

    // Table Rows
    doc.font('Helvetica');
    fishRecords.forEach(fish => {
      currentY = doc.y;

      // Check for page break
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      doc.text(fish.fish_name || 'N/A', startX, currentY);
      doc.text(fish.species_id?.common_name || 'Unknown', startX + 150, currentY);
      doc.text(new Date(fish.catch_date).toLocaleDateString(), startX + 300, currentY);
      doc.text(fish.status, startX + 400, currentY);
      doc.moveDown();
    });

    doc.end();

  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF',
      error: error.message
    });
  }
};