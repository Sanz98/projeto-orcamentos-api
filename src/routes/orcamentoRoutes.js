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

// Adicione esta linha junto com as outras rotas GET
router.get('/orcamentos/:id', verify.autenticado, orcamentoController.buscarOrcamentoPorId);

// POST e PUT também devem ser protegidos, certo?
// Adicione o verify.autenticado neles também para garantir que quem cria/edita está logado.
router.post('/orcamentos', verify.autenticado, orcamentoController.criarOrcamento);

/**
 * Adiciona um item a um orçamento existente.
 * * @route POST /orcamentos/:id/itens
 * @access Private
 */
router.post('/orcamentos/:id/itens', verify.autenticado, orcamentoController.adicionarItem);

router.put('/orcamentos/:id', verify.autenticado, orcamentoController.atualizarOrcamento);

router.delete('/orcamentos/:id', verify.autenticado, orcamentoController.deletarOrcamento);

/**
 * Remove um item específico do orçamento.
 * * @route DELETE /orcamentos/:id/itens/:idItem
 * @access Private
 */
router.delete('/orcamentos/:id/itens/:idItem', verify.autenticado, orcamentoController.deletarItem);


// Rota Delete para deletar orcamento 

module.exports =  router;

