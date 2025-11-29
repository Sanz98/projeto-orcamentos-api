const { sql, getConnetion } = require("../config/db")

const orcamentoModel = {
        /**
     * Modelo que busca todos os produtos no banco de dados
     * 
     * @async 
     * @function buscarTodos
     * @returns  {Promise<Array>} Retorna uma lista com todos os Produtos
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */


    buscarTodos:async ()=>{
        try {
            const pool=await getConnection();

            let querySQL ="SELECT * FROM Orcamento";

            const result =await pool.request().query(querySQL);
            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar orcamentos:", error);
            throw error;
        }

    },

     buscarPorVendedor: async (idVendedor) => {
        try {
            const pool = await getConnection();

            let querySQL = "SELECT * FROM orcamentos WHERE idVendedor = @idVendedor"
            
            const result = await pool.request()
            .input('idVendedor', sql.
            UniqueIdentifier,idVendedor)
            .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar orcamento por Vendedor:", error)
            throw error;
            
        }
   
     
}
        criarOrcamento: async (nomeCliente, telefoneCliente) => {
                try {
                        const pool = await getConnetion();


                        let querySQL = 'INSERT  INTO orcamento (nomeCliente , telefoneCliente , valorTotal , idVendedor) VALUES  (@nomeCliente , @telefoneCliente , @valorTotal, @idVendedor)';

                        // Inserir e retornar o Id criado (OUTPUT inserted.idOrcamento)

                        // o status inicial vai ser em analise conforme regra de negocio 

                        await pool.request()
                                .input('nomeCliente', sql.VarChar(100), nomeCliente


                                        .input('telefoneCliente ', sql.VarChar(20), telefoneCliente)

                                        .input('idOrcamento', sql.UniqueIdentifier)

                                        .input('valorTotal', sql.Decimal(10, 2), valorTotal), valorTotal

                                                .input('idVendedor', sql.UniqueIdentifier), idVendedor
                                )

                                .query(querySQL) // passando a query para executar o comando 

                } catch (error) {
                        console.error('Erro ao criar orcamento : ', error)
                        throw error; // passar para quem vai resolver este erro 
                }

        }
}

module.exports = {
        orcamentoModel
}
