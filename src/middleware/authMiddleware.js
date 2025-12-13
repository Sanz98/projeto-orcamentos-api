// Dependência para validação e decodificação de tokens JWT
const jwt = require('jsonwebtoken');

const verify = {

    /**
     * Middleware de Autenticação.
     * Verifica se o usuário possui um token válido no cookie.
     * @function autenticado
     * @returns {void} Chama next() se o token for válido.
     * @returns {object} 401 - Token ausente, expirado ou inválido.
     */
    autenticado: async (req, res, next) => {
        try {
            // 1. Extração do Token (Cookie Strategy)
            const token = req.cookies.token;

            if (!token) {
                throw new Error('Unauthorized: Token não encontrado no cookie.');
            }

            // 2. Verificação de Integridade e Validade
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Payload Injection (req.usuario)
            req.usuario = {
                idUsuario: decoded.idUsuario,
                perfil: decoded.perfil
            };

            next();

        } catch (error) {
            console.error('Falha na Autenticação:', error.message);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ erro: 'Sessão expirada ou inválida. Faça login novamente.' });
            }

            return res.status(401).json({ erro: 'Acesso negado: Login necessário.' });
        }
    },

    /**
     * Middleware de Autorização (RBAC - Role Based Access Control).
     * Permite acesso apenas para perfil 'gerente'.
     * @function gerente
     * @returns {void} Chama next() se for gerente.
     * @returns {object} 401 - Token inválido.
     * @returns {object} 403 - Perfil sem permissão (Forbidden).
     */
    gerente: async (req, res, next) => {
        try {
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).json({ erro: "Acesso negado: Token não fornecido." });
            }

            // Decodificação e Validação
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Validação de Regra de Negócio (Autorização)
            if (!decoded.perfil || decoded.perfil !== 'gerente') {
                throw new Error('Forbidden: Perfil insuficiente.');
            }

            req.usuario = {
                idUsuario: decoded.idUsuario,
                perfil: decoded.perfil
            };

            next();

        } catch (error) {
            console.error('Falha na Autorização (Gerente):', error.message);

            // Caso 1: Problema no Token (401)
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ erro: 'Sessão inválida.' });
            }

            // Caso 2: Problema de Permissão (403)
            if (error.message.includes('Forbidden')) {
                return res.status(403).json({ erro: 'Acesso restrito a gerentes.' });
            }

            return res.status(500).json({ erro: 'Erro interno na validação de credenciais.' });
        }
    }
};

module.exports = { verify };