/**
 * @fileoverview Ponto de entrada da API (Entry Point).
 * Configura o servidor Express, middlewares globais e rotas.
 */

// 1. Configuração de Variáveis de Ambiente (12-Factor App)
// Deve ser a primeira linha para garantir que process.env esteja carregado
require('dotenv').config(); 

// 2. Módulos Nativos
const path = require('path');

// 3. Módulos de Terceiros
const express = require('express');
const cookieParser = require('cookie-parser');

// 4. Módulos Internos (Rotas)
const authRoutes = require('./src/routes/authRoutes');
const orcamentoRoutes = require('./src/routes/orcamentoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

// --- Inicialização da Aplicação ---
const app = express();
const PORT = process.env.PORT || 8081;

// --- Global Middlewares ---

// Body Parser: Permite ler JSON no req.body (Essencial para APIs REST)
app.use(express.json());

// Cookie Parser: Lê cookies da requisição (Essencial para authMiddleware pegar o token)
app.use(cookieParser());

// --- Health Check / Rota Base ---
/**
 * @route GET /api
 * @desc Verifica se a API está online.
 */
app.get('/api', (req, res) => {
    res.send('API da Marcenaria no ar! (Acesse a raiz para ver o Front-end)');
});

// --- Registro de Rotas ---
// Monta os roteadores na raiz '/'. 
// Ex: se authRoutes tem '/login', a rota final será '/login'.
app.use('/', authRoutes);
app.use('/', usuarioRoutes);
app.use('/', orcamentoRoutes);

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});