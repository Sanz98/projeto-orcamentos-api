const { VarChar, UniqueIdentifier } = require("mssql");
const { sql, getConnetion } = require("../config/db")

const orcamentoModel = {

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