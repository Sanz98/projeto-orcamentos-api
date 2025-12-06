// src/routes/orcamentoRoutes.js
const express = require("express");
const router = express.Router();
const { orcamentoController } = require("../controllers/orcamentoController");

// CORREÇÃO: Importar o SEU arquivo de middleware, não a biblioteca jsonwebtoken
const { verify } = require("../middleware/authMiddleware");

// ROTA GET: Agora protegida pelo porteiro 'verify.autenticado'
// O fluxo é: 
// 1. Cliente pede -> 
// 2. verify.autenticado verifica token e coloca dados em req.usuario -> 
// 3. orcamentoController.listarOrcamento decide o que mostrar.
router.get('/orcamentos', verify.autenticado, orcamentoController.listarOrcamento);

// POST e PUT também devem ser protegidos, certo?
// Adicione o verify.autenticado neles também para garantir que quem cria/edita está logado.
router.post('/orcamentos', verify.autenticado, orcamentoController.criarOrcamento);
router.put('/orcamentos/:id', verify.autenticado, orcamentoController.atualizarOrcamento);

module.exports = router;

