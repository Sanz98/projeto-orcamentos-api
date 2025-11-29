// Importa bibliotecas necessárias
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {usuarioModel} = require('../models/usuarioModel');

// Segredo do JWT (em produção, use .env)
const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
    usuarioLogin: async (req, res) => {
        try {
            const { email, senha } = req.body;

            if (email == undefined || senha == undefined) {
                return res.status(400).json({erro: 'Email e senha são obrigatorios!'});             
            }

            const usuario = await usuarioModel.buscarPorEmail(email);

            if (usuario.length == 0) {
                return res.status(401).json({erro: 'Email não encontrado!'});
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

            if (!senhaValida) {
                return res.status(401).json({erro: 'Credenciais inválidas'});
            }

            const payload = {
                idUsuario: usuario.idUsuario,
                nome: usuario.nome,
                perfil: usuario.perfil
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
            });

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: Number(process.env.JWT_TIME_EXPIRES_IN)
            });

            res.status(200).json({
                message: 'Logado com sucesso!', 
                token
            });
        } catch (error) {
            console.error('Erro no login do usuario:', error);
            res.status(500).json({erro: 'Erro interno no servidor ao realizar login do usuario.'});
        }
        
    }

};

module.exports = {authController};


