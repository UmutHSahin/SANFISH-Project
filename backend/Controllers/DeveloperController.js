const DeveloperEndpointModel = require('../Models/DeveloperEndpoint');
const FishDataModel = require('../Models/FishData');
const UserModel = require('../Models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Developer Controller
 * Handles API endpoint creation, management, and data fetching for developers.
 */

// Build MongoDB query from filters
const buildQueryFromFilters = (filters) => {
    const query = {};

    if (filters.speciesId) {
        query.species_id = filters.speciesId;
    }

    if (filters.dateFrom || filters.dateTo) {
        query.catch_date = {};
        if (filters.dateFrom) query.catch_date.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.catch_date.$lte = new Date(filters.dateTo);
    }

    if (filters.country) {
        query['location.country'] = { $regex: filters.country, $options: 'i' };
    }

    if (filters.region) {
        query['location.region'] = { $regex: filters.region, $options: 'i' };
    }

    if (filters.locationType) {
        query['location.location_type'] = filters.locationType;
    }

    if (filters.minLength || filters.maxLength) {
        query['physical_characteristics.length'] = {};
        if (filters.minLength) query['physical_characteristics.length'].$gte = filters.minLength;
        if (filters.maxLength) query['physical_characteristics.length'].$lte = filters.maxLength;
    }

    if (filters.minWeight || filters.maxWeight) {
        query['physical_characteristics.weight'] = {};
        if (filters.minWeight) query['physical_characteristics.weight'].$gte = filters.minWeight;
        if (filters.maxWeight) query['physical_characteristics.weight'].$lte = filters.maxWeight;
    }

    if (filters.sex) {
        query['physical_characteristics.sex'] = filters.sex;
    }

    if (filters.status) {
        query.status = filters.status;
    } else {
        query.status = 'active'; // Default to active
    }

    return query;
};

// Preview data count based on filters
const previewData = async (req, res) => {
    try {
        const { filters } = req.body;
        const query = buildQueryFromFilters(filters || {});

        const count = await FishDataModel.countDocuments(query);

        res.status(200).json({
            success: true,
            count,
            message: `Found ${count} matching records`
        });
    } catch (error) {
        console.error('Preview error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching preview',
            error: error.message
        });
    }
};

// Create a new developer endpoint
const createEndpoint = async (req, res) => {
    try {
        const { name, filters } = req.body;
        const userId = req.user._id;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Endpoint name is required'
            });
        }

        // Calculate match count
        const query = buildQueryFromFilters(filters || {});
        const matchCount = await FishDataModel.countDocuments(query);

        // Create endpoint
        const endpoint = new DeveloperEndpointModel({
            userId,
            name,
            filters: filters || {},
            matchCount,
        });

        await endpoint.save();

        // Ensure user has an API key
        let user = await UserModel.findById(userId);
        if (!user.apiKey) {
            user.apiKey = crypto.randomBytes(32).toString('hex');
            await user.save();
        }

        res.status(201).json({
            success: true,
            message: 'Endpoint created successfully',
            data: {
                ...endpoint.toObject(),
                apiKey: user.apiKey,
                fullUrl: `${req.protocol}://${req.get('host')}/api/dev/data/${endpoint.endpointSlug}?key=${user.apiKey}`
            }
        });
    } catch (error) {
        console.error('Create endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating endpoint',
            error: error.message
        });
    }
};

// List user's endpoints
const listEndpoints = async (req, res) => {
    try {
        const userId = req.user._id;

        const endpoints = await DeveloperEndpointModel.find({ userId, isActive: true })
            .sort({ createdAt: -1 });

        // Get user's API key
        const user = await UserModel.findById(userId);

        res.status(200).json({
            success: true,
            data: endpoints,
            apiKey: user.apiKey || null
        });
    } catch (error) {
        console.error('List endpoints error:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing endpoints',
            error: error.message
        });
    }
};

// Delete an endpoint
const deleteEndpoint = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const endpoint = await DeveloperEndpointModel.findOneAndUpdate(
            { _id: id, userId },
            { isActive: false },
            { new: true }
        );

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                message: 'Endpoint not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Endpoint deleted successfully'
        });
    } catch (error) {
        console.error('Delete endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting endpoint',
            error: error.message
        });
    }
};

// Regenerate API key
const regenerateApiKey = async (req, res) => {
    try {
        const userId = req.user._id;

        const newKey = crypto.randomBytes(32).toString('hex');
        await UserModel.findByIdAndUpdate(userId, { apiKey: newKey });

        res.status(200).json({
            success: true,
            message: 'API key regenerated',
            apiKey: newKey
        });
    } catch (error) {
        console.error('Regenerate API key error:', error);
        res.status(500).json({
            success: false,
            message: 'Error regenerating API key',
            error: error.message
        });
    }
};

// PUBLIC: Fetch data via slug + API key (No auth middleware)
const fetchData = async (req, res) => {
    try {
        const { slug } = req.params;
        const { key } = req.query;

        if (!key) {
            return res.status(401).json({
                success: false,
                message: 'API key is required. Use ?key=YOUR_API_KEY'
            });
        }

        // Find endpoint by slug
        const endpoint = await DeveloperEndpointModel.findOne({
            endpointSlug: slug,
            isActive: true
        });

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                message: 'Endpoint not found or inactive'
            });
        }

        // Validate API key belongs to endpoint owner
        const user = await UserModel.findOne({ _id: endpoint.userId, apiKey: key });

        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'Invalid API key'
            });
        }

        // Build query and fetch data
        const query = buildQueryFromFilters(endpoint.filters);
        const data = await FishDataModel.find(query)
            .populate('species_id', 'common_name scientific_name')
            .select('-__v')
            .lean();

        // Update access stats
        await DeveloperEndpointModel.findByIdAndUpdate(endpoint._id, {
            $inc: { accessCount: 1 },
            lastAccessedAt: new Date()
        });

        res.status(200).json({
            success: true,
            endpoint: endpoint.name,
            count: data.length,
            data
        });
    } catch (error) {
        console.error('Fetch data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching data',
            error: error.message
        });
    }
};

// Get user's API key
const getApiKey = async (req, res) => {
    try {
        const userId = req.user._id;
        let user = await UserModel.findById(userId);

        // Generate if not exists
        if (!user.apiKey) {
            user.apiKey = crypto.randomBytes(32).toString('hex');
            await user.save();
        }

        res.status(200).json({
            success: true,
            apiKey: user.apiKey
        });
    } catch (error) {
        console.error('Get API key error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching API key',
            error: error.message
        });
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect current password'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

module.exports = {
    previewData,
    createEndpoint,
    listEndpoints,
    deleteEndpoint,
    regenerateApiKey,
    fetchData,
    getApiKey,
    changePassword
};
