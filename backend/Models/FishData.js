const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FishDataSchema = new Schema(
  {
    // References - User who created this fish record
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'User ID is required.'],
    },
    submitted_by: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'Submitted by user ID is required.'],
    },
    submitted_by_role: {
      type: String,
      enum: ['admin', 'partner', 'developer'],
      required: [true, 'User role is required.'],
    },
    species_id: {
      type: Schema.Types.ObjectId,
      ref: 'fish_species',
      required: [true, 'Balık türü seçilmelidir.'],
    },

    // Hastalık referansları (ayrı koleksiyon)
    disease_ids: [{
      type: Schema.Types.ObjectId,
      ref: 'fish_diseases',
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

    // LOKASYON BİLGİLERİ (Birleştirildi)
    location: {
      location_name: {
        type: String,
        trim: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180
        }
      },
      location_type: {
        type: String,
        enum: ['ocean', 'river', 'lake', 'farm', 'coastal', 'deep_sea'],
        default: 'ocean',
      },
      water_conditions: {
        temperature: { type: Number }, // °C
        salinity: { type: Number }, // ppt
        pH: { type: Number },
        dissolved_oxygen: { type: Number }, // mg/L
        turbidity: { type: String },
      },
      environmental_data: {
        depth: { type: Number }, // metre
        current_speed: { type: Number }, // knots
        wave_height: { type: Number }, // metre
        bottom_type: { type: String },
        vegetation: { type: String },
      },
      region: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      recorded_at: {
        type: Date,
        default: Date.now,
      },
    },

    // Görseller
    images: {
      type: [String], // URL'ler
      default: [],
    },

    // Analiz referansları (lab sonuçları)
    analysis_ids: [{
      type: Schema.Types.ObjectId,
      ref: 'fish_analyses',
    }],

    // Metadata ve etiketler
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
      enum: ['active', 'draft', 'pending', 'archived', 'deleted'],
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
FishDataSchema.index({ user_id: 1 });
FishDataSchema.index({ submitted_by: 1 });
FishDataSchema.index({ catch_date: -1 });
FishDataSchema.index({ 'analysis_ids': 1 });
FishDataSchema.index({ status: 1 });
FishDataSchema.index({ submitted_by_role: 1 });
FishDataSchema.index({ 'location.country': 1 });
FishDataSchema.index({ 'location.region': 1 });
FishDataSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });

// Virtual field - hastalık sayısı
FishDataSchema.virtual('disease_count', {
  ref: 'fish_diseases',
  localField: '_id',
  foreignField: 'fish_data_id',
  count: true,
});

// toJSON ve toObject'te virtual'ları dahil et
FishDataSchema.set('toJSON', { virtuals: true });
FishDataSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('fish_data', FishDataSchema);