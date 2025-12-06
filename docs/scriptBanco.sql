USE dbMarcenaria;
GO

-- 1. Tabela de Usuários (Mantive sua lógica, está ótima)
CREATE TABLE usuarios (
    idUsuario UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senhaHash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('vendedor', 'gerente'))
);
GO


-- 2. Tabela de Orçamentos (O "Cabeçalho" do PDF)
CREATE TABLE orcamentos (
    idOrcamento UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Dados do Cliente
    nomeCliente VARCHAR(100) NOT NULL,
    telefoneCliente VARCHAR(25),
    
    -- Status
    status VARCHAR(20) DEFAULT 'Em Analise' CHECK (status IN ('Em Analise', 'Aprovado', 'Rejeitado')),
    dataCriacao DATETIME DEFAULT GETDATE(),
    
    -- Lógica do Prazo de Entrega (60 dias padrão)
    -- DATEADD adiciona 60 dias (DAY) à data atual (GETDATE)
    prazoEntrega DATE DEFAULT DATEADD(DAY, 60, GETDATE()), 
    
    -- Lógica das Condições de Pagamento (Restrição de escolha)
    condicoesPagamento VARCHAR(20) DEFAULT 'A combinar' CHECK (condicoesPagamento IN ('A combinar', 'A vista', 'Parcelado')),

    -- Valores e Coluna Calculada
    valorTotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    desconto DECIMAL(10, 2) DEFAULT 0.00,
    
    -- AQUI ESTÁ O 'AS' QUE VOCÊ PERGUNTOU
    valorFinal AS (valorTotal - desconto), 
    
    -- Relacionamentos
    validadeDias INT DEFAULT 7,
    observacoes VARCHAR(MAX),
    idVendedor UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (idVendedor) REFERENCES usuarios(idUsuario)
);
GO

-- 3. Tabela de Itens (Os Ambientes do PDF)
CREATE TABLE itensOrcamento (
    idItem UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    
    -- Título do Ambiente (Ex: "COZINHA - GABINETE" )
    tituloAmbiente VARCHAR(100) NOT NULL, 
    
    -- Descrição Técnica Detalhada (Mudamos para VARCHAR(MAX) para caber tudo)
    -- Aqui vai: "SENDO ELE COM 4 GAVETAS... MATERIAIS... COR INTERNA..."
    descricaoDetalhada VARCHAR(MAX) NOT NULL, 
    
    valorUnitario DECIMAL(10, 2) NOT NULL, --  Ex: 3540.00
    quantidade INT DEFAULT 1, -- 
    
    -- Relacionamento: Este item pertence a qual orçamento?
    idOrcamento UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (idOrcamento) REFERENCES orcamentos(idOrcamento) ON DELETE CASCADE
);
GO