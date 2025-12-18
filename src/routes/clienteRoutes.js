const express = require('express');
const router = express.Router();

const { clienteController } = require('../controllers/clienteController');
const { verify } = require('../middleware/authMiddleware');

/**
 * @fileoverview Roteador do recurso "Clientes".
 * Define os endpoints RESTful e aplica os middlewares de segurança necessários.
 * Prefixo esperado: /clientes (definido no app.js)
 */

/**
 * Recupera a lista completa de clientes.
 * @route GET /clientes
 * @middleware verify.autenticado - Exige token de login válido.
 */
router.get('/clientes', verify.autenticado, clienteController.listarClientes);

/**
 * Recupera um único cliente baseado no ID.
 * @route GET /clientes/:id
 * @param {string} id - UUID do cliente.
 * @middleware verify.autenticado
 */
router.get('/clientes/:id', verify.autenticado, clienteController.buscarClientePorId);

/**
 * Cadastra um novo cliente no sistema.
 * @route POST /clientes
 * @middleware verify.autenticado
 */
router.post('/clientes', verify.autenticado, clienteController.criarCliente);

/**
 * Atualiza os dados de um cliente existente.
 * @route PUT /clientes/:id
 * @param {string} id - UUID do cliente a ser atualizado.
 * @middleware verify.autenticado
 */
router.put('/clientes/:id', verify.autenticado, clienteController.atualizarCliente);

module.exports = router;