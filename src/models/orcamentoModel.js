const {sql, getConnection}= require("../config/db");

const orcamentoModel={
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

}

module.exports = {orcamentoModel};


