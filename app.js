const express = require('express');
const app = express();
const port = 3000; // Porta padrão da API

// --- Importação das Rotas ---
// (Importamos os arquivos da pasta /src/routes)
const authRoutes = require('./src/routes/authRoutes');
const { produtoRoutes: orcamentoRoutes } = require('./src/routes/orcamentoRoutes');

// --- Middlewares Essenciais ---
// Habilita o Express para entender JSON no corpo das requisições
app.use(express.json());

// --- Definição das Rotas ---

// Rota "raiz" (teste)
app.get('/', (req, res) => {
  res.send('API da Marcenaria no ar!');
});

// Rotas de Autenticação (ex: /login)
app.use('/', authRoutes);

// Rotas de Orçamentos (ex: /orcamentos)
app.use('/', orcamentoRoutes);


// --- Inicialização do Servidor ---
// O servidor "ouve" na porta definida
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});