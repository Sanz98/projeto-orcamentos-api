// 1. Dependências Externas
const express = require('express');
const router = express.Router();

// 2. Controllers
const { usuarioController } = require('../controllers/usuarioController');

// 3. Middlewares (Security Layer)
const { verify } = require('../middleware/authMiddleware'); 

/**
 * Lista todos os vendedores cadastrados.
 * Acesso restrito: Apenas Gerentes podem visualizar a lista completa.
 * * @route GET /vendedores
 * @access Private (Gerente)
 * @middleware verify.gerente
 * @controller usuarioController.listarVendores
 */
router.get('/vendedores', verify.gerente, usuarioController.listarVendores);

/**
 * Registra um novo vendedor no sistema.
 * Acesso restrito: Apenas Gerentes podem criar novos usuários.
 * * @route POST /registrar/vendedor
 * @access Private (Gerente)
 * @middleware verify.gerente
 * @controller usuarioController.criarVendedor
 */
router.post('/registrar/vendedor', verify.gerente, usuarioController.criarVendedor);

/**
 * Atualiza dados de um vendedor específico.
 * Acesso restrito: Apenas Gerentes podem alterar dados de vendedores.
 * * @route PUT /vendedores/:idUsuario
 * @access Private (Gerente)
 * @param {string} :idUsuario - UUID do vendedor.
 * @middleware verify.gerente
 * @controller usuarioController.atualizarVendedor
 */
router.put('/vendedores/:idUsuario', verify.gerente, usuarioController.atualizarVendedor);

/**
 * Remove um vendedor do sistema.
 * * @route DELETE /vendedores/:idUsuario
 * @param {string} :idUsuario - UUID do vendedor.
 * @controller usuarioController.deletarVendedor
 */
router.delete('/vendedores/:idUsuario', usuarioController.deletarVendedor);

module.exports = router;