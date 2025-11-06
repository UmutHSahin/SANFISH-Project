const { signupValidation,loginValidation } = require('../Middlewares/AuthValidation');
const { signup, login } = require('../Controllers/AuthController');

console.log("signupValidation:", typeof signupValidation);
console.log("signup:", typeof signup);

const router = require('express').Router();



router.post('/login',loginValidation, login)
router.post('/signup',signupValidation, signup)

module.exports = router;