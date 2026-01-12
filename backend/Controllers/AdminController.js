const bcrypt = require('bcrypt');
const UserModel = require('../Models/User');
const PartnerModel = require('../Models/Partners');
const FishDataModel = require('../Models/FishData');
const SystemSettingsModel = require('../Models/SystemSettings');
const { Parser } = require('json2csv'); // User might need to install this package

/**
 * Admin Controller
 * Handles admin-only operations like user management and system-wide fish data access
 */

/**
 * Get all users
 * @route GET /api/admin/users
 * @access Admin only
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;

    // Build filter query
    let filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (status) {
      filter.is_active = status === 'active';
    }

    if (search) {
      filter.$or = [
        { mail: { $regex: search, $options: 'i' } },
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await UserModel.find(filter)
      .select('-password_hash')
      .sort({ createdAt: -1 });

    // Get partner information for users who are partners
    const usersWithPartnerInfo = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        if (user.role === 'partner') {
          const partner = await PartnerModel.findOne({ user_id: user._id });
          userObj.partner_info = partner;
        }
        return userObj;
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithPartnerInfo.length,
      data: usersWithPartnerInfo
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

/**
 * Get user by ID with details
 * @route GET /api/admin/users/:id
 * @access Admin only
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id).select('-password_hash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userObj = user.toObject();

    // Get partner information if user is a partner
    if (user.role === 'partner') {
      const partner = await PartnerModel.findOne({ user_id: user._id });
      userObj.partner_info = partner;
    }

    // Get fish data count for this user
    const fishCount = await FishDataModel.countDocuments({ submitted_by: user._id });
    userObj.fish_count = fishCount;

    res.status(200).json({
      success: true,
      data: userObj
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};

/**
 * Get fish data submitted by a specific user
 * @route GET /api/admin/users/:id/fish
 * @access Admin only
 */
const getUserFishData = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const fishData = await FishDataModel.find({ submitted_by: id })
      .populate('species_id', 'scientific_name common_name family genus')
      .populate('disease_ids', 'disease_name disease_code severity status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: fishData.length,
      user: {
        _id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        mail: user.mail,
        role: user.role
      },
      data: fishData
    });
  } catch (error) {
    console.error('Error in getUserFishData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user fish data',
      error: error.message
    });
  }
};

/**
 * Create new user
 * @route POST /api/admin/users
 * @access Admin only
 */
