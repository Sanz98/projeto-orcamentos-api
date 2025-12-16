const jwt = require('jsonwebtoken');

const verify = {
    autenticado: (req, res, next) => {
        // 1. Tenta pegar o token do COOKIE
        let token = req.cookies.token;

        // 2. Se não achou no cookie, tenta pegar do HEADER (Authorization: Bearer XYZ...)
        if (!token) {
            const authHeader = req.headers['authorization'];
            if (authHeader) {
                // Separa a palavra "Bearer" do código do token
                token = authHeader.split(' ')[1];
            }
        }

        // 3. Se não achou em lugar nenhum, bloqueia
        if (!token) {
            return res.status(401).json({ erro: "Erro na Autenticação: Token não fornecido." });
        }

        try {
            // 4. Verifica a validade do token (Crachá)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Salva os dados do usuário na requisição para usar nos Controllers
            req.usuario = decoded; 
            
            next(); // Pode passar!
        } catch (error) {
            return res.status(403).json({ erro: "Token inválido ou expirado." });
        }
    },

    // Middleware para verificar se é Gerente (bônus, já que vi no seu código)
    gerente: (req, res, next) => {
        // Primeiro roda a verificação de autenticado manualmente ou assume que já rodou antes
        // Aqui vamos assumir que você usa: router.get('...', verify.autenticado, verify.gerente, ...)
        if (!req.usuario || req.usuario.perfil !== 'gerente') {
             return res.status(403).json({ erro: "Acesso negado: Apenas gerentes." });
        }
        next();
    }
};

module.exports = { verify };