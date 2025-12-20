# **Documentação da API \- Sistema de Marcenaria**

Esta documentação detalha os recursos da API de Marcenaria, incluindo formatos de requisição, respostas de sucesso e tratamentos de erros comuns que o front-end deve gerenciar.

## **Autenticação**

O sistema utiliza autenticação via JWT. O token é retornado no corpo da resposta e também definido automaticamente em um Cookie httpOnly.

#### **POST /login**

* **Descrição**: Realiza a autenticação do usuário.  
* **Body**:

{  
  "email": "vendedor@marcenaria.com",  
  "senha": "senhaSecreta123"  
}

* **Response (200 OK)**:

{  
  "message": "Logado com sucesso\!",  
  "token": "eyJhbGciOiJIUzI1NiIsInR...",  
  "usuario": {  
    "idUsuario": "uuid-do-usuario",  
    "nome": "João Silva",  
    "perfil": "vendedor"  
  }  
}

* **Error Response**:  
  * **401 Unauthorized** (E-mail não existe ou senha incorreta):

  { "erro": "Credenciais inválidas." }

  * **401 Unauthorized** (E-mail não encontrado \- *Nota: Por segurança, recomenda-se tratar igual a credenciais inválidas*):

{ "erro": "Email não encontrado" }

## **Clientes**

Gerenciamento da carteira de clientes.

#### **GET /clientes**

* **Descrição**: Obtém a lista completa de clientes (ordenados alfabeticamente).  
* **Response (200 OK)**:

\[  
  {  
    "idCliente": "uuid-cliente-1",  
    "nomeCliente": "Maria Oliveira",  
    "telefoneCliente": "11999998888"  
  }  
\]

#### **GET /clientes/:id**

* **Descrição**: Busca os dados de um cliente específico pelo ID.  
* **Response (200 OK)**:

{  
  "idCliente": "uuid-cliente",  
  "nomeCliente": "Maria Oliveira",  
  "telefoneCliente": "11999998888"  
}

* **Error Response**:  
  * **400 Bad Request** (ID com formato errado/tamanho incorreto):

  { "erro": "ID inválido." }

  * **404 Not Found** (Cliente não existe):

{ "erro": "Cliente não encontrado." }

#### **POST /clientes**

* **Descrição**: Cadastra um novo cliente.  
* **Body**:

{  
  "nomeCliente": "Novo Cliente Ltda",  
  "telefoneCliente": "11955554444"  
}

* **Response (201 Created)**:

{ "message": "Cliente cadastrado com sucesso\!" }

* **Error Response**:  
  * **400 Bad Request** (Nome vazio):

  { "erro": "O nome do cliente é obrigatório." }

  * **400 Bad Request** (Telefone muito longo):

{ "erro": "Telefone excede 12 caracteres." }

#### **PUT /clientes/:id**

* **Descrição**: Atualiza dados de um cliente. Aceita envio parcial (apenas o campo que mudou).  
* **Body**:

{  
  "nomeCliente": "Nome Corrigido",  
  "telefoneCliente": null   
}

* **Response (200 OK)**:

{ "message": "Cliente atualizado com sucesso\!" }

* **Error Response**:  
  * **400 Bad Request** (ID inválido):

  { "erro": "ID inválido." }

  * **404 Not Found**:

{ "erro": "Cliente não encontrado." }

## **Orçamentos**

Gerenciamento financeiro e de itens.  
Regra de Visibilidade: Vendedores veem apenas os seus; Gerentes veem todos.

#### **GET /orcamentos**

* **Descrição**: Lista orçamentos conforme permissão do usuário.  
* **Response (200 OK)**:

\[  
  {  
    "idOrcamento": "uuid-orcamento",  
    "nomeCliente": "Maria Oliveira",  
    "status": "Em Analise",  
    "valorTotal": 5000.00,  
    "dataCriacao": "2023-10-25T14:00:00.000Z",  
    "itens": \[\]  
  }  
\]

#### **GET /orcamentos/:id**

* **Descrição**: Busca detalhes de um orçamento.  
* **Response (200 OK)**:

{  
  "idOrcamento": "uuid-orcamento",  
  "idCliente": "uuid-cliente",  
  "status": "Em Analise",  
  "valorTotal": 5000.00,  
  "itens": \[ { "tituloAmbiente": "Sala", "valorUnitario": 5000.00, "quantidade": 1 } \]  
}

* **Error Response**:  
  * **403 Forbidden** (Vendedor tentando ver orçamento de outro vendedor):

  { "erro": "Você não tem permissão para ver este orçamento." }

  * **404 Not Found**:

{ "erro": "Orçamento não encontrado." }

#### **POST /orcamentos**

* **Descrição**: Cria orçamento com itens. O total é calculado pelo backend.  
* **Body**:

