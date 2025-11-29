const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path'); // Módulo nativo do Node.js para lidar com caminhos de arquivos
const authRoutes = require('./src/routes/authRoutes');
const orcamentoRoutes = require('./src/routes/orcamentoRoutes');
const app = express();
const PORT = process.env.PORT; // Porta onde o servidor vai rodar

// --- Middlewares Essenciais ---
app.use(express.json());



// Rota raiz da API (opcional, pois o index.html já vai carregar na raiz)
// Se você acessar http://localhost:3000/api, verá essa mensagem.
app.get('/api', (req, res) => {
  res.send('API da Marcenaria no ar! (Acesse a raiz para ver o Front-end)');
});

// Rotas de Autenticação (ex: /login, /registrar)
// Se usar app.use('/auth', authRoutes), a rota vira /auth/login.
// Se usar app.use('/', authRoutes), a rota vira /login (mais simples para este MVP).
app.use('/', authRoutes);
app.use('/', orcamentoRoutes);


// --- Inicialização do Servidor ---
app.listen(PORT,()=>{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
