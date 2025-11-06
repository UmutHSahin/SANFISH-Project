const { required } = require('joi');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Bu dosya bir Mongoose modeli tanımlar, 
// 'joi' importuna genellikle burada ihtiyaç duyulmaz.
// const { required } = require('joi'); 

const UserSchema = new Schema(
  {
    // _id (PK): Mongoose bunu otomatik olarak ekler. Sizin eklemenize gerek yok.

    mail: {
      type: String,
      required: [true, 'E-posta alanı zorunludur.'],
      unique: true, // Şemadaki UK (Unique Key) bu anlama gelir.
      lowercase: true, // E-postaları her zaman küçük harfle saklamak iyi bir pratiktir.
      trim: true,
    },
    password_hash: {
      type: String,
      required: [true, 'Şifre alanı zorunludur.'],
    },
    role: {
      type: String,
      // Şemadaki 'admin, partner, developer' notu
      enum: ['admin', 'partner', 'developer'], 
      default: 'developer',
    },
    first_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      // Şemadaki 'Mr, Mrs' notu
      enum: ['Mr', 'Mrs'], 
    },
    position: {
      type: String,
    },
    phone: {
      type: String,
    },
    partner_id: {
      type: Schema.Types.ObjectId, // Bu bir FK (Foreign Key)
      ref: 'Partner', // Bu alanın hangi modele (koleksiyona) referans verdiğini belirtin. Model adınız 'Partner' ise bu şekilde bırakın.
      default: null, // 'null for admin' notu için
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    last_login: {
      type: Date,
      default: null,
    },
    preferences: {
      // Şemadaki 'UI settings, language' notu
      language: { type: String, default: 'en' },
      ui_settings: { type: Object }
      // Veya 'preferences' alanını direkt 'type: Object' olarak da bırakabilirsiniz.
    },

    // created_at ve updated_at (datetime): 
    // Bunlar için aşağıdaki 'timestamps' seçeneğini kullanmak en iyisidir.
  },
  {
    // Bu Mongoose seçeneği, 'created_at' ve 'updated_at' 
    // alanlarını sizin için otomatik olarak yönetir.
    timestamps: true,
  }
);

// Modeli 'User' adıyla dışa aktarıyoruz. 
// Mongoose, MongoDB'de bunu 'users' adında bir koleksiyon yapacak.
module.exports = mongoose.model('users', UserSchema);