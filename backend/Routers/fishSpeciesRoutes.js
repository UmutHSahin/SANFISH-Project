// routes/fishSpeciesRoutes.js
const express = require('express');
const router = express.Router();
const FishSpecies = require('../Models/FishSpecies');
const { protect } = require('../Middlewares/authMiddleware');

/**
 * @route   GET /api/fish-species
 * @desc    Get all fish species with optional filters
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { family, genus, search, page = 1, limit = 100 } = req.query;

    // Build query
    const query = {};
    
    if (family) {
      query.family = new RegExp(family, 'i');
    }
    
    if (genus) {
      query.genus = new RegExp(genus, 'i');
    }
    
    if (search) {
      query.$or = [
        { scientific_name: new RegExp(search, 'i') },
        { common_name: new RegExp(search, 'i') },
        { family: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [species, total] = await Promise.all([
      FishSpecies.find(query)
        .sort({ scientific_name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      FishSpecies.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: species.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: species
    });

  } catch (error) {
    console.error('Error fetching fish species:', error);
    res.status(500).json({
      success: false,
      message: 'Balık türleri alınırken hata oluştu.',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/fish-species/:id
 * @desc    Get single fish species by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const species = await FishSpecies.findById(req.params.id);

    if (!species) {
      return res.status(404).json({
        success: false,
        message: 'Balık türü bulunamadı.'
      });
    }

    res.status(200).json({
      success: true,
      data: species
    });

  } catch (error) {
    console.error('Error fetching fish species:', error);
    res.status(500).json({
      success: false,
      message: 'Balık türü alınırken hata oluştu.',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/fish-species
 * @desc    Create new fish species
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      scientific_name,
      common_name,
      family,
      genus,
      species,
      aliases,
      characteristics,
      typical_locations,
      known_diseases,
      conservation_status
    } = req.body;

    // Check if species already exists
    const existingSpecies = await FishSpecies.findOne({ scientific_name });
    if (existingSpecies) {
      return res.status(400).json({
        success: false,
        message: 'Bu bilimsel ada sahip bir tür zaten mevcut.'
      });
    }

    // Create new species
    const newSpecies = new FishSpecies({
      scientific_name,
      common_name,
      family,
      genus,
      species,
      aliases: aliases || [],
      characteristics: characteristics || {},
      typical_locations: typical_locations || [],
      known_diseases: known_diseases || [],
      conservation_status: conservation_status || {}
    });

    await newSpecies.save();

    res.status(201).json({
      success: true,
      message: 'Balık türü başarıyla oluşturuldu.',
      data: newSpecies
    });

  } catch (error) {
    console.error('Error creating fish species:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu bilimsel ada sahip bir tür zaten mevcut.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Balık türü oluşturulurken hata oluştu.',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/fish-species/:id
 * @desc    Update fish species
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const species = await FishSpecies.findById(req.params.id);

    if (!species) {
      return res.status(404).json({
        success: false,
        message: 'Balık türü bulunamadı.'
      });
    }

    // Update fields
    const allowedFields = [
      'scientific_name',
      'common_name',
      'family',
      'genus',
      'species',
      'aliases',
      'characteristics',
      'typical_locations',
      'known_diseases',
      'conservation_status'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        species[field] = req.body[field];
      }
    });

    await species.save();

    res.status(200).json({
      success: true,
      message: 'Balık türü başarıyla güncellendi.',
      data: species
    });

  } catch (error) {
    console.error('Error updating fish species:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bu bilimsel ada sahip başka bir tür zaten mevcut.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Balık türü güncellenirken hata oluştu.',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/fish-species/:id
 * @desc    Delete fish species
 * @access  Private (Admin only recommended)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const species = await FishSpecies.findById(req.params.id);

    if (!species) {
      return res.status(404).json({
        success: false,
        message: 'Balık türü bulunamadı.'
      });
    }

    // Check if species is being used in fish_data
    const FishData = require('../Models/FishData');
    const usageCount = await FishData.countDocuments({ species_id: req.params.id });

    if (usageCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Bu tür ${usageCount} adet balık kaydında kullanılıyor. Önce bu kayıtları silmelisiniz.`
      });
    }

    await species.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Balık türü başarıyla silindi.'
    });

  } catch (error) {
    console.error('Error deleting fish species:', error);
    res.status(500).json({
      success: false,
      message: 'Balık türü silinirken hata oluştu.',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/fish-species/stats/summary
 * @desc    Get species statistics
 * @access  Private
 */
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const [totalSpecies, familyCounts] = await Promise.all([
      FishSpecies.countDocuments(),
      FishSpecies.aggregate([
        {
          $group: {
            _id: '$family',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total_species: totalSpecies,
        top_families: familyCounts
      }
    });

  } catch (error) {
    console.error('Error fetching species stats:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken hata oluştu.',
      error: error.message
    });
  }
});

module.exports = router;