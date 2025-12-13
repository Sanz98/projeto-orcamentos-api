// Importamos o objeto 'sql' e a função de conexão
const { sql, getConnection } = require('../config/db');

/**
 * @fileoverview Módulo de modelo para manipulação de dados da tabela usuarios.
 * Contém funções para buscar, inserir, atualizar e deletar usuario.
 */

/**
 * @typedef {object} usuarios
 * @property {string} idUsuario O ID único do usuario (geralmente um GUID/UUID).
 * @property {string} nome O nome completo do usuario.
 * @property {string} email O email do usuario (ex: 'nome@email.com').
 * @property {string} senhaHash O senhaHash do usuario.
 * @property {string} perfil define o perfil do usuario (gerente/vendedor).
 */

/**
 * Objeto modelo que contém os métodos de acesso a dados (CRUD) da entidade Usuarios.
 * @namespace usuarioModel
 */
const usuarioModel = {

    /**
     * Busca um usuário específico pelo ID (Primary Key).
     * @async
     * @function buscarUm
     * @param {string} idUsuario - O UUID do usuário.
     * @returns {Promise<Array>} Recordset contendo o usuário encontrado.
     * @throws {Error} Propaga erro de conexão ou query.
     */
    buscarUm: async (idUsuario) => {
        try {
            const pool = await getConnection();

            const querySQL = 'SELECT * FROM usuarios WHERE idUsuario = @idUsuario';
            
            const result = await pool.request()
                .input('idUsuario', sql.UniqueIdentifier, idUsuario)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error('Erro ao buscar o usuario:', error);
            throw error; // Reverbera o erro
        }
    },

    /**
     * Modelo que busca todos os usuarios no banco de dados.
     * * @async
     * @function buscarTodos
     * @returns {Promise<Array<usuarios>>} Retorna uma lista com todos os usuarios.
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */
    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            let querySQL = "SELECT * FROM usuarios";

            const result = await pool.request().query(querySQL);
            return result.recordset;

        } catch (error) {
            console.error("Erro ao buscar usuarios:", error);
            throw error;
        }
    },

    /**
     * Modelo que busca um usuario por email no banco de dados.
     * * @async
     * @function buscarPorEmail
     * @param {string} email O email do usuario a ser buscado.
     * @returns {Promise<usuarios>} Retorna o objeto do usuario do email buscado.
     * @throws Mostra no console e propaga o erro caso a busca falhe.
     */
    buscarPorEmail: async (email) => {
        try {
            const pool = await getConnection();

            let querySQL = "SELECT * FROM usuarios WHERE email = @email";

            const result = await pool.request()
                .input('email', sql.VarChar(100), email)
                .query(querySQL);

            // Retorna o primeiro registro encontrado (ou undefined se não achar nada)
            return result.recordset[0];

        } catch (error) {
            console.error("Erro ao buscar usuario pelo email:", error);
            throw error;
        }
    },

    /**
     * Insere um novo usuário no banco de dados.
     * * @async
     * @function inserir
     * @param {string} nome O nome do novo usuario.
     * @param {string} email O email do novo usuario.
     * @param {string} senhaHash A senha do novo usuario (já criptografada).
     * @param {string} perfil O perfil do novo usuario.
     * @returns {Promise<void>} Não retorna valor, apenas completa a operação ou lança um erro.
     * @throws {Error} Propaga o erro caso a inserção falhe.
     */
    inserir: async (nome, email, senhaHash, perfil) => {
        try {
            const pool = await getConnection();

            let querySQL = 'INSERT INTO usuarios (nome, email, senhaHash, perfil) VALUES (@nome, @email, @senhaHash, @perfil)';

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
     * Atualiza os dados cadastrais (nome e email) de um usuário.
     * @async
     * @function atualizar
     * @param {string} idUsuario - UUID do usuário a ser editado.
     * @param {string} nome - Novo nome.
     * @param {string} email - Novo email.
     * @returns {Promise<void>}
     */
    atualizar: async (idUsuario, nome, email) => {
        try {
            const pool = await getConnection();

            // Evitar SQL Injection usando parâmetros (@)
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
     * Remove fisicamente um usuário do banco de dados.
     * @async
     * @function deletar
     * @param {string} idUsuario - UUID do usuário a ser excluído.
     * @returns {Promise<void>}
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