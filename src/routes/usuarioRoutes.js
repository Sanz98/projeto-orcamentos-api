const express = require('express');
const router = express.Router();
const { usuarioController } = require('../controllers/usuarioController');
// Importe o middleware correto. Se o arquivo chama authMiddleware.js, use assim:
const { verify } = require('../middleware/authMiddleware'); 

// Rota: POST /registrar/vendedor
router.post('/registrar/vendedor', verify.gerente, usuarioController.criarVendedor);

// Rota: GET /vendedores
router.get('/vendedores', verify.gerente, usuarioController.listarVendores);


module.exports = router;