{  
  "idCliente": "uuid-cliente",  
  "prazoEntrega": "2023-12-25",  
  "condicaoPagamento": "À vista",  
  "validadeDias": 15,  
  "observacoes": "Entrega via escada",  
  "desconto": 0.00,  
  "itens": \[  
    {  
      "tituloAmbiente": "Quarto",  
      "descricaoDetalhada": "Armário",  
      "valorUnitario": 3000.00,  
      "quantidade": 1  
    }  
  \]  
}

* **Response (201 Created)**:

{  
  "message": "Orçamento criado com sucesso\!",  
  "criadoPor": "uuid-vendedor",  
  "totalBruto": 3000.00,  
  "totalLiquido": 3000.00  
}

* **Error Response**:  
  * **400 Bad Request** (Faltando cliente ou itens):

  { "erro": "Campos obrigatórios (Cliente, Itens) não preenchidos\!" }

  * **400 Bad Request** (Item com valor negativo ou sem preço):

  { "erro": "O item 'Quarto' está sem valor unitário\!" }

  * **401 Unauthorized** (Token inválido ou sem ID):

{ "erro": "Token inválido ou sem ID de usuário." }

#### **PUT /orcamentos/:id**

* **Descrição**: Atualiza status ou valor do cabeçalho.  
* **Body**:

{ "status": "Aprovado" }

* **Response (200 OK)**:

{ "message": "Orçamento atualizado com sucesso\!" }

* **Error Response**:  
  * **400 Bad Request** (Tentativa de editar orçamento já finalizado):

  { "erro": "Orçamento fechado não pode ser alterado." }

  * **403 Forbidden** (Sem permissão):

{ "erro": "Sem permissão para editar este orçamento." }

#### **DELETE /orcamentos/:id**

* **Descrição**: Exclui orçamento.  
* **Response (200 OK)**:

{ "message": "Orçamento e itens excluidos com sucesso\!" }

* **Error Response**:  
  * **400 Bad Request** (Tentativa de excluir orçamento aprovado):

{ "erro": "Não é permitido excluir orçamentos já aprovados." }

### **Itens do Orçamento (Sub-recursos)**

#### **POST /orcamentos/:id/itens**

* **Descrição**: Adiciona item a um orçamento existente.  
* **Body**:

{  
  "tituloAmbiente": "Banheiro",  
  "descricaoDetalhada": "Gabinete",  
  "valorUnitario": 800.00,  
  "quantidade": 1  
}

* **Response (201 Created)**:

{ "message": "Item adicionado com sucesso\!" }

* **Error Response**:  
  * **400 Bad Request** (Orçamento fechado):

  { "erro": "Não é possível adicionar itens a um orçamento fechado." }

  * **400 Bad Request** (Campos faltando):

{ "erro": "Campos obrigatórios do item não preenchidos\!" }

#### **DELETE /orcamentos/:id/itens/:idItem**

* **Descrição**: Remove item de um orçamento.  
* **Response (200 OK)**:

{ "message": "Item removido e valor total atualizado\!" }

* **Error Response**:  
  * **400 Bad Request** (Orçamento fechado):

{ "erro": "Não é possível remover itens de um orçamento fechado." }

## **Vendedores (Admin)**

Acesso restrito: **Apenas Gerentes**.

#### **POST /registrar/vendedor**

* **Descrição**: Cria novo vendedor.  
* **Body**:

{  
  "nome": "Carlos Souza",  
  "email": "carlos@marcenaria.com",  
  "senha": "senhaForte"  
}

* **Response (201 Created)**:

{  
  "mensagem": "Vendedor cadastrado com sucesso\!",  
  "perfil": "vendedor"  
}

* **Error Response**:  
  * **409 Conflict** (E-mail duplicado):

  { "erro": "Este e-mail já está cadastrado." }

  * **400 Bad Request** (Campos incompletos):

{ "erro": "Preencha todos os campos." }

#### **PUT /atualizar/vendedores/:idUsuario**

* **Descrição**: Edita dados do vendedor.  
* **Response (200 OK)**:

{ "message": "Vendedor atualizado com sucesso\!" }

* **Error Response**:  
  * **403 Forbidden** (Gerente tentando editar outro Gerente sem ser ele mesmo):

{ "erro": "Operação Negada: Gerentes não podem alterar o cadastro de outros Gerentes." }

#### **DELETE /deletar/vendedores/:idUsuario**

* **Descrição**: Remove vendedor.  
* **Response (200 OK)**:

{ "message": "Vendedor deletado com sucesso\!" }

* **Error Response**:  
  * **400 Bad Request** (Tentativa de auto-exclusão):

{ "erro": "Você não pode excluir sua própria conta aqui." }  
