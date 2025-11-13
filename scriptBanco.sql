
-- Cria o banco de dados 
CREATE DATABASE marcenariaDb;
GO

-- Muda para o contexto do novo banco
USE marcenariaDb;
GO

-- Tabela de Usuários (RF01, RF02, RNF02)
CREATE TABLE usuarios (
    idUsuario UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senhaHash VARCHAR(255) NOT NULL, -- RNF02
    perfil VARCHAR(10) NOT NULL CHECK (perfil IN ('vendedor', 'gerente')) -- RF02
);
GO

-- Tabela Principal de Orçamentos (RF03)
CREATE TABLE orcamentos (
    idOrcamento UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nomeCliente VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Em andamento', 'Enviado', 'Negociando', 'Aprovado', 'Pedido')), -- RF09
    valorTotal DECIMAL(10, 2) DEFAULT 0.00,
    desconto DECIMAL(10, 2) DEFAULT 0.00, -- RF10
    dataCriacao DATETIME DEFAULT GETDATE(),
    idVendedor UNIQUEIDENTIFIER, -- RN02 -- Chave Estrangeira
    FOREIGN KEY (idVendedor) REFERENCES usuarios(idUsuario)
);
GO

-- Tabela de Itens (RF04)
CREATE TABLE itensOrcamento (
    idItem UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    idOrcamento UNIQUEIDENTIFIER, -- Chave Estrangeira
    FOREIGN KEY (idOrcamento) REFERENCES orcamentos(idOrcamento)
);
GO