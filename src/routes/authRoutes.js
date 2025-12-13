const express = require('express');
const router = express.Router();
const { authController } = require('../controllers/authController');

// Rota: POST /auth/login (Assumindo que no app.js vamos definir o prefixo /auth)
router.post('/login', authController.login);

module.exports = router;