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

            let querySQL = "SELECT * FROM orcamentos WHERE idUsuario = @idUsuario"

            const result = await pool.request()
                .input('idVendedor', sql.
                    UniqueIdentifier, idUsuario)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar orcamento por Vendedor:", error)
            throw error;

        }


    },
    criarOrcamento: async (nomeCliente, telefoneCliente, valorTotal, idVendedor) => {
        try {
            const pool = await getConnection();


            let querySQL = 'INSERT  INTO orcamentos (nomeCliente , telefoneCliente , valorTotal , idVendedor) VALUES  (@nomeCliente , @telefoneCliente , @valorTotal, @idVendedor)';

            // Inserir e retornar o Id criado (OUTPUT inserted.idOrcamento)

            // o status inicial vai ser em analise conforme regra de negocio 

            await pool.request()
                .input('nomeCliente', sql.VarChar(100), nomeCliente)
                .input('telefoneCliente', sql.VarChar(20), telefoneCliente)
                .input('valorTotal', sql.Decimal(10, 2), valorTotal)
                .input('idVendedor', sql.UniqueIdentifier, idVendedor)
                .query(querySQL) // passando a query para executar o comando 

                


        } catch (error) {
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
}

module.exports = {
    orcamentoModel
}
