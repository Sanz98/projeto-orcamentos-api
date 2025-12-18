// Importa a biblioteca (driver) para conectar ao SQL Server.
const sql = require('mssql');

/**
 * Objeto com as configurações de acesso ao banco de dados.
 * Utiliza variáveis de ambiente (process.env) para não expor credenciais no código.
 * @constant {object}
 */
const CONFIG = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Obrigatório para conexões seguras (ex: Azure).
        trustServerCertificate: true // Ignora erros de certificado SSL autoassinado.
    }
};

/**
 * Estabelece e retorna uma conexão (pool) com o banco de dados.
 * * @async
 * @function getConnection
 * @returns {Promise<sql.ConnectionPool|undefined>} O pool de conexão ativo ou undefined em caso de erro.
 */
async function getConnection() {
    try {
        // Tenta conectar ao banco usando as configurações definidas.
        const pool = await sql.connect(CONFIG);
        return pool;
    } catch (error) {
        console.error('Erro na conexão SQL Server:', error);
    }
}

// IIFE (Immediately Invoked Function Expression) para testar a conexão ao carregar o arquivo.
(async () => {
    const pool = await getConnection();

    if (pool) {
        console.log("Conexão o BD estabelecida com sucesso!");
    }
})();


module.exports = {
    sql,
    getConnection
};