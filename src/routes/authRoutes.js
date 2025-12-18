const express = require('express');
const router = express.Router();
const { authController } = require('../controllers/authController');

/**
 * @fileoverview Definição de rotas para o módulo de Autenticação.
 * Centraliza os endpoints públicos relacionados a acesso e sessão.
 * * Prefixo Base esperado: /auth (definido no app.js)
 */

/**
 * Endpoint de Login.
 * @route POST /login
 * @group Auth - Operações de Autenticação
 * @description Recebe credenciais (email/senha), valida e retorna cookie de sessão.
 */
router.post('/login', authController.login);

// Exporta o roteador para ser acoplado à aplicação principal
module.exports = router;