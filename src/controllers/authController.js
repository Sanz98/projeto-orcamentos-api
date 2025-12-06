const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { usuarioModel } = require('../models/usuarioModel'); 

const authController = {
    login: async (req, res) => {
        try {

            const { email, senha } = req.body;

            const usuario = await usuarioModel.buscarPorEmail(email);
            if (!usuario) return res.status(401).json({ erro: 'Email não encontrado' });

            // Comparação da senha (Criptografia)
            const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
            if (!senhaValida) return res.status(401).json({ erro: 'Credenciais inválidas.' });

            // Geração do Payload com o PERFIL
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
            console.error('Erro no login:', error);
            return res.status(500).json({ erro: 'Erro interno.' }); 
        }
    }
};
module.exports = { authController };
