const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const { signup, login, updateProfile, changePassword, getProfile } = require('../Controllers/AuthController');
const { protect } = require('../Middlewares/authMiddleware');

console.log("signupValidation:", typeof signupValidation);
console.log("signup:", typeof signup);

const router = require('express').Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);
router.get('/profile', protect, getProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;