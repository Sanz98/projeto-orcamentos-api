// src/models/orcamentoModel.js
const { sql, getConnection } = require("../config/db");

const orcamentoModel = {

    // --- BUSCAR TODOS ---
    buscarTodos: async () => {
        try {
            const pool = await getConnection();
            const querySQL = `
                SELECT 
                    O.idOrcamento, O.idCliente, O.status, O.valorTotal, O.dataCriacao, O.prazoEntrega, O.idVendedor,
                    C.nomeCliente, 
                    IO.idItem, IO.tituloAmbiente, IO.descricaoDetalhada, IO.valorUnitario, IO.quantidade
                FROM orcamentos O
                INNER JOIN clientes C ON O.idCliente = C.idCliente 
                LEFT JOIN itensOrcamento IO ON O.idOrcamento = IO.idOrcamento
                ORDER BY O.dataCriacao DESC
            `;
            const result = await pool.request().query(querySQL);
            return orcamentoModel._agruparItens(result.recordset);
        } catch (error) { throw error; }
    },

    // --- BUSCAR POR VENDEDOR ---
    buscarPorVendedor: async (idUsuario) => {
        try {
            const pool = await getConnection();
            const querySQL = `
                SELECT 
                    O.idOrcamento, O.idCliente, O.status, O.valorTotal, O.dataCriacao, O.prazoEntrega, O.idVendedor,
                    C.nomeCliente, 
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

    // --- BUSCAR POR ID (AQUI ESTAVA O PROBLEMA) ---
    buscarPorId: async (idOrcamento) => {
        try {
            const pool = await getConnection();
            
            // ADICIONEI O JOIN AQUI PARA TRAZER O NOME DO CLIENTE
            const querySQL = `
                SELECT 
                    O.idOrcamento, O.idCliente, O.status, O.valorTotal, O.dataCriacao, O.prazoEntrega, O.idVendedor,
                    C.nomeCliente, -- <--- Fundamental para a tela de detalhes
                    IO.idItem, IO.tituloAmbiente, IO.descricaoDetalhada, IO.valorUnitario, IO.quantidade
                FROM orcamentos O
                INNER JOIN clientes C ON O.idCliente = C.idCliente -- <--- Ligação necessária
                LEFT JOIN itensOrcamento IO ON O.idOrcamento = IO.idOrcamento
                WHERE O.idOrcamento = @idOrcamento
            `;

            const result = await pool.request()
                .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                .query(querySQL);

            const lista = orcamentoModel._agruparItens(result.recordset);
            return lista[0]; // Retorna apenas o objeto (ou undefined se não achar)

        } catch (error) {
            console.error('Erro ao buscar orçamento por ID:', error);
            throw error;
        }
    },

    // --- CRIAR ---
    criarOrcamento: async (idCliente, status, dataCriacao, prazoEntrega, condicaoPagamento, valorTotal, desconto, validadeDias, observacoes, idVendedor, { itens }) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            let querySQL = `INSERT INTO orcamentos (idCliente, status, dataCriacao, prazoEntrega, valorTotal, desconto, validadeDias, observacoes, idVendedor) 
            OUTPUT INSERTED.idOrcamento
            VALUES (@idCliente, @status, @dataCriacao, @prazoEntrega, @valorTotal, @desconto, @validadeDias, @observacoes, @idVendedor)`;

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

            for (const item of itens) {
                querySQL = 'INSERT INTO itensOrcamento (tituloAmbiente, descricaoDetalhada, valorUnitario, quantidade, idOrcamento) VALUES (@tituloAmbiente, @descricaoDetalhada, @valorUnitario, @quantidade, @idOrcamento)';
                await transaction.request()
                    .input('tituloAmbiente', sql.VarChar(100), item.tituloAmbiente)
                    .input('descricaoDetalhada', sql.VarChar(200), item.descricaoDetalhada)
                    .input('valorUnitario', sql.Decimal(10, 2), item.valorUnitario)
                    .input('quantidade', sql.Int, item.quantidade)
                    .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                    .query(querySQL);
            }
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    // --- ATUALIZAR ---
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

    // --- ADICIONAR ITEM ---
    adicionarItem: async (idOrcamento, item) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const queryInsert = `INSERT INTO itensOrcamento (tituloAmbiente, descricaoDetalhada, valorUnitario, quantidade, idOrcamento) VALUES (@titulo, @descricao, @valor, @qtd, @idOrcamento)`;
            await transaction.request()
                .input('titulo', sql.VarChar(100), item.tituloAmbiente)
                .input('descricao', sql.VarChar(200), item.descricaoDetalhada)
                .input('valor', sql.Decimal(10, 2), item.valorUnitario)
                .input('qtd', sql.Int, item.quantidade)
                .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                .query(queryInsert);

            const valorDoItem = item.valorUnitario * item.quantidade;
            const queryUpdate = `UPDATE orcamentos SET valorTotal = valorTotal + @acrescimo WHERE idOrcamento = @idOrcamento`;
            await transaction.request()
                .input('acrescimo', sql.Decimal(10, 2), valorDoItem)
                .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                .query(queryUpdate);
            await transaction.commit();
        } catch (error) { await transaction.rollback(); throw error; }
    },

    // --- DELETAR ORÇAMENTO ---
    deletarOrcamento: async (idOrcamento) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            await transaction.request().input('idOrcamento', sql.UniqueIdentifier, idOrcamento).query(`DELETE FROM itensOrcamento WHERE idOrcamento = @idOrcamento`);
            await transaction.request().input('idOrcamento', sql.UniqueIdentifier, idOrcamento).query(`DELETE FROM orcamentos WHERE idOrcamento = @idOrcamento`);
            await transaction.commit();
        } catch (error) { await transaction.rollback(); throw error; }
    },

    // --- DELETAR ITEM ---
    deletarItem: async (idOrcamento, idItem) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            const resultItem = await transaction.request().input('idItem', sql.UniqueIdentifier, idItem).query(`SELECT valorUnitario, quantidade FROM itensOrcamento WHERE idItem = @idItem`);
            if (resultItem.recordset.length === 0) throw new Error('Item não encontrado.');
            
            const { valorUnitario, quantidade } = resultItem.recordset[0];
            const valorAAbater = valorUnitario * quantidade;

            await transaction.request().input('idItem', sql.UniqueIdentifier, idItem).query(`DELETE FROM itensOrcamento WHERE idItem = @idItem`);
            await transaction.request().input('valorAAbater', sql.Decimal(10, 2), valorAAbater).input('idOrcamento', sql.UniqueIdentifier, idOrcamento).query(`UPDATE orcamentos SET valorTotal = valorTotal - @valorAAbater WHERE idOrcamento = @idOrcamento`);
            await transaction.commit();
        } catch (error) { await transaction.rollback(); throw error; }
    },

    // --- HELPER: Agrupamento de Itens (Para não repetir código) ---
    _agruparItens: (recordset) => {
        const orcamentosMap = new Map();
        recordset.forEach((linha) => {
            if (!orcamentosMap.has(linha.idOrcamento)) {
                orcamentosMap.set(linha.idOrcamento, {
                    idOrcamento: linha.idOrcamento,
                    idCliente: linha.idCliente,
                    nomeCliente: linha.nomeCliente, // <--- Importante
                    idVendedor: linha.idVendedor,
                    status: linha.status,
                    dataCriacao: linha.dataCriacao,
                    prazoEntrega: linha.prazoEntrega,
                    valorTotal: linha.valorTotal,
                    itens: []
                });
            }
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