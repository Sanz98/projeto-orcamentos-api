const { usuarioModel } = require("../models/usuarioModel");
const bcrypt = require('bcrypt');

/**
 * Controller responsável pela gestão de usuários (Vendedores/Gerentes).
 * Trata da segurança de dados sensíveis e regras de hierarquia.
 */
const usuarioController = {

    /**
     * Lista todos os usuários cadastrados, filtrando dados sensíveis.
     * Aplica o padrão DTO (Data Transfer Object) manual para não vazar hashes de senha.
     * @returns {Array} Lista de objetos com id, nome, email e perfil.
     */
    listarVendores: async (req, res) => {
        try {
            const vendedores = await usuarioModel.buscarTodos();

            // 
            // SEGURANÇA: Mapeamento (Projection) para remover a 'senhaHash'.
            // Nunca retornamos a coluna de senha, nem mesmo criptografada, para o front-end.
            const listaSegura = vendedores.map(u => ({
                idUsuario: u.idUsuario,
                nome: u.nome,
                email: u.email,
                perfil: u.perfil
            }));

            res.status(200).json(listaSegura);
        } catch (error) {
            console.error('Erro ao listar vendedores:', error);
            res.status(500).json({ error: 'Erro ao buscar vendedores' });
        }
    },

    /**
     * Registra um novo vendedor no sistema.
     * Realiza o hash da senha antes de persistir no banco.
     * @param {string} req.body.nome - Nome completo.
     * @param {string} req.body.email - Email único.
     * @param {string} req.body.senha - Senha em texto plano (será hashada).
     */
    criarVendedor: async (req, res) => {
        try {
            const { nome, email, senha } = req.body;
            const perfilFixo = 'vendedor'; // Por padrão, cria-se apenas vendedores aqui.

            // Validação de entrada básica
            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Preencha todos os campos.' });
            }

            // Regra de Unicidade: Verifica se o email já existe
            const usuarioExistente = await usuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
                return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
            }

            // 
            // Criptografia: Hash com Salt (custo 10)
            const senhaHash = await bcrypt.hash(senha, 10);

            await usuarioModel.inserir(nome, email, senhaHash, perfilFixo);

            return res.status(201).json({
                mensagem: 'Vendedor cadastrado com sucesso!',
                perfil: perfilFixo
            });

        } catch (error) {
            console.error('Erro ao criar vendedor:', error);
            return res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    },

    /**
     * Atualiza dados cadastrais de um usuário.
     * Contém regras de proteção de hierarquia (Gerente não edita outro Gerente).
     * @param {string} req.params.idUsuario - ID do alvo da edição.
     */
    atualizarVendedor: async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { nome, email } = req.body;

            // Identificação de quem está enviando a requisição (Extraído do Token JWT)
            const perfilSolicitante = req.usuario.perfil;

            // Validação de UUID
            if (idUsuario.length != 36) {
                return res.status(400).json({ erro: 'ID do usuário inválido!' });
            }

            const usuariosEncontrados = await usuarioModel.buscarUm(idUsuario);

            if (!usuariosEncontrados || usuariosEncontrados.length === 0) {
                return res.status(404).json({ erro: 'Usuário não encontrado!' });
            }

            const usuarioAlvo = usuariosEncontrados[0];

            // Regra de Negócio (Hierarquia):
            // Protege gerentes contra alterações feitas por terceiros (mesmo outros gerentes),
            // exceto se o gerente estiver editando seu próprio perfil.
            if (perfilSolicitante === 'gerente' && usuarioAlvo.perfil === 'gerente' && req.usuario.idUsuario !== idUsuario) {
                return res.status(403).json({
                    erro: 'Operação Negada: Gerentes não podem alterar o cadastro de outros Gerentes.'
                });
            }

            // Atualização Parcial (Patch Logic)
            // Se 'nome' for null/undefined, mantém o 'usuarioAlvo.nome' original.
            const nomeAtualizado = nome ?? usuarioAlvo.nome;
            const emailAtualizado = email ?? usuarioAlvo.email;

            await usuarioModel.atualizar(idUsuario, nomeAtualizado, emailAtualizado);
            res.status(200).json({ message: 'Vendedor atualizado com sucesso!' });

        } catch (error) {
            console.error('Erro ao atualizar vendedor:', error);
            res.status(500).json({ erro: 'Erro interno no servidor ao atualizar vendedor.' });
        }
    },

    /**
     * Remove um usuário do sistema.
     * Impede a auto-destruição da conta logada.
     * @param {string} req.params.idUsuario - ID do alvo da exclusão.
     */
    deletarVendedor: async (req, res) => {
        try {
            const { idUsuario } = req.params;

            if (idUsuario.length != 36) {
                return res.status(400).json({ erros: `ID inválido!` });
            }

            // Trava de Segurança: Anti-Lockout
            // Impede que o usuário delete a si mesmo e perca acesso ao sistema.
            if (idUsuario === req.usuario.idUsuario) {
                return res.status(400).json({ erro: 'Você não pode excluir sua própria conta aqui.' });
            }

            const vendedor = await usuarioModel.buscarUm(idUsuario);

            if (!vendedor || vendedor.length === 0) {
                return res.status(404).json({ erro: 'Vendedor não encontrado' });
            }

            await usuarioModel.deletar(idUsuario);
            res.status(200).json({ message: "Vendedor deletado com sucesso!" });

        } catch (error) {
            console.error('Erro ao deletar o vendedor: ', error);
            res.status(500).json({ erro: 'Erro interno no servidor ao deletar o vendedor!' });
        }
    }
};

module.exports = { usuarioController };