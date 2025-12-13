// Importa a biblioteca para conectar ao SQL Server.
const sql = require('mssql');

// Objeto com as configurações de acesso ao banco de dados.
const CONFIG ={
    user: process.env.DB_USER,
    password:process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options:{
        encrypt: true,
        trustServerCertificate: true //Ignora o erro de certificação autoassinado
    }
}

// Função assíncrona que estabelece e retorna um pool de conexões.
async function getConnection(){
    try {
        // Tenta conectar ao banco usando as configurações definidas.
        const pool = await sql.connect(CONFIG);
        return pool;
    } catch (error) {
        console.error('Erro na conexão SQL Serve:', error);
    }
}

(async () => {
    const pool = await getConnection();

    if (pool) {
        console.log("Conexão o BD estabelecida com sucesso!");
    }
})();

// Exporta a função e a biblioteca para serem usadas em outras partes do projeto.
module.exports ={sql, getConnection};