# 🔌 API de Orçamentos

Bem-vindo à documentação da API de Orçamentos. Este projeto foi desenvolvido como parte do curso de Desenvolvimento de Sistemas do Senai. O objetivo é gerenciar usuários e orçamentos através de uma API RESTful.🚀 Tecnologias UtilizadasNode.js: Ambiente de execução JavaScript.Express: Framework para gerenciar as rotas e o servidor.SQL Server / MySQL: Banco de dados (ajuste conforme o que você estiver usando).JWT (JSON Web Token): Para autenticação e segurança.⚙️ Como rodar o projetoSiga os passos abaixo para executar a API no seu computador:1. Pré-requisitosCertifique-se de ter o Node.js instalado.2. InstalaçãoClone este repositório e instale as dependências:# Instalar dependências
npm install
3. Configuração do Banco de DadosCertifique-se de que seu banco de dados está rodando e configure as credenciais no arquivo .env ou config/db.js.4. Executar o servidor# Rodar com Nodemon (modo desenvolvimento)
npm start
# OU
nodemon app.js
O servidor iniciará na porta padrão (geralmente 3000 ou 8080).📚 Documentação da API (Endpoints)Aqui estão listadas as principais rotas disponíveis na aplicação, focadas nos controladores de Auth e Usuário.🔐 Autenticação (Auth)POST /auth/loginRealiza o login do usuário e retorna um token de acesso.Body (JSON):{
  "email": "usuario@exemplo.com",
  "senha": "123"
}
Resposta (200 OK):{
  "auth": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
👤 UsuáriosGET /usuariosLista todos os usuários cadastrados no sistema.Resposta (200 OK):[
  {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@email.com"
  },
  {
    "id": 2,
    "nome": "Maria Souza",
    "email": "maria@email.com"
  }
]
GET /usuarios/:idBusca um usuário específico pelo ID.Parâmetros de Rota: id (Inteiro)Resposta (200 OK):{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@email.com"
}
POST /usuariosCria um novo usuário no banco de dados.Body (JSON):{
  "nome": "Novo Usuário",
  "email": "novo@email.com",
  "senha": "senhaSegura123"
}
Resposta (201 Created):{
  "message": "Usuário criado com sucesso!",
  "id": 3
}
PUT /usuarios/:idAtualiza os dados de um usuário existente.Body (JSON):{
  "nome": "Nome Atualizado",
  "email": "email@atualizado.com"
}
Resposta (200 OK):{
  "message": "Usuário atualizado com sucesso."
}
DELETE /usuarios/:idRemove um usuário do sistema.Resposta (200 OK):{
  "message": "Usuário removido com sucesso."
}
📝 Status Codes Comuns200: Sucesso.201: Criado com sucesso.400: Erro na requisição (dados faltando ou inválidos).401: Não autorizado (Token inválido ou não fornecido).404: Não encontrado.500: Erro interno do servidor.

| Método HTTP | Caminho da Rota | Descrição | Resposta Esperada |
| :---: | :--- | :--- | :--- |
| **GET** | `/produtos` | Obtém uma lista de produtos [3]. | Array de produtos [3]. |
| **POST** | `/produtos` | Cria um novo produto [3]. | Mensagem de sucesso (JSON) [4]. |

##  API Reference [3]