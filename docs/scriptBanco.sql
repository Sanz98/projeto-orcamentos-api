USE dbMarcenaria;
GO

CREATE TABLE usuarios (
    idUsuario UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE, -- Garante que não haverá emails iguais
    senhaHash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('vendedor', 'gerente')),
);
GO

CREATE TABLE orcamentos (
    idOrcamento UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nomeCliente VARCHAR(100) NOT NULL,
    telefoneCliente VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Em Analise' CHECK (status IN ('Em Analise', 'Aprovado', 'Rejeitado')),
    valorTotal DECIMAL(10, 2) NOT NULL,
    desconto DECIMAL(10, 2) DEFAULT 0.00,
    valorFinal AS (valorTotal - desconto),
    dataCriacao DATETIME DEFAULT GETDATE(),
    idVendedor UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (idVendedor) REFERENCES usuarios(idUsuario)
);
GO

CREATE TABLE itensOrcamento (
    idItem UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    descricao VARCHAR(255) NOT NULL,
    valorUnitario DECIMAL(10, 2) NOT NULL,
    quantidade INT DEFAULT 1,
    idOrcamento UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (idOrcamento) REFERENCES orcamentos(idOrcamento) ON DELETE CASCADE
);
GO