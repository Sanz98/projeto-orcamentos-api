// src/models/orcamentoModel.js
const { sql, getConnection } = require("../config/db");

/**
 * Model responsável pela persistência de dados de Orçamentos e seus Itens.
 * Gerencia transações complexas (ACID) para garantir integridade entre cabeçalho e detalhes.
 */
const orcamentoModel = {

    /**
     * Busca todos os orçamentos do sistema com seus respectivos itens e dados do cliente.
     * Utiliza JOINs para evitar o problema de N+1 queries.
     * @returns {Promise<Array>} Lista hierárquica de orçamentos.
     */
    buscarTodos: async () => {
        try {
            const pool = await getConnection();
            // ADICIONADO: C.telefoneCliente
            const querySQL = `
                SELECT 
                    O.idOrcamento, O.idCliente, O.status, O.valorTotal, O.dataCriacao, O.prazoEntrega, O.idVendedor,
                    C.nomeCliente, C.telefoneCliente,
                    IO.idItem, IO.tituloAmbiente, IO.descricaoDetalhada, IO.valorUnitario, IO.quantidade
                FROM orcamentos O
                INNER JOIN clientes C ON O.idCliente = C.idCliente 
                LEFT JOIN itensOrcamento IO ON O.idOrcamento = IO.idOrcamento
                ORDER BY O.dataCriacao DESC
            `;
            const result = await pool.request().query(querySQL);
            
            // Transforma as linhas planas do SQL em objetos aninhados (JSON)
            return orcamentoModel._agruparItens(result.recordset);
        } catch (error) { throw error; }
    },

    /**
     * Busca orçamentos filtrados por um vendedor específico.
     * @param {string} idUsuario - ID do Vendedor.
     */
    buscarPorVendedor: async (idUsuario) => {
        try {
            const pool = await getConnection();
            // ADICIONADO: C.telefoneCliente
            const querySQL = `
                SELECT 
                    O.idOrcamento, O.idCliente, O.status, O.valorTotal, O.dataCriacao, O.prazoEntrega, O.idVendedor,
                    C.nomeCliente, C.telefoneCliente,
                    IO.idItem, IO.tituloAmbiente, IO.descricaoDetalhada, IO.valorUnitario, IO.quantidade
                FROM orcamentos O
                INNER JOIN clientes C ON O.idCliente = C.idCliente 
                LEFT JOIN itensOrcamento IO ON O.idOrcamento = IO.idOrcamento
                WHERE O.idVendedor = @idUsuario
                ORDER BY O.dataCriacao DESC
            `;
            const result = await pool.request()
                .input('idUsuario', sql.UniqueIdentifier, idUsuario)
                .query(querySQL);
                
            return orcamentoModel._agruparItens(result.recordset);
        } catch (error) { throw error; }
    },

    /**
     * Busca um orçamento específico pelo ID.
     * @param {string} idOrcamento - UUID do orçamento.
     * @returns {Promise<Object|undefined>} Objeto do orçamento ou undefined.
     */
    buscarPorId: async (idOrcamento) => {
        try {
            const pool = await getConnection();
            
            // ADICIONADO: C.telefoneCliente
            const querySQL = `
                SELECT 
                    O.idOrcamento, O.idCliente, O.status, O.valorTotal, O.dataCriacao, O.prazoEntrega, O.idVendedor, O.observacoes,
                    C.nomeCliente, C.telefoneCliente,
                    IO.idItem, IO.tituloAmbiente, IO.descricaoDetalhada, IO.valorUnitario, IO.quantidade
                FROM orcamentos O
                INNER JOIN clientes C ON O.idCliente = C.idCliente
                LEFT JOIN itensOrcamento IO ON O.idOrcamento = IO.idOrcamento
                WHERE O.idOrcamento = @idOrcamento
            `;

            const result = await pool.request()
                .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                .query(querySQL);

            const lista = orcamentoModel._agruparItens(result.recordset);
            return lista[0]; // Retorna apenas o primeiro (único) elemento
        } catch (error) {
            console.error('Erro ao buscar orçamento por ID:', error);
            throw error;
        }
    },

    /**
     * Cria um novo orçamento e insere seus itens em uma única transação atômica.
     * @transaction Garante que ou grava tudo (cabeçalho + itens) ou nada.
     */
    criarOrcamento: async (idCliente, status, dataCriacao, prazoEntrega, condicaoPagamento, valorTotal, desconto, validadeDias, observacoes, idVendedor, { itens }) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        
        // Inicia o "modo de segurança" (Transação)
        await transaction.begin();
        
        try {
            // 1. Inserção do Cabeçalho (Pai)
            // OUTPUT INSERTED.idOrcamento: Recupera o ID gerado na hora
            let querySQL = `
                INSERT INTO orcamentos (idCliente, status, dataCriacao, prazoEntrega, valorTotal, desconto, validadeDias, observacoes, idVendedor) 
                OUTPUT INSERTED.idOrcamento
                VALUES (@idCliente, @status, @dataCriacao, @prazoEntrega, @valorTotal, @desconto, @validadeDias, @observacoes, @idVendedor)
            `;

            const orcamento = await transaction.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .input('status', sql.VarChar(20), status)
                .input('dataCriacao', sql.DateTime, dataCriacao)
                .input('prazoEntrega', sql.Date, prazoEntrega)
                .input('condicaoPagamento', sql.VarChar(20), condicaoPagamento)
                .input('valorTotal', sql.Decimal(10, 2), valorTotal)
                .input('desconto', sql.Decimal(10, 2), desconto)
                .input('validadeDias', sql.Int, validadeDias)
                .input('observacoes', sql.VarChar(200), observacoes)
                .input('idVendedor', sql.UniqueIdentifier, idVendedor)
                .query(querySQL);

            const idOrcamento = orcamento.recordset[0].idOrcamento;

            // 2. Inserção dos Itens (Filhos)
            for (const item of itens) {
                querySQL = `
                    INSERT INTO itensOrcamento (tituloAmbiente, descricaoDetalhada, valorUnitario, quantidade, idOrcamento) 
                    VALUES (@tituloAmbiente, @descricaoDetalhada, @valorUnitario, @quantidade, @idOrcamento)
                `;
                
                await transaction.request()
                    .input('tituloAmbiente', sql.VarChar(100), item.tituloAmbiente)
                    .input('descricaoDetalhada', sql.VarChar(200), item.descricaoDetalhada)
                    .input('valorUnitario', sql.Decimal(10, 2), item.valorUnitario)
                    .input('quantidade', sql.Int, item.quantidade)
                    .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                    .query(querySQL);
            }
            
            // Efetiva as mudanças no banco
            await transaction.commit();
        } catch (error) {
            // Desfaz tudo se der erro
            await transaction.rollback();
            throw error;
        }
    },

    /**
     * Atualiza dados básicos do orçamento (Status e Valor Total).
     */
    atualizarOrcamento: async (idOrcamento, dados) => {
        try {
            const pool = await getConnection();
            const querySQL = `UPDATE orcamentos SET status = @status, valorTotal = @valor WHERE idOrcamento = @idOrcamento`;
            await pool.request()
                .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                .input('status', sql.VarChar, dados.status)
                .input('valor', sql.Decimal(10, 2), dados.valorTotal)
                .query(querySQL);
        } catch (error) { throw error; }
    },

    /**
     * Adiciona um item e atualiza o valor total do orçamento em transação.
     * Evita inconsistência financeira (Item existe mas valor total não subiu).
     */
    adicionarItem: async (idOrcamento, item) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();

            // 1. Insere o item
            const queryInsert = `INSERT INTO itensOrcamento (tituloAmbiente, descricaoDetalhada, valorUnitario, quantidade, idOrcamento) VALUES (@titulo, @descricao, @valor, @qtd, @idOrcamento)`;
            await transaction.request()
                .input('titulo', sql.VarChar(100), item.tituloAmbiente)
                .input('descricao', sql.VarChar(200), item.descricaoDetalhada)
                .input('valor', sql.Decimal(10, 2), item.valorUnitario)
                .input('qtd', sql.Int, item.quantidade)
                .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                .query(queryInsert);

            // 2. Recalcula o total do pai (Update Incremental)
            const valorDoItem = item.valorUnitario * item.quantidade;
            const queryUpdate = `UPDATE orcamentos SET valorTotal = valorTotal + @acrescimo WHERE idOrcamento = @idOrcamento`;
            await transaction.request()
                .input('acrescimo', sql.Decimal(10, 2), valorDoItem)
                .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                .query(queryUpdate);

            await transaction.commit();
        } catch (error) { await transaction.rollback(); throw error; }
    },

    /**
     * Remove um orçamento e todos os seus itens (Cascade via Código).
     */
    deletarOrcamento: async (idOrcamento) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            // Ordem importa: Remove filhos primeiro para não violar Foreign Key (se não houver ON DELETE CASCADE no banco)
            await transaction.request().input('idOrcamento', sql.UniqueIdentifier, idOrcamento).query(`DELETE FROM itensOrcamento WHERE idOrcamento = @idOrcamento`);
            await transaction.request().input('idOrcamento', sql.UniqueIdentifier, idOrcamento).query(`DELETE FROM orcamentos WHERE idOrcamento = @idOrcamento`);
            await transaction.commit();
        } catch (error) { await transaction.rollback(); throw error; }
    },

    /**
     * Remove um item e abate seu valor do total do orçamento.
     */
    deletarItem: async (idOrcamento, idItem) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            
            // 1. Busca valor do item para saber quanto descontar
            const resultItem = await transaction.request().input('idItem', sql.UniqueIdentifier, idItem).query(`SELECT valorUnitario, quantidade FROM itensOrcamento WHERE idItem = @idItem`);
            if (resultItem.recordset.length === 0) throw new Error('Item não encontrado.');
            
            const { valorUnitario, quantidade } = resultItem.recordset[0];
            const valorAAbater = valorUnitario * quantidade;

            // 2. Deleta o item
            await transaction.request().input('idItem', sql.UniqueIdentifier, idItem).query(`DELETE FROM itensOrcamento WHERE idItem = @idItem`);
            
            // 3. Atualiza o pai
            await transaction.request().input('valorAAbater', sql.Decimal(10, 2), valorAAbater).input('idOrcamento', sql.UniqueIdentifier, idOrcamento).query(`UPDATE orcamentos SET valorTotal = valorTotal - @valorAAbater WHERE idOrcamento = @idOrcamento`);
            
            await transaction.commit();
        } catch (error) { await transaction.rollback(); throw error; }
    },

    /**
     * Helper Privado: Transforma o "Recordset" plano (SQL JOIN) em Objeto Hierárquico.
     * Resolve o problema de duplicação de dados do cabeçalho quando há múltiplos itens.
     * @private
     */
    _agruparItens: (recordset) => {
        const orcamentosMap = new Map();
        recordset.forEach((linha) => {
            // Se o orçamento ainda não está no mapa, adiciona o cabeçalho
            if (!orcamentosMap.has(linha.idOrcamento)) {
                orcamentosMap.set(linha.idOrcamento, {
                    idOrcamento: linha.idOrcamento,
                    idCliente: linha.idCliente,
                    nomeCliente: linha.nomeCliente,
                    telefoneCliente: linha.telefoneCliente, // <--- ADICIONADO AQUI TAMBÉM
                    idVendedor: linha.idVendedor,
                    status: linha.status,
                    dataCriacao: linha.dataCriacao,
                    prazoEntrega: linha.prazoEntrega,
                    valorTotal: linha.valorTotal,
                    observacoes: linha.observacoes, // <--- Adicionado observacoes que estava faltando no objeto final
                    itens: [] // Inicia array vazio
                });
            }
            // Se a linha tem dados de item, adiciona no array de itens
            if (linha.idItem) {
                orcamentosMap.get(linha.idOrcamento).itens.push({
                    idItem: linha.idItem,
                    tituloAmbiente: linha.tituloAmbiente,
                    descricaoDetalhada: linha.descricaoDetalhada,
                    valorUnitario: linha.valorUnitario,
                    quantidade: linha.quantidade
                });
            }
        });
        return Array.from(orcamentosMap.values());
    }
};

module.exports = { orcamentoModel };