// 1. Dependências Externas
const express = require('express');
const router = express.Router(); // Instância do Roteador do Express

// 2. Controllers
const { authController } = require('../controllers/authController');

/**
 * Rota de Login (Autenticação).
 * Recebe credenciais, valida e retorna o Token JWT via Cookie/JSON.
 * * @route POST /login
 * @access Public
 * @controller authController.login
 */
router.post('/login', authController.login);

module.exports = router;