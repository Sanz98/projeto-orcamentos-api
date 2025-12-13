// Importar a conexão com o banco de dados e tipos de dados SQL
const { sql, getConnection } = require("../config/db");

const orcamentoModel = {

    /**
     * Modelo que busca todos os orçamentos no banco de dados.
     * * @async 
     * @function buscarTodos
     * @returns {Promise<Array>} Retorna uma lista (Recordset) com todos os orçamentos.
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

    /**
     * Busca orçamentos filtrados pelo ID do usuário (vendedor).
     * * @async
     * @function buscarPorVendedor
     * @param {string} idUsuario - O ID do vendedor logado.
     * @returns {Promise<Array>} Retorna lista de orçamentos vinculados ao usuário.
     */
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

    /**
     * Busca um orçamento específico pelo ID.
     * Útil para validações antes de edição.
     * * @async
     * @function buscarPorId
     * @param {string} id - O ID do orçamento.
     * @returns {Promise<Array>} Retorna um array (recordset) contendo o orçamento encontrado.
     */
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

    /**
     * Cria um novo orçamento no banco de dados.
     * O status inicial será definido conforme regra de negócio do banco ou default.
     * * @async
     * @function criarOrcamento
     * @param {string} nomeCliente - Nome do cliente.
     * @param {string} telefoneCliente - Telefone do cliente.
     * @param {number} valorTotal - Valor total do orçamento.
     * @param {string} idVendedor - ID do vendedor responsável.
     * @returns {Promise<void>} Não retorna dados, apenas executa a inserção.
     */
    criarOrcamento: async (nomeCliente, telefoneCliente, valorTotal, idVendedor) => {
        try {
            const pool = await getConnection();

            let querySQL = 'INSERT INTO orcamentos (nomeCliente , telefoneCliente , valorTotal , idVendedor) VALUES (@nomeCliente , @telefoneCliente , @valorTotal, @idVendedor)';

            // Inserir e retornar o Id criado (OUTPUT inserted.idOrcamento)
            // o status inicial vai ser em analise conforme regra de negocio 

            await pool.request()
                .input('nomeCliente', sql.VarChar(100), nomeCliente)
                .input('telefoneCliente', sql.VarChar(20), telefoneCliente)
                .input('valorTotal', sql.Decimal(10, 2), valorTotal)
                .input('idVendedor', sql.UniqueIdentifier, idVendedor)
                .query(querySQL); // passando a query para executar o comando 

        } catch (error) {
            console.error('Erro ao criar orcamento : ', error);
            throw error; // passar para quem vai resolver este erro 
        }
    },

    /**
     * Atualiza o status e valor de um orçamento existente.
     * * @async
     * @function atualizarOrcamento
     * @param {string} id - ID do orçamento a ser atualizado.
     * @param {Object} dados - Objeto contendo status e valorTotal.
     * @returns {Promise<void>} Apenas executa o update.
     */
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
};