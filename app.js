// 1. Configuração de Variáveis de Ambiente
require('dotenv').config(); 

// 2. Módulos Nativos
const path = require('path');

// 3. Módulos de Terceiros
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// 4. Módulos Internos
const authRoutes = require('./src/routes/authRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const orcamentoRoutes = require('./src/routes/orcamentoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

// --- Inicialização da Aplicação ---
const app = express();
const PORT = process.env.PORT || 8081;

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser()); // Já que importou, lembre-se de usar!
app.use(cors());


app.get('/api', (req, res) => {
  res.send('API da Marcenaria no ar! (Acesse a raiz para ver o Front-end)');
});


app.use('/', authRoutes);
app.use('/', clienteRoutes);
app.use('/', orcamentoRoutes);
app.use('/', usuarioRoutes);



app.listen(PORT,()=>{
    console.log(`Servidor rodando`);
});
