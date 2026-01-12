const Partner = require('../Models/Partners');

/**
 * Get Partner Profile
 * @route GET /api/partner/profile
 * @access Private (Partner only)
 */
exports.getPartnerProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if user is a partner
        if (req.user.role !== 'partner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Partner role required.'
            });
        }

        // Find partner by user_id
        let partner = await Partner.findOne({ user_id: userId });

        // If no partner record exists, create one
        if (!partner) {
            partner = await Partner.create({
                user_id: userId,
                profile_completed: false,
                first_login_completed: false
            });
        }

        res.status(200).json({
            success: true,
            data: partner
        });

    } catch (error) {
        console.error('Error fetching partner profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch partner profile',
            error: error.message
        });
    }
};

/**
 * Update Partner Profile
 * @route PUT /api/partner/profile
 * @access Private (Partner only)
 */
exports.updatePartnerProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if user is a partner
        if (req.user.role !== 'partner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Partner role required.'
            });
        }

        const {
            company_name,
            company_address,
            tax_number,
            business_type,
            website,
            contact_person,
            contact_email,
            contact_phone
        } = req.body;

        // Find and update partner
        let partner = await Partner.findOne({ user_id: userId });

        if (!partner) {
            // Create if not exists
            partner = new Partner({ user_id: userId });
        }

        // Update fields
        if (company_name !== undefined) partner.company_name = company_name;
        if (company_address !== undefined) partner.company_address = company_address;
        if (tax_number !== undefined) partner.tax_number = tax_number;
        if (business_type !== undefined) partner.business_type = business_type;
        if (website !== undefined) partner.website = website;
        if (contact_person !== undefined) partner.contact_person = contact_person;
        if (contact_email !== undefined) partner.contact_email = contact_email;
        if (contact_phone !== undefined) partner.contact_phone = contact_phone;

        // Check if profile is complete (at least company name is filled)
        if (company_name && company_name.trim().length > 0) {
            partner.profile_completed = true;
        }

        await partner.save();

        res.status(200).json({
            success: true,
            message: 'Partner profile updated successfully',
            data: partner
        });

    } catch (error) {
        console.error('Error updating partner profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update partner profile',
            error: error.message
        });
    }
};

/**
 * Complete First Login
 * @route POST /api/partner/complete-first-login
 * @access Private (Partner only)
 */
exports.completeFirstLogin = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if user is a partner
        if (req.user.role !== 'partner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Partner role required.'
            });
        }

        let partner = await Partner.findOne({ user_id: userId });

        if (!partner) {
            partner = new Partner({
                user_id: userId,
                first_login_completed: true
            });
        } else {
            partner.first_login_completed = true;
        }

        await partner.save();

        res.status(200).json({
            success: true,
            message: 'First login completed',
            data: partner
        });

    } catch (error) {
        console.error('Error completing first login:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete first login',
            error: error.message
        });
    }
};
