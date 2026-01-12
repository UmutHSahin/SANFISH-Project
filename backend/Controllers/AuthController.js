// ========================================
// KİMLİK DOĞRULAMA CONTROLLER'I (AUTH CONTROLLER)
// Kullanıcı kaydı (signup) ve giriş (login) işlemlerini yönetir
// ========================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");

// ========================================
// KAYIT OLMA FONKSİYONU (SIGNUP)
// Yeni kullanıcı kaydı oluşturur
// Şifreyi bcrypt ile hashler ve veritabanına kaydeder
// ========================================
const signup = async (req, res) => {
    try {
        // İstek gövdesinden kullanıcı bilgilerini al
        const { position, phone, title, role, first_name, last_name, mail, password_hash } = req.body;

        // Bu email ile kayıtlı kullanıcı var mı kontrol et
        const user = await UserModel.findOne({ mail });

        if (user) {
            // Kullanıcı zaten varsa hata döndür
            return res.status(409)
                .json({ message: 'User is already exist, you can login', success: false });
        }

        // Yeni kullanıcı modeli oluştur
        const userModel = new UserModel({ position, phone, title, role, first_name, last_name, mail, password_hash });

        // Şifreyi güvenli şekilde hashle (10 salt rounds)
        userModel.password_hash = await bcrypt.hash(password_hash, 10);

        // Kullanıcıyı veritabanına kaydet
        await userModel.save();

        res.status(201).json({
            message: "Signup successfully",
            success: true
        });

    } catch (err) {
        // Sunucu hatası durumunda
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message // Hata detayını görmek için
        });
    }
}

// ========================================
// GİRİŞ YAPMA FONKSİYONU (LOGIN)
// Kullanıcı email ve şifresini doğrular
// Başarılı olursa JWT token döndürür
// ========================================
const login = async (req, res) => {
    try {
        // İstek gövdesinden email ve şifreyi al
        const { mail, password_hash } = req.body;

        // Email ile kullanıcıyı bul
        const user = await UserModel.findOne({ mail });
        const errorMsg = 'Auth failed email or password is wrong';

        // Kullanıcı bulunamadıysa hata döndür
        if (!user) {
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }

        // Şifre doğrulaması - gönderilen şifre ile veritabanındaki hash'i karşılaştır
        const isPassEqual = await bcrypt.compare(password_hash, user.password_hash);

        if (!isPassEqual) {
            // Şifre yanlışsa hata döndür
            return res.status(403)
                .json({ message: errorMsg, success: false });
        }

        // Update last_login time
        user.last_login = new Date();
        await user.save();

        // JWT token oluştur (24 saat geçerli)
        const jwtToken = jwt.sign(
            { mail: user.mail, _id: user._id },
            process.env.JWT_SECRET || 'temporary_test_secret_123',  // Fallback secret
            { expiresIn: '24h' }
        );

        // Başarılı giriş yanıtı döndür
        res.status(200).json({
            message: "Login success",
            success: true,
            jwtToken,
            mail,
            name: user.first_name,
            userId: user._id,
            role: user.role
        });

    } catch (err) {
        // Sunucu hatası durumunda
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message // Hata detayını görmek için
        });
    }
}

// ========================================
// GET PROFILE
// Fetches user profile information
// ========================================
const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await UserModel.findById(userId).select('-password_hash');

        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            success: true,
            data: user
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

// ========================================
// UPDATE PROFILE
// Updates user profile information
// ========================================
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { first_name, last_name, phone, title, position } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Update allowed fields
        if (first_name) user.first_name = first_name;
        if (last_name) user.last_name = last_name;
        if (phone) user.phone = phone;
        if (title) user.title = title;
        if (position) user.position = position;

        // Handle nested preferences update
        if (req.body.preferences) {
            user.preferences = {
                ...user.preferences,
                ...req.body.preferences
            };
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            data: {
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                title: user.title,
                position: user.position,
                preferences: user.preferences
            }
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

// ========================================
// CHANGE PASSWORD
// Changes user password after verification
// ========================================
const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password", success: false });
        }

        // Hash new password
        user.password_hash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({
            message: "Password changed successfully",
            success: true
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

// Fonksiyonları dışa aktar
module.exports = {
    signup,
    login,
    updateProfile,
    changePassword,
    getProfile
}