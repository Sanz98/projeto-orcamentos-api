//Importar a conexão com o bancos de dados e tipos de dasos SQL
const { sql, getConnection } = require("../config/db")

const orcamentoModel = {
/**
 * Modelo que busca todos os produtos no banco de dados
 * 
 * @async 
 * @function buscarTodos
 * @returns  {Promise<Array>} Retorna uma lista com todos os Produtos
 * @throws Mostra no console e propaga o erro caso a busca falhe.
 */


    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            let querySQL = "SELECT * FROM orcamentos";

            const result = await pool.request().query(querySQL);
            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar orcamentos:", error);
            throw error;
        }

    },

    buscarPorVendedor: async (idUsuario) => {
        try {
            const pool = await getConnection();
            
            // Query filtrando pelo ID do usuário logado
            const querySQL = "SELECT * FROM orcamentos WHERE idUsuario = @idUsuario";

            const result = await pool.request()
                .input('idUsuario', sql.UniqueIdentifier, idUsuario) 
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar orcamento por Vendedor:", error);
            throw error;
        }
    },

    // Busca um orçamento específico pelo ID (para validar antes de editar)
    buscarPorId: async (id) => {
        try {
            const pool = await getConnection();
            
            const querySQL = 'SELECT * FROM orcamentos WHERE idOrcamento = @id';
            
            const result = await pool.request()
            .input('id', sql.UniqueIdentifier, id)
            .query(querySQL);
            
            return result.recordset;
            
        } catch (error) {
            console.error('Erro ao buscar o ID:', error);
            throw error; // throw reverbera o erro
        }
    },
    criarOrcamento: async (idCliente, status, dataCriacao, prazoEntrega, condicaoPagamento, valorTotal, desconto, validadeDias, observacoes, idVendedor, { itens }) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        try {


            let querySQL = `INSERT  INTO orcamentos (idCliente, status, dataCriacao, prazoEntrega, valorTotal, desconto, validadeDias, observacoes, idVendedor) 
            OUTPUT INSERTED.idOrcamento
            VALUES  (@idCliente, @status, @dataCriacao, @prazoEntrega, @valorTotal, @desconto, @validadeDias, @observacoes, @idVendedor)`;

            // Inserir e retornar o Id criado (OUTPUT inserted.idOrcamento)

            // o status inicial vai ser em analise conforme regra de negocio 

            const orcamento  = await transaction.request()
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
                .query(querySQL) // passando a query para executar o comando 

            const idOrcamento = orcamento.recordset[0].idOrcamento;

            for (const item of itens) {

                querySQL = 'INSERT INTO itensOrcamento (tituloAmbiente, descricaoDetalhada, valorUnitario, quantidade, idOrcamento) VALUES  (@tituloAmbiente, @descricaoDetalhada, @valorUnitario, @quantidade, @idOrcamento)';

                await transaction.request()
                    .input('tituloAmbiente', sql.VarChar(100), item.tituloAmbiente)
                    .input('descricaoDetalhada', sql.VarChar(200), item.descricaoDetalhada)
                    .input('valorUnitario', sql.Decimal(10, 2), item.valorUnitario)
                    .input('quantidade', sql.Int, item.quantidade)
                    .input('idOrcamento', sql.UniqueIdentifier, idOrcamento)
                    .query(querySQL)

            }

            transaction.commit();

        } catch (error) {
            await transaction.rollback();
            console.error('Erro ao criar orcamento : ', error)
            throw error; // passar para quem vai resolver este erro 
        }

    },

    // Busca um orçamento específico pelo ID (para validar antes de editar)
    buscarPorId: async (id) => {
        try {
            const pool = await getConnection();

            const querySQL = 'SELECT * FROM orcamentos WHERE idOrcamento = @id';

            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error('Erro ao buscar o ID:', error);
            throw error; // throw reverbera o erro
        }
    },

    // Atualiza os dados
    atualizarOrcamento: async (id, dados) => {
        try {
            const pool = await getConnection();

            // EVITAR SQL INJECTION
            const querySQL = `
            UPDATE orcamentos SET status = @status, valorTotal = @valor WHERE idOrcamento = @id`;

            await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .input('status', sql.VarChar, dados.status)
                .input('valor', sql.Decimal(10, 2), dados.valorTotal)
                .query(querySQL);

        } catch (error) {
            console.error('Erro ao atualizar Orçamento:', error);
            throw error;
        }
    }
};

module.exports = {
    orcamentoModel
}
