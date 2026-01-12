const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PartnerSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'User ID is required.'],
      unique: true, // Her kullanıcının bir partner kaydı olabilir
    },
    company_name: {
      type: String,
      trim: true,
    },
    company_address: {
      type: String,
      trim: true,
    },
    tax_number: {
      type: String,
      trim: true,
    },
    business_type: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    contact_person: {
      type: String,
      trim: true,
    },
    contact_email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contact_phone: {
      type: String,
      trim: true,
    },
    // Partner bilgileri dolduruldu mu?
    profile_completed: {
      type: Boolean,
      default: false,
    },
    // İlk giriş yapıldı mı?
    first_login_completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // created_at ve updated_at otomatik eklenecek
  }
);

module.exports = mongoose.model('partners', PartnerSchema);

