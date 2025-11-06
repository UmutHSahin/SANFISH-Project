// models/FishData.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FishDataSchema = new Schema(
  {
    partner_id: {
      type: Schema.Types.ObjectId,
      ref: 'partners',
      required: [true, 'Partner ID zorunludur.'],
    },
    submitted_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'Kullanıcı ID zorunludur.'],
    },
    species_id: {
      type: Schema.Types.ObjectId,
      ref: 'fish_species',
      required: [true, 'Balık türü seçilmelidir.'],
    },
    
    // FISH_LOCATIONS referansı (ayrı koleksiyon)
    location_id: {
      type: Schema.Types.ObjectId,
      ref: 'fish_locations',
      required: [true, 'Lokasyon bilgisi zorunludur.'],
    },
    
    // Hastalık referansları (ayrı koleksiyon)
    disease_ids: [{
      type: Schema.Types.ObjectId,
      ref: 'diseases',
    }],
    
    // Balık temel bilgileri
    fish_name: {
      type: String,
      trim: true,
    },
    common_name: {
      type: String,
      trim: true,
    },
    scientific_name: {
      type: String,
      trim: true,
    },
    
    // Yakalama detayları
    catch_date: {
      type: Date,
      required: [true, 'Yakalama tarihi zorunludur.'],
    },
    submission_date: {
      type: Date,
      default: Date.now,
    },
    catch_details: {
      fishing_method: { type: String },
      depth: { type: Number }, // metre
      time_of_day: { type: String },
      weather_conditions: { type: String },
      water_temperature: { type: Number }, // °C
      salinity: { type: Number }, // ppt
    },
    
    // Fiziksel özellikler
    physical_characteristics: {
      length: { type: Number }, // cm
      weight: { type: Number }, // gram
      age: { type: Number }, // yaş
      sex: { type: String, enum: ['male', 'female', 'unknown'] },
      color_pattern: { type: String },
      body_condition: { type: String },
      scales_condition: { type: String },
      fins_condition: { type: String },
    },
    
    // Görseller
    images: {
      type: [String], // URL'ler
      default: [],
    },
    
    // Veri kalitesi ve durum
    data_quality: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending',
    },
    verified_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    verification_date: {
      type: Date,
    },
    metadata: {
      type: Object,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    
    // Notlar
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index'ler
FishDataSchema.index({ species_id: 1 });
FishDataSchema.index({ partner_id: 1 });
FishDataSchema.index({ location_id: 1 });
FishDataSchema.index({ catch_date: -1 });
FishDataSchema.index({ data_quality: 1 });
FishDataSchema.index({ status: 1 });
FishDataSchema.index({ submitted_by: 1 });

// Virtual field - hastalık sayısı
FishDataSchema.virtual('disease_count', {
  ref: 'diseases',
  localField: '_id',
  foreignField: 'fish_data_id',
  count: true,
});

// toJSON ve toObject'te virtual'ları dahil et
FishDataSchema.set('toJSON', { virtuals: true });
FishDataSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('fish_data', FishDataSchema);