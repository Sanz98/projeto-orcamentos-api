//Importar a conexão com o bancos de dados e tipos de dasos SQL
const {sql, getConnection}= require("../config/db");

const orcamentoModel={
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
            UPDATE orcamentos 
            SET status = @status, 
                valorTotal = @valor 
            WHERE idOrcamento = @id`;

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

module.exports = {orcamentoModel};