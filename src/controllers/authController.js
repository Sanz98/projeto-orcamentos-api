// 1. Dependências Externas (NPM)
const bcrypt = require('bcrypt');       // Hash de senha
const jwt = require('jsonwebtoken');    // Geração de Tokens

// 2. Módulos Internos
const { usuarioModel } = require('../models/usuarioModel');

const authController = {

    /**
     * Realiza o login do usuário e emite o token de sessão.
     * @route POST /auth/login
     * @param {object} req.body - Payload JSON.
     * @param {string} req.body.email - Email cadastrado.
     * @param {string} req.body.senha - Senha em texto plano.
     * @returns {object} 200 - Sucesso com Token JWT.
     * @returns {object} 401 - Falha de autenticação (Email ou Senha inválidos).
     */
    login: async (req, res) => {
        try {
            // Destructuring do input
            const { email, senha } = req.body;

            // 1. Busca usuário no banco
            const usuario = await usuarioModel.buscarPorEmail(email);
            
            // Fail-fast: Se não achar, já retorna erro
            if (!usuario) {
                return res.status(401).json({ erro: 'Email não encontrado' });
            }

            // 2. Validação de segurança (Bcrypt)
            const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
            
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Credenciais inválidas.' });
            }

            // 3. Geração do Token (JWT)
            const payload = {
                idUsuario: usuario.idUsuario,
                nome: usuario.nome,
                perfil: usuario.perfil
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            // 4. Configuração de Cookie Seguro (HttpOnly)
            res.cookie('token', token, {
                httpOnly: true, // Proteção contra XSS
                secure: false,  // True em produção (HTTPS)
                sameSite: 'strict',
                maxAge: Number(process.env.JWT_TIME_EXPIRES_IN)
            });

            // Retorno da API
            res.status(200).json({
                message: 'Logado com sucesso!',
                token
            });

        } catch (error) {
            console.error('Exception no Login:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor de autenticação.' });
        }
    }
};

module.exports = { authController };