const express = require('express');
const router = express.Router();
const { usuarioController } = require('../controllers/usuarioController');
const { verify } = require('../middleware/authMiddleware');

/**
 * @fileoverview Roteador Administrativo de Usuários.
 * Contém rotas restritas para gestão de equipe (CRUD de Vendedores).
 * Regra de Ouro: Apenas 'gerentes' podem acessar estas rotas.
 */

// --- MIDDLEWARE CHAINING ---
// A ordem dos fatores ALTERA o produto:
// 1. verify.autenticado: Verifica se o token existe e é válido (Quem é você?)
// 2. verify.gerente: Verifica se o perfil no token é 'gerente' (Você pode entrar aqui?)

/**
 * Lista todos os vendedores cadastrados.
 * @route GET /vendedores
 * @access Private/Gerente
 */
router.get('/vendedores', verify.autenticado, verify.gerente, usuarioController.listarVendores);

/**
 * Registra um novo vendedor.
 * @route POST /registrar/vendedor
 * @access Private/Gerente
 */
router.post('/registrar/vendedor', verify.autenticado, verify.gerente, usuarioController.criarVendedor);

/**
 * Atualiza dados de um vendedor.
 * @route PUT /atualizar/vendedores/:idUsuario
 * @param {string} idUsuario - ID do vendedor a ser editado.
 * @access Private/Gerente
 */
router.put('/atualizar/vendedores/:idUsuario', verify.autenticado, verify.gerente, usuarioController.atualizarVendedor);

/**
 * Remove um vendedor do sistema.
 * @route DELETE /deletar/vendedores/:idUsuario
 * @param {string} idUsuario - ID do vendedor a ser excluído.
 * @access Private/Gerente
 */
router.delete('/deletar/vendedores/:idUsuario', verify.autenticado, verify.gerente, usuarioController.deletarVendedor);

module.exports = router;