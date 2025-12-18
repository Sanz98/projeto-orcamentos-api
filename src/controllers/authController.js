const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { usuarioModel } = require('../models/usuarioModel');

/**
 * Controlador responsável pelo fluxo de autenticação e gestão de sessão do usuário.
 * Centraliza as operações de login e emissão de tokens.
 */
const authController = {

    /**
     * Realiza o login do usuário, validando credenciais e gerando o token de acesso (JWT).
     * Define também um cookie HTTP-Only para persistência da sessão.
     * * @param {object} req - Objeto de requisição do Express (contém email e senha no body).
     * @param {object} res - Objeto de resposta do Express.
     * @returns {object} Retorna JSON com status, token e dados do usuário ou mensagem de erro.
     */
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            // Busca o usuário no banco para validar existência.
            const usuario = await usuarioModel.buscarPorEmail(email);
            if (!usuario) {
                return res.status(401).json({ erro: 'Email não encontrado' });
            }

            // Compara a senha informada (texto plano) com o hash salvo no banco.
            // O bcrypt gerencia o 'salt' e o algoritmo de comparação de forma segura.
            const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Credenciais inválidas.' });
            }

            // Cria o payload (carga de dados) que viajará dentro do token.
            // Importante: Não incluir dados sensíveis como senha ou hash aqui.
            const payload = {
                idUsuario: usuario.idUsuario,
                nome: usuario.nome,
                perfil: usuario.perfil
            };

            // Assina o token com a chave secreta e define o tempo de vida.
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            // Configura o cookie para armazenar o token no navegador de forma segura.
            res.cookie('token', token, {
                httpOnly: true, // Impede acesso ao cookie via JavaScript (proteção XSS).
                secure: false, // Em produção, deve ser true (apenas HTTPS).
                sameSite: 'lax',
                maxAge: Number(process.env.JWT_TIME_EXPIRES_IN)
            });

            // Retorna o sucesso da operação com os dados públicos do usuário.
            res.status(200).json({
                message: 'Logado com sucesso!',
                token,
                usuario: payload
            });

        } catch (error) {
            console.error('Erro no login:', error);
            return res.status(500).json({ erro: 'Erro interno.' });
        }
    }
};

module.exports = { authController };