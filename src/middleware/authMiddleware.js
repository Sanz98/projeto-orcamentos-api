const jwt = require('jsonwebtoken');

const verify = {
        // Middleware para verificar se o usuário está logado (independente do perfil)
    autenticado: async (req, res, next) => {
        try {
            // 1. Tenta pegar SOMENTE do Cookie
            const token = req.cookies.token;

            // Se não tiver cookie, lança erro
            if (!token) {
                throw new Error('Não autorizado. Cookie de sessão não encontrado.');
            }
            
            // 2. Verifica o Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            // 3. Anexa os dados do usuário para o próximo Controller
            // IMPORTANTE: Aqui não fazemos if/else de perfil. Apenas passamos os dados.
            req.usuario = { 
                idUsuario: decoded.idUsuario, 
                perfil: decoded.perfil 
            };

            next(); // Permissão concedida: O usuário existe e o token é válido.

        } catch (error) {
            console.error('Erro na Autenticação:', error.message);
            
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ erro: 'Sessão expirada ou inválida. Refaça o login.' });
            }
            
            return res.status(401).json({ erro: 'Você precisa estar logado para acessar este recurso.' });
        }
    },

    gerente: async (req, res, next) => {
        try {
            // 1. Tenta pegar SOMENTE do Cookie
            const token = req.cookies.token;

            // Se não tiver cookie, já lança erro
            if (!token) {
                return res.status(401).json({erro: "Acesso não autorizado - Realize login!"});
            }
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET); 

            // VERIFICA SE O PERFIL NO TOKEN É 'gerente'
            if (!decoded.perfil || decoded.perfil !== 'gerente') { 
                throw new Error('Acesso Proibido. Perfil do usuário não é gerente.');
            }

            // Anexa os dados do usuário para o próximo Controller (não essencial aqui, mas boa prática)
            req.usuario = { idUsuario: decoded.idUsuario, perfil: decoded.perfil };

            next(); // PERMISSÃO CONCEDIDA!

        } catch (error) {
            // Tratamento unificado de erros (como detalhado na resposta anterior)
            console.error('Erro na Autorização de Gerente:', error.message);
            
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.message.includes('Token')) {
                return res.status(401).json({ erro: 'Sessão expirada ou inválida. Refaça o login.' }); // 401 Unauthorized
            } 
            
            if (error.message.includes('Acesso Proibido')) {
                return res.status(403).json({ erro: 'Acesso Proibido. Apenas gerentes têm permissão.' }); // 403 Forbidden
            }
            
            return res.status(500).json({ erro: 'Erro interno de autenticação.' });
        }
    }
};

module.exports = { verify };
