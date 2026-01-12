const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Balık Analizi Şeması (Fish Analysis Schema)
 * Laboratuvar test sonuçlarını saklar (ağır metaller, biyolojik testler, vb.)
 */
const FishAnalysisSchema = new Schema(
    {
        // Balık referansı
        fish_data_id: {
            type: Schema.Types.ObjectId,
            ref: 'fish_data',
            required: [true, 'Balık verisi ID zorunludur.'],
        },

        // Analiz türü
        analysis_type: {
            type: String,
            enum: ['chemical', 'biological', 'physical', 'microbiological', 'genetic'],
            required: [true, 'Analiz türü zorunludur.'],
        },

        // Test detayları
        test_name: {
            type: String,
            required: [true, 'Test adı zorunludur.'],
            trim: true,
        },
        test_code: {
            type: String,
            trim: true,
        },

        // Sonuçlar
        value: {
            type: Number,
            required: [true, 'Değer zorunludur.'],
        },
        unit: {
            type: String,
            required: [true, 'Birim zorunludur.'],
            trim: true,
        },

        // Referans aralığı
        reference_range: {
            min: { type: Number },
            max: { type: Number },
            standard: { type: String }, // WHO, FDA, AB, vb.
        },

        // Sonuç durumu
        result_status: {
            type: String,
            enum: ['normal', 'elevated', 'critical', 'below_normal'],
            default: 'normal',
        },

        // Laboratuvar bilgileri
        laboratory: {
            name: { type: String },
            accreditation: { type: String },
            report_number: { type: String },
        },

        // Tarihler
        sample_date: {
            type: Date,
        },
        analysis_date: {
            type: Date,
        },

        // Ek bilgiler
        methodology: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        attachments: {
            type: [String], // URL'ler
            default: [],
        },

        // Kaydeden kullanıcı
        recorded_by: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: [true, 'Kaydeden kullanıcı ID zorunludur.'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexler
FishAnalysisSchema.index({ fish_data_id: 1 });
FishAnalysisSchema.index({ analysis_type: 1 });
FishAnalysisSchema.index({ result_status: 1 });
FishAnalysisSchema.index({ recorded_by: 1 });

module.exports = mongoose.model('fish_analyses', FishAnalysisSchema);
