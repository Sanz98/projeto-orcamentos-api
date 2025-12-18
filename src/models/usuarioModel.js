// Importamos o objeto 'sql' e a conexão configurada.
const { sql, getConnection } = require('../config/db');

/**
 * @fileoverview Camada de Acesso a Dados (DAL) para a entidade Usuários.
 * Responsável por executar comandos SQL diretos para CRUD.
 */

/**
 * Objeto modelo que contém os métodos de interação com a tabela 'usuarios'.
 * @namespace usuarioModel
 */
const usuarioModel = {

    /**
     * Busca um usuário específico pelo ID (Primary Key).
     * @async
     * @param {string} idUsuario - O GUID/UUID do usuário.
     * @returns {Promise<Array<object>>} Retorna o recordset (Array).
     * @note CUIDADO: Diferente de 'buscarPorEmail', este método retorna um ARRAY, não o objeto direto.
     */
    buscarUm: async (idUsuario) => {
        try {
            const pool = await getConnection();
            const querySQL = 'SELECT * FROM usuarios WHERE idUsuario = @idUsuario';
            
            const result = await pool.request()
                .input('idUsuario', sql.UniqueIdentifier, idUsuario)
                .query(querySQL);

            return result.recordset; // Retorna array (ex: [ {id: 1, nome: '...'} ])
        } catch (error) {
            console.error('Erro ao buscar o usuario:', error);
            throw error;
        }
    },

    /**
     * Busca todos os usuários cadastrados no sistema.
     * @async
     * @returns {Promise<Array<object>>} Lista completa de usuários.
     */
    buscarTodos: async () => {
        try {
            const pool = await getConnection();
            const querySQL = "SELECT * FROM usuarios";

            const result = await pool.request().query(querySQL);
            return result.recordset;
        } catch (error) {
            console.error("Erro ao buscar usuarios:", error);
            throw error;
        }
    },

    /**
     * Busca um usuário utilizando o e-mail como chave de busca.
     * Útil para validação de login ou recuperação de senha.
     * @async
     * @param {string} email - O email do usuário.
     * @returns {Promise<object|undefined>} O objeto do usuário encontrado ou undefined.
     */
    buscarPorEmail: async (email) => {
        try {
            const pool = await getConnection();
            const querySQL = "SELECT * FROM usuarios WHERE email = @email";

            const result = await pool.request()
                .input('email', sql.VarChar(100), email)
                .query(querySQL);

            // Retorna o primeiro registro encontrado (Objeto único)
            return result.recordset[0];
        } catch (error) {
            console.error("Erro ao buscar usuario pelo email:", error);
            throw error;
        }
    },

    /**
     * Insere um novo usuário no banco de dados.
     * @async
     * @param {string} nome - Nome completo.
     * @param {string} email - Email único.
     * @param {string} senhaHash - Senha já criptografada (bcrypt).
     * @param {string} perfil - Perfil de acesso (ex: 'gerente', 'vendedor').
     * @returns {Promise<void>}
     */
    inserir: async (nome, email, senhaHash, perfil) => {
        try {
            const pool = await getConnection();
            const querySQL = 'INSERT INTO usuarios (nome, email, senhaHash, perfil) VALUES (@nome, @email, @senhaHash, @perfil)';

            await pool.request()
                .input('nome', sql.VarChar(100), nome)
                .input('email', sql.VarChar(100), email)
                .input('senhaHash', sql.VarChar(255), senhaHash)
                .input('perfil', sql.VarChar(20), perfil)
                .query(querySQL);
        } catch (error) {
            console.error('Erro ao inserir usuario:', error);
            throw error;
        }
    },

    /**
     * Atualiza os dados cadastrais básicos de um usuário.
     * @async
     * @param {string} idUsuario - ID do usuário a ser editado.
     * @param {string} nome - Novo nome.
     * @param {string} email - Novo email.
     */
    atualizar: async (idUsuario, nome, email) => {
        try {
            const pool = await getConnection();
            const querySQL = `
                UPDATE usuarios
                SET nome = @nome,
                    email = @email
                WHERE idUsuario = @idUsuario
            `;
            
            await pool.request()
                .input('nome', sql.VarChar(100), nome)
                .input('email', sql.VarChar(100), email)
                .input('idUsuario', sql.UniqueIdentifier, idUsuario)
                .query(querySQL);
        } catch (error) {
            console.error('Erro ao atualizar usuario:', error);
            throw error;
        }
    },

    /**
     * Remove permanentemente um usuário do banco.
     * @async
     * @param {string} idUsuario - ID do usuário a ser excluído.
     */
    deletar: async (idUsuario) => {
        try {
            const pool = await getConnection();
            const querySQL = `DELETE FROM usuarios WHERE idUsuario = @idUsuario`;

            await pool.request()
                .input("idUsuario", sql.UniqueIdentifier, idUsuario)
                .query(querySQL);
        } catch (error) {
            console.error('Erro ao deletar o usuario: ', error);
            throw error;
        }
    }
};

module.exports = { usuarioModel };