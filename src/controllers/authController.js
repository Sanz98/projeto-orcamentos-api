// Importa bibliotecas necessárias
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {usuarioModel} = require('../models/usuarioModel');

// Segredo do JWT (em produção, use .env)
const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
    registrarUsuario: async (req, res) => {
        try {
            const { nome, email, senha, perfil } = req.body;

            // Validação
            if (!nome || !email || !senha || !perfil) {
                return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
            }

            if (perfil !== 'vendedor' && perfil !== 'gerente') {
                return res.status(400).json({ erro: 'Perfil inválido. Use "vendedor" ou "gerente".' });
            }

            const usuarioExistente = await usuarioModel.buscarPorEmail(email);

            if (usuarioExistente) {
                return res.status(409).json({ erro: 'E-mail já cadastrado.' });
            }

            
            // Criptografia
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);

            // Salvar no banco
            await usuarioModel.inserir(nome, email, senhaHash, perfil);

            res.status(201).json({ message: 'Usuário criado com sucesso!' });

        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({ erro: 'Erro interno ao registrar usuário.' });
        }
        
    },

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


