// Importamos o objeto 'sql' e a conexão
const { sql, getConnection } = require('../config/db');

const clienteModel = {

    /**
     * Busca todos os clientes cadastrados.
     * @returns {Promise<Array>}
     */
    buscarTodos: async () => {
        try {
            const pool = await getConnection();
            const querySQL = "SELECT * FROM clientes ORDER BY nomeCliente ASC";
            
            const result = await pool.request().query(querySQL);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw error;
        }
    },

    /**
     * Busca um cliente específico pelo ID.
     * @param {string} idCliente 
     * @returns {Promise<Object>}
     */
    buscarPorId: async (idCliente) => {
        try {
            const pool = await getConnection();
            const querySQL = "SELECT * FROM clientes WHERE idCliente = @idCliente";

            const result = await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .query(querySQL);

            return result.recordset[0];
        } catch (error) {
            console.error('Erro ao buscar cliente por ID:', error);
            throw error;
        }
    },

    /**
     * Insere um novo cliente.
     * @param {string} nomeCliente 
     * @param {string} telefoneCliente 
     */
    inserir: async (nomeCliente, telefoneCliente) => {
        try {
            const pool = await getConnection();
            const querySQL = "INSERT INTO clientes (nomeCliente, telefoneCliente) VALUES (@nome, @telefone)";

            await pool.request()
                .input('nome', sql.VarChar(100), nomeCliente)
                .input('telefone', sql.Char(12), telefoneCliente)
                .query(querySQL);
        } catch (error) {
            console.error('Erro ao inserir cliente:', error);
            throw error;
        }
    },

    /**
     * Atualiza dados de um cliente.
     * @param {string} idCliente 
     * @param {string} nomeCliente 
     * @param {string} telefoneCliente 
     */
    atualizar: async (idCliente, nomeCliente, telefoneCliente) => {
        try {
            const pool = await getConnection();
            const querySQL = `
                UPDATE clientes 
                SET nomeCliente = @nome, telefoneCliente = @telefone 
                WHERE idCliente = @idCliente
            `;

            await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .input('nome', sql.VarChar(100), nomeCliente)
                .input('telefone', sql.Char(12), telefoneCliente)
                .query(querySQL);
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            throw error;
        }
    },

};

module.exports = { clienteModel };