const jwt = require('jsonwebtoken');

/**
 * Objeto agrupador de Middlewares de Autenticação e Autorização.
 * Intercepta as requisições antes de chegarem aos Controllers.
 */
const verify = {

    /**
     * Middleware de Autenticação (Guard).
     * Verifica se a requisição possui um token JWT válido (via Cookie ou Header).
     * Se válido, anexa os dados do usuário ao objeto `req` e permite o avanço.
     * * @param {object} req - Objeto de requisição do Express.
     * @param {object} res - Objeto de resposta do Express.
     * @param {function} next - Função de callback para passar o controle ao próximo middleware.
     */
    autenticado: (req, res, next) => {
        // 1. Estratégia Principal: Tenta pegar o token do COOKIE (HttpOnly)
        // Requer o pacote 'cookie-parser' configurado no app.js
        let token = req.cookies.token;

        // 2. Estratégia de Fallback: Se não achou no cookie, tenta pegar do HEADER
        // Útil para testes via Postman ou clientes que não suportam cookies (Mobile Apps nativos)
        if (!token) {
            const authHeader = req.headers['authorization'];
            if (authHeader) {
                // Formato esperado: "Bearer <token>"
                // O split quebra a string no espaço e pega a segunda parte (o hash)
                token = authHeader.split(' ')[1];
            }
        }

        // 3. Bloqueio imediato se nenhuma credencial for apresentada
        if (!token) {
            return res.status(401).json({ erro: "Erro na Autenticação: Token não fornecido." });
        }

        try {
            // 4. Validação Criptográfica (O Crachá é falso? Está vencido?)
            // Se o token foi alterado ou expirou, o jwt.verify lança uma exceção (vai pro catch)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 5. Hidratação da Requisição
            // Salva os dados do payload (id, perfil, nome) dentro do request.
            // Isso permite que os Controllers saibam QUEM está fazendo o pedido.
            req.usuario = decoded; 
            
            next(); // Sinal verde: Passa para a próxima etapa (Controller ou outro Middleware)

        } catch (error) {
            // Diferencia erro de token inválido de erro de servidor, mas retorna 403 (Forbidden)
            return res.status(403).json({ erro: "Token inválido ou expirado." });
        }
    },

    /**
     * Middleware de Autorização (RBAC - Role Based Access Control).
     * Verifica se o usuário já autenticado possui o perfil de 'gerente'.
     * @IMPORTANT Deve ser usado APÓS o middleware 'autenticado'.
     */
    gerente: (req, res, next) => {
        // Verifica se o middleware anterior rodou (req.usuario existe)
        // E verifica se a claim 'perfil' corresponde à regra de negócio.
        if (!req.usuario || req.usuario.perfil !== 'gerente') {
             return res.status(403).json({ erro: "Acesso negado: Apenas gerentes." });
        }
        
        next(); // Usuário é gerente, pode prosseguir.
    }
};

module.exports = { verify };