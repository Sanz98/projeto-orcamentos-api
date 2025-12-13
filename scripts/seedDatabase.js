require("dotenv").config();
const { sql, getConnection } = require("../src/config/db");
const bcrypt = require("bcrypt");
const SALT = 10;

// EXCLUSÃO DE DADOS ANTERIORES
async function deleteAll() {
    try {

        const pool = await getConnection();

        let querySQL = `DELETE FROM usuarios`;

        await pool.request()
            .query(querySQL);

        querySQL = `DELETE FROM clientes`;

        await pool.request()
            .query(querySQL);

        console.log(`DELETADOS DADOS ANTERIORES!`);

        await pool.close();

    } catch (error) {
        console.error("Erro ao deletar dados anteriores:", error);
    }
};

// CRIAÇÃO DE GERENTE E VENDEDOR
async function criaGerente() {
    try {

        const pool = await getConnection();

        let senhaHash = bcrypt.hashSync('admin123', SALT);

        let querySQL = `INSERT INTO usuarios (nome, email, senhaHash, perfil) 
    OUTPUT INSERTED.nome, INSERTED.email, INSERTED.senhaHash, INSERTED.perfil
    VALUES ('Gerente Master', 'admin@email.com', @senhaHash, 'gerente')`;

        let gerente = await pool.request()
            .input('senhaHash', sql.VarChar(255), senhaHash)
            .query(querySQL);

        console.log(`Criado 1 gerente:`, gerente.recordset);

        senhaHash = bcrypt.hashSync('vendedor123', SALT);

        querySQL = `INSERT INTO usuarios (nome, email, senhaHash, perfil) 
    OUTPUT INSERTED.nome, INSERTED.email, INSERTED.senhaHash, INSERTED.perfil
    VALUES ('Vendedor Master', 'vendedor@email.com', @senhaHash, 'vendedor')`;

        const vendedor = await pool.request()
            .input('senhaHash', sql.VarChar(255), senhaHash)
            .query(querySQL);

        console.log(`Criado 1 vendedor:`, vendedor.recordset);

        await pool.close();

    } catch (error) {
        console.error("Erro ao criar gerente:", error);
    }
};

// CRIAÇÃO DE CLIENTES
async function criaCliente() {
    try {

        const pool = await getConnection();

        const querySQL = `INSERT INTO clientes (nomeCliente, telefoneCliente) 
    OUTPUT INSERTED.nomeCliente, INSERTED.telefoneCliente
    VALUES ('Osvaldo Cruz', '019123456789')`;

        const cliente = await pool.request()
            .query(querySQL);

        console.log(`Criado 1 cliente:`, cliente.recordset);

        await pool.close();

    } catch (error) {
        console.error("Erro ao criar cliente:", error);
    }
};

async function main() {
    await deleteAll();
    await criaGerente();
    await criaCliente();
}

main();