const express = require('express')
const router = express.Router()
const { orcamentoController } = require('../controllers/orcamentoController');

router.get('/orcamento',  verify.protegerRota,
    orcamentoController.listarOrcamento);

router.post('/orcamento', orcamentoController.criarOrcamento);
// POST /Orçamento ->  criar um novo orçamento 

module.exports = { orcamentoRoutes: router }
