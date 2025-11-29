const express = require("express");
const router = express.Router();
const { orcamentoController } = require("../controllers/orcamentoController");
const { verify } = require("jsonwebtoken");

router.get('/orcamentos', orcamentoController.listarOrcamento);

// POST /Orçamento ->  criar um novo orçamento 
router.post('/orcamentos', orcamentoController.criarOrcamento);

// Rota PUT para atualizar (recebe o ID na URL)
// Endpoint: PUT http://localhost:3000/orcamentos/:id
// PUT / Atualizar Orcamentos
router.put('/orcamentos/:id', orcamentoController.atualizarOrcamento);

module.exports = router;

