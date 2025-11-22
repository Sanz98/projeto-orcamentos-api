const express = require('express');
const router = express.Router(); 
const {authController} = require('../controllers/authController'); 

// Rota POST para CADASTRAR um novo usuário
// Endpoint: http://localhost:3000/registrar
// Body esperado: { "nome": "...", "email": "...", "senha": "...", "perfil": "..." }
router.post('/registrar', authController.registrarUsuario);

// Rota POST para LOGIN (Autenticação)
// Endpoint: http://localhost:3000/login
// Body esperado: { "email": "...", "senha": "..." }
router.post('/login', authController.usuarioLogin);

module.exports = router;