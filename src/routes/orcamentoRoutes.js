// 1. Dependências Externas
const express = require("express");
const router = express.Router();

// 2. Controllers
const { orcamentoController } = require("../controllers/orcamentoController");

// 3. Middlewares (Security Layer)
const { verify } = require("../middleware/authMiddleware");

/**
 * Rota para listar orçamentos.
 * O retorno varia conforme o perfil do usuário (Logado no middleware).
 * * @route GET /orcamentos
 * @access Private (Autenticado)
 * @middleware verify.autenticado -> Popula req.usuario
 * @controller orcamentoController.listarOrcamento
 */
router.get('/orcamentos', verify.autenticado, orcamentoController.listarOrcamento);

/**
 * Rota para criar um novo orçamento.
 * * @route POST /orcamentos
 * @access Private (Autenticado)
 * @middleware verify.autenticado
 * @controller orcamentoController.criarOrcamento
 */
router.post('/orcamentos', verify.autenticado, orcamentoController.criarOrcamento);

/**
 * Rota para atualizar status ou valores de um orçamento.
 * * @route PUT /orcamentos/:id
 * @access Private (Autenticado + Regra de Negócio no Controller)
 * @param {string} :id - ID do orçamento na URL.
 * @middleware verify.autenticado
 * @controller orcamentoController.atualizarOrcamento
 */
router.put('/orcamentos/:id', verify.autenticado, orcamentoController.atualizarOrcamento);

// TODO: Implementar rota DELETE quando houver método no Controller
// router.delete('/orcamentos/:id', verify.autenticado, orcamentoController.deletarOrcamento);

module.exports = router;