const jwt = require('jsonwebtoken');

// IMPORTANTE: Este segredo deve ser IGUAL ao usado no authController.js
// Se lá você usou process.env.JWT_SECRET, aqui também deve usar.
const SEGREDO_JWT = process.env.JWT_SECRET || 'seusegredo';

const verify = {
    // Middleware de Autenticação
    // Ele intercepta a requisição ANTES de chegar no Controller
    protegerRota: async (req, res, next) => {
        try {
            // 1. Tenta pegar o token do cabeçalho da requisição (Header)
            // O padrão é enviar no header "Authorization" com o valor "Bearer <token>"
            const authHeader = req.headers['authorization'];
            
            // Se não tiver cabeçalho, ou se não tiver o token depois do espaço
            const token = authHeader && authHeader.split(' ')[1];

            if (!token) {
                return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
            }

        
            // 2. Verifica se o token é válido
            const decoded = jwt.verify(token, SEGREDO_JWT);

            // 3. Salva os dados do usuário na requisição
            // No seu login, você salvou: { id, perfil }
            // Então aqui, 'decoded' vai ter { id: ..., perfil: ... }
            req.usuario = decoded; 

            // 4. Manda passar para o próximo passo (o Controller)
            next();

        } catch (error) {
            return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        }
    },
};

module.exports = { verify };