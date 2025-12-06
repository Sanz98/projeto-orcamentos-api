require("dotenv").config();
const {sql, getConnection} = require("../src/config/db");

// CRIAÇÃO DE CLIENTES
(async function criaCliente() {
    try {
        
        const pool = await getConnection();

        const sql = `INSERT INTO clientes (nomeCliente, telefoneCliente) 
        OUTPUT INSERTED.nomeCliente, INSERTED.telefoneCliente
        VALUES ('Osvaldo Cruz', '019123456789')`;

        const cliente = await pool.request()
            .query(sql);

        console.log(`Criado 1 cliente:`, cliente.recordset);

        await pool.close();

    } catch (error) {
        console.error("Erro ao criar cliente:",error);
    }
})()