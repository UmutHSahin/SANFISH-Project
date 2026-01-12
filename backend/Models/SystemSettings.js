const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SystemSettingsSchema = new Schema(
    {
        maintenance_mode: {
            type: Boolean,
            default: false
        },
        allow_registration: {
            type: Boolean,
            default: true
        },
        contact_email: {
            type: String,
            trim: true,
            default: ''
        },
        announcement: {
            message: {
                type: String,
                default: ''
            },
            is_active: {
                type: Boolean,
                default: false
            }
        },
        items_per_page: {
            type: Number,
            default: 10
        }
    },
    {
        timestamps: true
    }
);

// We will only have one document in this collection
module.exports = mongoose.model('system_settings', SystemSettingsSchema);