const createUser = async (req, res) => {
  try {
    const {
      mail,
      password_hash,
      role,
      first_name,
      last_name,
      title,
      position,
      phone,
      is_active,
      // Partner specific fields
      company_name,
      company_address,
      tax_number,
      business_type,
      website,
      contact_person,
      contact_email,
      contact_phone
    } = req.body;

    // Validate required fields
    if (!mail || !password_hash) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ mail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password_hash, 10);

    // Create user
    const newUser = new UserModel({
      mail,
      password_hash: hashedPassword,
      role: role || 'developer',
      first_name,
      last_name,
      title,
      position,
      phone,
      is_active: is_active !== undefined ? is_active : true
    });

    await newUser.save();

    // If role is partner, create partner record
    if (role === 'partner') {
      const partnerData = new PartnerModel({
        user_id: newUser._id,
        company_name,
        company_address,
        tax_number,
        business_type,
        website,
        contact_person,
        contact_email,
        contact_phone,
        profile_completed: !!(company_name && company_address),
        first_login_completed: true
      });

      await partnerData.save();
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: newUser._id,
        mail: newUser.mail,
        role: newUser.role,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

/**
 * Update user
 * @route PUT /api/admin/users/:id
 * @access Admin only
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      title,
      position,
      phone,
      role,
      is_active,
      // Partner specific fields
      company_name,
      company_address,
      tax_number,
      business_type,
      website,
      contact_person,
      contact_email,
      contact_phone
    } = req.body;

    // Find user
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (title !== undefined) user.title = title;
    if (position !== undefined) user.position = position;
    if (phone !== undefined) user.phone = phone;
    if (role !== undefined) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;

    await user.save();

    // If user is partner, update partner information
    if (user.role === 'partner') {
      let partner = await PartnerModel.findOne({ user_id: user._id });

      if (!partner) {
        // Create partner record if it doesn't exist
        partner = new PartnerModel({ user_id: user._id });
      }

      if (company_name !== undefined) partner.company_name = company_name;
      if (company_address !== undefined) partner.company_address = company_address;
      if (tax_number !== undefined) partner.tax_number = tax_number;
      if (business_type !== undefined) partner.business_type = business_type;
      if (website !== undefined) partner.website = website;
      if (contact_person !== undefined) partner.contact_person = contact_person;
      if (contact_email !== undefined) partner.contact_email = contact_email;
      if (contact_phone !== undefined) partner.contact_phone = contact_phone;

      partner.profile_completed = !!(partner.company_name && partner.company_address);
      await partner.save();
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

/**
 * Delete user (soft delete - set is_active to false)
 * @route DELETE /api/admin/users/:id
 * @access Admin only
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - just deactivate the user
    user.is_active = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

/**
 * Get all fish data (system-wide)
 * @route GET /api/admin/fish
 * @access Admin only
 */
const getAllFish = async (req, res) => {
  try {
    const { sort, search, status, submitted_by } = req.query;

    // Build filter
    let filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (submitted_by) {
      filter.submitted_by = submitted_by;
    }

    if (search) {
      filter.$or = [
        { fish_name: { $regex: search, $options: 'i' } },
        { common_name: { $regex: search, $options: 'i' } },
        { scientific_name: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    let sortQuery = {};
    switch (sort) {
      case 'alphabetic':
        sortQuery = { fish_name: 1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'catch_date':
        sortQuery = { catch_date: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const fishData = await FishDataModel.find(filter)
      .populate('species_id', 'scientific_name common_name family genus')
      .populate('disease_ids', 'disease_name disease_code severity status')
      .populate('submitted_by', 'first_name last_name mail role')
      .sort(sortQuery);

    res.status(200).json({
      success: true,
      count: fishData.length,
      data: fishData
    });
  } catch (error) {
    console.error('Error in getAllFish:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fish data',
      error: error.message
    });
  }
};

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/stats
 * @access Admin only
 */

/**
 * Get system settings
 * @route GET /api/admin/settings
 * @access Admin only
 */
const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettingsModel.findOne();

    if (!settings) {
      // Create default settings if not exists
      settings = new SystemSettingsModel();
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getSystemSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message
    });
  }
};

/**
 * Update system settings
 * @route PUT /api/admin/settings
 * @access Admin only
 */
const updateSystemSettings = async (req, res) => {
  try {
    const {
      maintenance_mode,
      allow_registration,
      contact_email,
      announcement,
      items_per_page
    } = req.body;

    let settings = await SystemSettingsModel.findOne();

    if (!settings) {
      settings = new SystemSettingsModel();
    }

    if (maintenance_mode !== undefined) settings.maintenance_mode = maintenance_mode;
    if (allow_registration !== undefined) settings.allow_registration = allow_registration;
    if (contact_email !== undefined) settings.contact_email = contact_email;
    if (items_per_page !== undefined) settings.items_per_page = items_per_page;

    if (announcement) {
      if (announcement.message !== undefined) settings.announcement.message = announcement.message;
      if (announcement.is_active !== undefined) settings.announcement.is_active = announcement.is_active;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error in updateSystemSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

/**
 * Change admin password
 * @route PUT /api/admin/change-password
 * @access Admin only
 */
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.user._id;

    const user = await UserModel.findById(adminId);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error in changeAdminPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

/**
 * Export all users as CSV
 * @route GET /api/admin/export/users
 * @access Admin only
 */
const exportUsers = async (req, res) => {
  try {
    const users = await UserModel.find().lean();

    // Transform data for CSV
    const data = users.map(user => ({
      _id: user._id.toString(),
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.mail,
      role: user.role,
      status: user.is_active ? 'Active' : 'Inactive',
      last_login: user.last_login ? new Date(user.last_login).toISOString() : 'Never',
      created_at: new Date(user.createdAt).toISOString()
    }));

    // If json2csv not available, return JSON
    try {
      const { Parser } = require('json2csv');
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);

      res.header('Content-Type', 'text/csv');
      res.attachment('users_export.csv');
      return res.send(csv);
    } catch (err) {
      // Fallback to JSON if package missing
      return res.status(200).json(data);
    }

  } catch (error) {
    console.error('Error in exportUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
};

/**
 * Export all fish data as CSV
 * @route GET /api/admin/export/fish
 * @access Admin only
 */
const exportFishData = async (req, res) => {
  try {
    const fishData = await FishDataModel.find()
      .populate('species_id', 'scientific_name common_name')
      .populate('submitted_by', 'first_name last_name mail')
      .lean();

    const data = fishData.map(fish => ({
      _id: fish._id.toString(),
      fish_name: fish.fish_name || '',
      common_name: fish.common_name || '',
      scientific_name: fish.species_id?.scientific_name || fish.scientific_name || '',
      submitted_by: fish.submitted_by ? `${fish.submitted_by.first_name} ${fish.submitted_by.last_name}` : 'Unknown',
      catch_date: fish.catch_date ? new Date(fish.catch_date).toISOString() : '',
      location: fish.location?.location_name || fish.location?.country || '',
      status: fish.status || 'unknown',
      created_at: new Date(fish.createdAt).toISOString()
    }));

    try {
      const { Parser } = require('json2csv');
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(data);

      res.header('Content-Type', 'text/csv');
      res.attachment('fish_export.csv');
      return res.send(csv);
    } catch (err) {
      return res.status(200).json(data);
    }

  } catch (error) {
    console.error('Error in exportFishData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export fish data',
      error: error.message
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await UserModel.countDocuments();
    const adminUsers = await UserModel.countDocuments({ role: 'admin' });
    const partnerUsers = await UserModel.countDocuments({ role: 'partner' });
    const developerUsers = await UserModel.countDocuments({ role: 'developer' });
    const activeUsers = await UserModel.countDocuments({ is_active: true });

    // Count fish data
    const totalFish = await FishDataModel.countDocuments();

    // Count by status
    const activeFish = await FishDataModel.countDocuments({ status: 'active' });
    const draftFish = await FishDataModel.countDocuments({ status: 'draft' });
    const archivedFish = await FishDataModel.countDocuments({ status: 'archived' });

    // Recent users (last 5)
    const recentUsers = await UserModel.find()
      .select('-password_hash')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent fish data (last 5)
    const recentFish = await FishDataModel.find()
      .populate('species_id', 'scientific_name common_name')
      .populate('submitted_by', 'first_name last_name mail')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: adminUsers,
          partner: partnerUsers,
          developer: developerUsers,
          active: activeUsers
        },
        fish: {
          total: totalFish,
          active: activeFish,
          draft: draftFish,
          archived: archivedFish
        },
        recent: {
          users: recentUsers,
          fish: recentFish
        }
      }
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserFishData,
  createUser,
  updateUser,
  deleteUser,
  getAllFish,
  getAdminStats,
  // New settings functions
  getSystemSettings,
  updateSystemSettings,
  changeAdminPassword,
  exportUsers,
  exportFishData
};

