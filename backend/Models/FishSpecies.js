const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FishSpeciesSchema = new Schema(
  {
    scientific_name: {
      type: String,
      required: [true, 'Scientific name is required.'],
      unique: true,
      trim: true,
    },
    common_name: {
      type: String,
      trim: true,
    },
    family: {
      type: String,
      trim: true,
    },
    genus: {
      type: String,
      trim: true,
    },
    species: {
      type: String,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    characteristics: {
      type: Object,
      default: {},
    },
    typical_locations: {
      type: [String],
      default: [],
    },
    known_diseases: {
      type: [String],
      default: [],
    },
    conservation_status: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('fish_species', FishSpeciesSchema);