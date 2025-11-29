const express = require("express");
const router = express.Router();
const { orcamentoController } = require("../controllers/orcamentoController");
const { authController } = require("../controllers/authController");
const { verify } = require("../middlewares/authMiddleware");


// Rota PUT para atualizar (recebe o ID na URL)
// Endpoint: PUT http://localhost:3000/orcamentos/:id
        // PUT / Atualizar Orcamentos
router.put('/orcamentos/:id', verify.protegerRota, orcamentoController.atualizarOrcamento);

module.exports={orcamentoRoutes: router};