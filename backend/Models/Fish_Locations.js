const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FishLocationsSchema = new Schema(
  {
    fish_data_id: {
      type: Schema.Types.ObjectId,
      ref: 'fish_data',
      required: [true, 'Fish data ID is required.'],
    },
    location_name: {
      type: String,
      trim: true,
    },
    coordinates: {
      type: Object, // { lat, lng }
      default: {},
    },
    location_type: {
      type: String,
      enum: ['ocean', 'river', 'lake', 'farm'],
      default: 'ocean',
    },
    water_conditions: {
      type: Object,
      default: {},
    },
    environmental_data: {
      type: Object,
      default: {},
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
  {
    timestamps: false, // This model uses recorded_at instead of timestamps
  }
);

module.exports = mongoose.model('fish_locations', FishLocationsSchema);