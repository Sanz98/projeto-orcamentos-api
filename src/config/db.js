const sql = require('mssql');

// Configuração da conexão utilizando variáveis de ambiente para segurança
const CONFIG = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Obrigatório para conexões seguras
        trustServerCertificate: true // Bypass na validação SSL (apenas para ambiente de dev/local)
    }
};

/**
 * Estabelece e retorna o pool de conexões com o SQL Server.
 * Utiliza o padrão Singleton gerenciado pelo próprio driver 'mssql'.
 */
async function getConnection() {
    try {
        const pool = await sql.connect(CONFIG);
        return pool;
    } catch (error) {
        console.error('Falha crítica na conexão com o SQL Server:', error);
        throw error; // Propaga o erro para ser tratado no caller ou encerrar o processo
    }
}

// Health Check: Valida a conexão imediatamente ao carregar o módulo
(async () => {
    try {
        const pool = await getConnection();
        if (pool) {
            console.log("✅ Conexão com o Database estabelecida.");
        }
    } catch (e) {
        console.error("❌ Erro ao tentar conectar na inicialização.", e);
    }
})();

// Exporta a instância do driver (para tipos de dados) e o gerenciador de conexão
module.exports = { sql, getConnection };