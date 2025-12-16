const express = require('express');
const router = express.Router();

const { clienteController } = require('../controllers/clienteController');
const { verify } = require('../middleware/authMiddleware');

/**
 * Lista todos os clientes.
 * @route GET /clientes
 * @access Private
 */
router.get('/clientes', verify.autenticado, clienteController.listarClientes);

/**
 * Busca um cliente pelo ID.
 * @route GET /clientes/:id
 * @access Private
 */
router.get('/clientes/:id', verify.autenticado, clienteController.buscarClientePorId);

/**
 * Cria um novo cliente.
 * @route POST /clientes
 * @access Private
 */
router.post('/clientes', verify.autenticado, clienteController.criarCliente);

/**
 * Atualiza um cliente existente.
 * @route PUT /clientes/:id
 * @access Private
 */
router.put('/clientes/:id', verify.autenticado, clienteController.atualizarCliente);


module.exports = router;