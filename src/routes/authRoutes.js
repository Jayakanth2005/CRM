const express = require('express');
const { register, login } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', validateRegister, register);

// POST /api/auth/login - Login user
router.post('/login', validateLogin, login);

module.exports = router;
