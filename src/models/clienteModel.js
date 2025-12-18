// Importamos o objeto 'sql' (tipos de dados) e a função de conexão do driver.
const { sql, getConnection } = require('../config/db');

/**
 * Camada de Acesso a Dados (Data Access Layer - DAL) para a entidade Clientes.
 * Responsável exclusivamente por executar comandos SQL, isolando o banco da regra de negócio.
 */
const clienteModel = {

    /**
     * Busca todos os clientes cadastrados no banco.
     * Ordena os resultados alfabeticamente para facilitar a exibição no front-end.
     * @async
     * @returns {Promise<Array<object>>} Retorna o array de registros (recordset).
     */
    buscarTodos: async () => {
        try {
            const pool = await getConnection();
            const querySQL = "SELECT * FROM clientes ORDER BY nomeCliente ASC";
            
            const result = await pool.request().query(querySQL);
            return result.recordset;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            // Relança o erro para que o Controller possa tratar a resposta HTTP adequadamente.
            throw error;
        }
    },

    /**
     * Busca um único cliente baseado no seu ID (Primary Key).
     * Utiliza parâmetros para prevenir SQL Injection.
     * @async
     * @param {string} idCliente - O UUID do cliente (36 caracteres).
     * @returns {Promise<object|undefined>} O objeto do cliente se encontrado, ou undefined.
     */
    buscarPorId: async (idCliente) => {
        try {
            const pool = await getConnection();
            const querySQL = "SELECT * FROM clientes WHERE idCliente = @idCliente";

            const result = await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente) // Bind seguro do parâmetro
                .query(querySQL);

            // Retorna apenas o primeiro item (já que ID é único) ou undefined se vazio.
            return result.recordset[0];
        } catch (error) {
            console.error('Erro ao buscar cliente por ID:', error);
            throw error;
        }
    },

    /**
     * Insere um novo registro de cliente.
     * Assume que o banco gera o ID automaticamente (via DEFAULT NEWID()) ou Trigger.
     * @async
     * @param {string} nomeCliente - Nome completo.
     * @param {string} telefoneCliente - Telefone (formato texto, max 12 chars).
     * @returns {Promise<void>}
     */
    inserir: async (nomeCliente, telefoneCliente) => {
        try {
            const pool = await getConnection();
            const querySQL = "INSERT INTO clientes (nomeCliente, telefoneCliente) VALUES (@nome, @telefone)";

            await pool.request()
                // Define explicitamente os tipos SQL para validação extra
                .input('nome', sql.VarChar(100), nomeCliente)
                .input('telefone', sql.Char(12), telefoneCliente)
                .query(querySQL);
        } catch (error) {
            console.error('Erro ao inserir cliente:', error);
            throw error;
        }
    },

    /**
     * Atualiza os dados de um cliente existente.
     * @async
     * @param {string} idCliente - ID do alvo da atualização.
     * @param {string} nomeCliente - Novo nome.
     * @param {string} telefoneCliente - Novo telefone.
     * @returns {Promise<void>}
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