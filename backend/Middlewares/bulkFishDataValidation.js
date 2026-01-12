// middleware/validation/bulkFishDataValidation.js
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

const isValidCoordinates = (coords) => {
  if (!coords || typeof coords !== 'object') return false;
  const { latitude, longitude } = coords;
  
  // latitude ve longitude opsiyonel ama varsa geçerli olmalı
  if (latitude !== undefined) {
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) return false;
  }
  if (longitude !== undefined) {
    if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) return false;
  }
  
  return true;
};

/**
 * Toplu balık verisi oluşturma validasyonu
 * Fish Data + Location (embedded) + Diseases aynı anda
 */
const validateBulkFishDataCreation = [
  // ===========================
  // FISH DATA ALANLARI
  // ===========================
  // NOTE: user_id, submitted_by, and submitted_by_role are automatically set from authenticated user
  // No validation needed for these fields as they come from req.user

  body('species_id')
    .notEmpty().withMessage('Balık türü seçilmelidir.')
    .custom(isValidObjectId).withMessage('Geçersiz Tür ID formatı.'),

  body('catch_date')
    .notEmpty().withMessage('Yakalama tarihi zorunludur.')
    .isISO8601().withMessage('Geçersiz tarih formatı.')
    .custom((value) => {
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error('Yakalama tarihi gelecekte olamaz.');
      }
      return true;
    }),

  body('fish_name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Balık adı 200 karakterden kısa olmalıdır.'),

  body('common_name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Yaygın ad 200 karakterden kısa olmalıdır.'),

  body('scientific_name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Bilimsel ad 200 karakterden kısa olmalıdır.'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Notlar 2000 karakterden kısa olmalıdır.'),

  body('images')
    .optional()
    .isArray().withMessage('Görseller dizi formatında olmalıdır.')
    .custom((value) => {
      if (value && value.length > 20) {
        throw new Error('En fazla 20 görsel eklenebilir.');
      }
      if (value && value.length > 0) {
        const invalidUrl = value.find(url => typeof url !== 'string' || url.length > 500);
        if (invalidUrl) {
          throw new Error('Her görsel URL geçerli bir string olmalı ve 500 karakterden kısa olmalıdır.');
        }
      }
      return true;
    }),

  // ===========================
  // CATCH DETAILS (Opsiyonel)
  // ===========================
  body('catch_details')
    .optional()
    .isObject().withMessage('Yakalama detayları obje formatında olmalıdır.'),

  body('catch_details.fishing_method')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Balıkçılık yöntemi 100 karakterden kısa olmalıdır.'),

  body('catch_details.depth')
    .optional()
    .isFloat({ min: 0, max: 11000 }).withMessage('Derinlik 0-11000 metre arasında olmalıdır.'),

  body('catch_details.water_temperature')
    .optional()
    .isFloat({ min: -2, max: 50 }).withMessage('Su sıcaklığı -2 ile 50°C arasında olmalıdır.'),

  body('catch_details.salinity')
    .optional()
    .isFloat({ min: 0, max: 50 }).withMessage('Tuzluluk 0 ile 50 ppt arasında olmalıdır.'),

  // ===========================
  // PHYSICAL CHARACTERISTICS (Opsiyonel)
  // ===========================
  body('physical_characteristics')
    .optional()
    .isObject().withMessage('Fiziksel özellikler obje formatında olmalıdır.'),

  body('physical_characteristics.length')
    .optional()
    .isFloat({ min: 0, max: 2000 }).withMessage('Uzunluk 0-2000 cm arasında olmalıdır.'),

  body('physical_characteristics.weight')
    .optional()
    .isFloat({ min: 0, max: 1000000 }).withMessage('Ağırlık 0-1000000 gram arasında olmalıdır.'),

  body('physical_characteristics.age')
    .optional()
    .isInt({ min: 0, max: 200 }).withMessage('Yaş 0-200 arasında olmalıdır.'),

  body('physical_characteristics.sex')
    .optional()
    .isIn(['male', 'female', 'unknown']).withMessage('Cinsiyet male, female veya unknown olmalıdır.'),

  // ===========================
  // LOCATION DATA (Zorunlu - Artık Embedded)
  // ===========================
  body('location')
    .notEmpty().withMessage('Lokasyon bilgisi zorunludur.')
    .isObject().withMessage('Lokasyon verisi obje formatında olmalıdır.'),

  body('location.location_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Lokasyon adı 2-200 karakter arasında olmalıdır.'),

  body('location.coordinates')
    .optional()
    .custom(isValidCoordinates).withMessage('Geçersiz koordinat formatı (latitude: -90 ile 90, longitude: -180 ile 180).'),

  body('location.coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Enlem -90 ile 90 arasında olmalıdır.'),

  body('location.coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Boylam -180 ile 180 arasında olmalıdır.'),

  body('location.location_type')
    .optional()
    .isIn(['ocean', 'river', 'lake', 'farm', 'coastal', 'deep_sea'])
    .withMessage('Lokasyon tipi ocean, river, lake, farm, coastal veya deep_sea olmalıdır.'),

  body('location.water_conditions')
    .optional()
    .isObject().withMessage('Su koşulları obje formatında olmalıdır.')
    .custom((value) => {
      if (value) {
        if (value.temperature !== undefined) {
          if (typeof value.temperature !== 'number' || value.temperature < -2 || value.temperature > 50) {
            throw new Error('Su sıcaklığı -2 ile 50°C arasında olmalıdır.');
          }
        }
        if (value.pH !== undefined) {
          if (typeof value.pH !== 'number' || value.pH < 0 || value.pH > 14) {
            throw new Error('pH değeri 0 ile 14 arasında olmalıdır.');
          }
        }
        if (value.salinity !== undefined) {
          if (typeof value.salinity !== 'number' || value.salinity < 0 || value.salinity > 50) {
            throw new Error('Tuzluluk 0 ile 50 ppt arasında olmalıdır.');
          }
        }
        if (value.dissolved_oxygen !== undefined) {
          if (typeof value.dissolved_oxygen !== 'number' || value.dissolved_oxygen < 0 || value.dissolved_oxygen > 20) {
            throw new Error('Çözünmüş oksijen 0 ile 20 mg/L arasında olmalıdır.');
          }
        }
      }
      return true;
    }),

  body('location.environmental_data')
    .optional()
    .isObject().withMessage('Çevre verileri obje formatında olmalıdır.')
    .custom((value) => {
      if (value) {
        if (value.depth !== undefined) {
          if (typeof value.depth !== 'number' || value.depth < 0 || value.depth > 11000) {
            throw new Error('Derinlik 0 ile 11000 metre arasında olmalıdır.');
          }
        }
        if (value.current_speed !== undefined) {
          if (typeof value.current_speed !== 'number' || value.current_speed < 0 || value.current_speed > 50) {
            throw new Error('Akıntı hızı 0 ile 50 knot arasında olmalıdır.');
          }
        }
        if (value.wave_height !== undefined) {
          if (typeof value.wave_height !== 'number' || value.wave_height < 0 || value.wave_height > 30) {
            throw new Error('Dalga yüksekliği 0 ile 30 metre arasında olmalıdır.');
          }
        }
      }
      return true;
    }),

  body('location.country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Ülke adı 2-100 karakter arasında olmalıdır.'),

  body('location.region')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Bölge adı 2-100 karakter arasında olmalıdır.'),

  body('location.recorded_at')
    .optional()
    .isISO8601().withMessage('Kayıt tarihi geçersiz.')
    .custom((value) => {
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error('Kayıt tarihi gelecekte olamaz.');
      }
      return true;
    }),

  // ===========================
  // DISEASES (Opsiyonel Array)
  // ===========================
  body('diseases')
    .optional()
    .isArray().withMessage('Hastalıklar dizi formatında olmalıdır.')
    .custom((value) => {
      if (value && value.length > 20) {
        throw new Error('En fazla 20 hastalık eklenebilir.');
      }
      return true;
    }),

  body('diseases.*.disease_name')
    .if(body('diseases').exists())
    .notEmpty().withMessage('Her hastalık için hastalık adı zorunludur.')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Hastalık adı 2-200 karakter arasında olmalıdır.'),

  body('diseases.*.disease_code')
    .optional()
    .trim()
    .matches(/^[A-Z0-9\-_]+$/i).withMessage('Hastalık kodu sadece harf, rakam, tire ve alt çizgi içerebilir.')
    .isLength({ max: 50 }).withMessage('Hastalık kodu 50 karakterden kısa olmalıdır.'),

  body('diseases.*.severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Şiddet low, medium, high veya critical olmalıdır.'),

  body('diseases.*.detected_date')
    .optional()
    .isISO8601().withMessage('Tespit tarihi geçersiz.')
    .custom((value) => {
      const date = new Date(value);
      if (date > new Date()) {
        throw new Error('Tespit tarihi gelecekte olamaz.');
      }
      return true;
    }),

  body('diseases.*.detection_method')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Tespit yöntemi 200 karakterden kısa olmalıdır.'),

  body('diseases.*.symptoms')
    .optional()
    .isArray().withMessage('Semptomlar dizi formatında olmalıdır.')
    .custom((value) => {
      if (value && value.length > 0) {
        if (value.length > 50) {
          throw new Error('Her hastalık için en fazla 50 semptom eklenebilir.');
        }
        const invalidSymptom = value.find(s => typeof s !== 'string' || s.length < 2 || s.length > 200);
        if (invalidSymptom) {
          throw new Error('Her semptom 2-200 karakter arasında bir string olmalıdır.');
        }
      }
      return true;
    }),

  body('diseases.*.treatment')
    .optional()
    .isObject().withMessage('Tedavi bilgisi obje formatında olmalıdır.'),

  body('diseases.*.status')
    .optional()
    .isIn(['active', 'treated', 'monitoring']).withMessage('Durum active, treated veya monitoring olmalıdır.'),

  body('diseases.*.images')
    .optional()
    .isArray().withMessage('Hastalık görselleri dizi formatında olmalıdır.')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Her hastalık için en fazla 10 görsel eklenebilir.');
      }
      return true;
    }),

  body('diseases.*.lab_results')
    .optional()
    .isObject().withMessage('Laboratuvar sonuçları obje formatında olmalıdır.'),

  checkValidationResult
];

/**
 * Mevcut fish data'ya hastalık ekleme validasyonu
 */
const validateAddDiseases = [
  body('diseases')
    .notEmpty().withMessage('En az bir hastalık verisi gönderilmelidir.')
    .isArray().withMessage('Hastalıklar dizi formatında olmalıdır.')
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('En az bir hastalık eklemelisiniz.');
      }
      if (value.length > 20) {
        throw new Error('En fazla 20 hastalık eklenebilir.');
      }
      return true;
    }),

  body('diseases.*.disease_name')
    .notEmpty().withMessage('Her hastalık için hastalık adı zorunludur.')
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Hastalık adı 2-200 karakter arasında olmalıdır.'),

  body('diseases.*.severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical']).withMessage('Şiddet low, medium, high veya critical olmalıdır.'),

  body('diseases.*.status')
    .optional()
    .isIn(['active', 'treated', 'monitoring']).withMessage('Durum active, treated veya monitoring olmalıdır.'),

  checkValidationResult
];

module.exports = {
  validateBulkFishDataCreation,
  validateAddDiseases
};