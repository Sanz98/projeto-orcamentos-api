/projeto-marcenaria-backend
|
|-- /src
|   |-- /config
|   |   `-- db.js               (CONCLUÍDO - Lógica de conexão com SQL Server)
|   |
|   |-- /controllers
|   |   |-- authController.js     (ESQUELETO - Funções de login/registro)
|   |   `-- orcamentoController.js  (ESQUELETO - Funções de criar/listar orçamentos)
|   |
|   |-- /middleware
|   |   `-- authMiddleware.js   (ESQUELETO - Função de proteção de rotas)
|   |
|   |-- /models
|   |   |-- usuarioModel.js     (ESQUELETO - Queries SQL da tabela Usuarios)
|   |   `-- orcamentoModel.js   (ESQUELETO - Queries SQL da tabela Orcamentos)
|   |
|   |-- /routes
|   |   |-- authRoutes.js       (ESQUELETO - Rotas /login, /registrar)
|   |   `-- orcamentoRoutes.js  (ESQUELETO - Rotas /orcamentos)
|
|-- app.js                      (CONCLUÍDO - Configuração básica do Express)
|-- .gitignore                  (CONCLUÍDO - Para ignorar o node_modules)
|-- package.json                (CONCLUÍDO - Lista de todas as dependências)
|-- README.md                   (ESQUELETO - Documentação da API)
`-- script_banco.sql            (NOVO - O script SQL para criar o banco)