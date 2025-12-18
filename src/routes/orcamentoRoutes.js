const express = require("express");
const router = express.Router();
const { orcamentoController } = require("../controllers/orcamentoController");
const { verify } = require("../middleware/authMiddleware");

/**
 * @fileoverview Roteador de Orçamentos.
 * Define a interface REST para manipulação de orçamentos e seus itens (sub-recursos).
 * Prefixo base esperado: /orcamentos (definido no app.js)
 */

/**
 * Lista orçamentos.
 * O retorno varia conforme o perfil (Gerente = Todos, Vendedor = Seus).
 * @route GET /orcamentos
 */
router.get('/orcamentos', verify.autenticado, orcamentoController.listarOrcamento);

/**
 * Busca detalhes de um orçamento específico.
 * @route GET /orcamentos/:id
 * @param {string} id - UUID do orçamento.
 */
router.get('/orcamentos/:id', verify.autenticado, orcamentoController.buscarOrcamentoPorId);

/**
 * Cria um novo orçamento.
 * @route POST /orcamentos
 */
router.post('/orcamentos', verify.autenticado, orcamentoController.criarOrcamento);

/**
 * Atualiza status ou valores do orçamento (Cabeçalho).
 * @route PUT /orcamentos/:id
 */
router.put('/orcamentos/:id', verify.autenticado, orcamentoController.atualizarOrcamento);

/**
 * Deleta um orçamento completo (e seus itens em cascata).
 * @route DELETE /orcamentos/:id
 */
router.delete('/orcamentos/:id', verify.autenticado, orcamentoController.deletarOrcamento);

// --- ROTAS DE SUB-RECURSOS (ITENS) ---

/**
 * Adiciona um item avulso a um orçamento existente.
 * Padrão de Sub-recurso: O item pertence ao orçamento :id.
 * @route POST /orcamentos/:id/itens
 */
router.post('/orcamentos/:id/itens', verify.autenticado, orcamentoController.adicionarItem);

/**
 * Remove um item específico de dentro de um orçamento.
 * @route DELETE /orcamentos/:id/itens/:idItem
 * @param {string} id - ID do Orçamento Pai.
 * @param {string} idItem - ID do Item a ser removido.
 */
router.delete('/orcamentos/:id/itens/:idItem', verify.autenticado, orcamentoController.deletarItem);

module.exports = router;