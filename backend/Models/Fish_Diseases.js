const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FishDiseasesSchema = new Schema(
  {
    fish_data_id: {
      type: Schema.Types.ObjectId,
      ref: 'fish_data',
      required: [true, 'Fish data ID is required.'],
    },
    disease_name: {
      type: String,
      required: [true, 'Disease name is required.'],
      trim: true,
    },
    disease_code: {
      type: String,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    detected_date: {
      type: Date,
      default: Date.now,
    },
    detection_method: {
      type: String,
      trim: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    treatment: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ['active', 'treated', 'monitoring'],
      default: 'active',
    },
    images: {
      type: [String], // URLs to stored images
      default: [],
    },
    lab_results: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('fish_diseases', FishDiseasesSchema);