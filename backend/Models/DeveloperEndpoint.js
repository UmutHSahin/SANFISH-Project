const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

/**
 * Developer Endpoint Model
 * Stores custom API endpoint configurations created by developers.
 * Each endpoint has unique filters and a slug for API access.
 */
const DeveloperEndpointSchema = new Schema(
    {
        // User who created this endpoint
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },

        // Human-readable name for the endpoint
        name: {
            type: String,
            required: [true, 'Endpoint name is required'],
            trim: true,
            maxlength: 100,
        },

        // Unique slug for API access (e.g., "my-atlantic-fish")
        endpointSlug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // Filter configuration (stored as JSON)
        filters: {
            // Species filter
            speciesId: {
                type: Schema.Types.ObjectId,
                ref: 'fish_species',
            },

            // Date range
            dateFrom: Date,
            dateTo: Date,

            // Location filters
            country: String,
            region: String,
            locationType: {
                type: String,
                enum: ['ocean', 'river', 'lake', 'farm', 'coastal', 'deep_sea', ''],
            },

            // Physical characteristics
            minLength: Number,
            maxLength: Number,
            minWeight: Number,
            maxWeight: Number,
            sex: {
                type: String,
                enum: ['male', 'female', 'unknown', ''],
            },

            // Status filter
            status: {
                type: String,
                enum: ['active', 'draft', 'pending', 'archived', ''],
                default: 'active',
            },
        },

        // Cached count of matching records (updated on creation/refresh)
        matchCount: {
            type: Number,
            default: 0,
        },

        // Is this endpoint active?
        isActive: {
            type: Boolean,
            default: true,
        },

        // Access statistics
        accessCount: {
            type: Number,
            default: 0,
        },
        lastAccessedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast lookups
DeveloperEndpointSchema.index({ userId: 1 });
DeveloperEndpointSchema.index({ endpointSlug: 1 });
DeveloperEndpointSchema.index({ isActive: 1 });

// Generate a unique slug before saving
DeveloperEndpointSchema.pre('validate', async function (next) {
    if (!this.endpointSlug) {
        // Generate slug from name + random suffix
        const baseSlug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);

        const randomSuffix = crypto.randomBytes(4).toString('hex');
        this.endpointSlug = `${baseSlug}-${randomSuffix}`;
    }
    next();
});

module.exports = mongoose.model('developer_endpoints', DeveloperEndpointSchema);
