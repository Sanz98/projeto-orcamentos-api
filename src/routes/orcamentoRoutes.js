const express = require("express");
const router =express.Router();
const {orcamentoController}= require("../controllers/orcamentoController");
const {authController} = require("../controllers/orcamentoController");
const {verify} = require("../middlewares/authMiddleware");


// GET /produtos -> Listar todos os produtos.
router.get('/orcamento',  verify.protegerRota,
    orcamentoController.listarOrcamento);


module.exports = {orcamentoRoutes: router};