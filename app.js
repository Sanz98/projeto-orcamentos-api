// 1. Configuração de Variáveis de Ambiente
require('dotenv').config(); 

// 2. Módulos Nativos
const path = require('path');

// 3. Módulos de Terceiros
const express = require('express');
const cookieParser = require('cookie-parser'); 
const cors = require('cors');

// 4. Importação das Rotas (Módulos Internos)
const authRoutes = require('./src/routes/authRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const orcamentoRoutes = require('./src/routes/orcamentoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

// --- Inicialização da Aplicação ---
const app = express();
const PORT = process.env.PORT || 8081;

// --- Middlewares Globais ---

app.use(express.json());
app.use(cookieParser()); 

// --- ALTERAÇÃO AQUI: Configuração de CORS atualizada ---
// Agora aceita uma lista de origens (Localhost, IP do Live Server e Futura Produção)
const originsAllowed = [
    'http://localhost:5500',      // VS Code padrão
    'http://127.0.0.1:5500',      // Live Server via IP
    'https://seu-site-no-ar.com'  // Coloque aqui sua URL de produção no futuro
];

app.use(cors({
    origin: originsAllowed, 
    credentials: true // OBRIGATÓRIO para o cookie passar
}));
// -------------------------------------------------------

// --- Definição de Rotas ---

app.get('/api', (req, res) => {
  res.send('API da Marcenaria no ar!');
});

app.use('/', authRoutes); 
app.use('/', clienteRoutes); 
app.use('/', orcamentoRoutes); 
app.use('/', usuarioRoutes); 

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});