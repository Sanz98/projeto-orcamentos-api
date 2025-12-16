const express = require('express');
const router = express.Router();
const { usuarioController } = require('../controllers/usuarioController');
const { verify } = require('../middleware/authMiddleware'); 

// --- IMPORTANTE: Usar verify.autenticado ANTES de verify.gerente ---

// Rota: GET /vendedores
router.get('/vendedores', verify.autenticado, verify.gerente, usuarioController.listarVendores);

// Rota: POST /registrar/vendedor
router.post('/registrar/vendedor', verify.autenticado, verify.gerente, usuarioController.criarVendedor);

// Rota: Put /atualizar/vendedores/:idUsuario
router.put('/atualizar/vendedores/:idUsuario', verify.autenticado, verify.gerente, usuarioController.atualizarVendedor);

// Rota: Delete /deletar/vendedores/:idUsuario
router.delete('/deletar/vendedores/:idUsuario', verify.autenticado, verify.gerente, usuarioController.deletarVendedor);

module.exports = router;