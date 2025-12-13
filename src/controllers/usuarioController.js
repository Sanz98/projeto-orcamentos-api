// 1. Dependências Externas
const bcrypt = require('bcrypt');

// 2. Dependências Internas
const { usuarioModel } = require("../models/usuarioModel");

const usuarioController = {

    /**
     * Lista todos os vendedores cadastrados.
     * @route GET /vendedores
     * @returns {object} 200 - Lista de usuários.
     * @returns {object} 500 - Erro interno do servidor.
     */
    listarVendores: async (req, res) => {
        try {
            const vendedores = await usuarioModel.buscarTodos();
            res.status(200).json(vendedores);
        } catch (error) {
            console.error('Erro ao listar vendedores:', error);
            res.status(500).json({ error: 'Erro ao buscar vendedores' });
        }
    },

    /**
     * Cria um novo usuário com perfil fixo de 'vendedor'.
     * @route POST /vendedores
     * @param {object} req.body - { nome, email, senha }
     * @returns {object} 201 - Vendedor criado com sucesso.
     * @returns {object} 400 - Campos inválidos.
     * @returns {object} 409 - Conflito (Email já existe).
     */
    criarVendedor: async (req, res) => {
        try {
            const { nome, email, senha } = req.body;
            const perfilFixo = 'vendedor';

            // 1. Validação de Input
            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Preencha todos os campos.' });
            }

            // 2. Regra de Negócio: Unicidade de E-mail
            const usuarioExistente = await usuarioModel.buscarPorEmail(email);

            if (usuarioExistente) {
                return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
            }

            // 3. Segurança: Hash de senha (Salt rounds: 10)
            const senhaHash = await bcrypt.hash(senha, 10);

            // 4. Persistência
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
     * Atualiza dados parciais de um vendedor.
     * @route PUT /vendedores/:idUsuario
     * @param {string} req.params.idUsuario - UUID do usuário.
     * @returns {object} 200 - Atualizado com sucesso.
     * @returns {object} 400 - ID inválido.
     * @returns {object} 404 - Usuário não encontrado.
     */
    atualizarVendedor: async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { nome, email } = req.body;

            // Validação de formato UUID (Len 36) para integridade do driver SQL
            if (idUsuario.length != 36) {
                return res.status(400).json({ erro: 'ID do usuário inválido!' });
            }

            // Busca registro atual para merge de dados e validação de existência
            const usuario = await usuarioModel.buscarUm(idUsuario);

            if (!usuario || usuario.length !== 1) {
                return res.status(404).json({ erro: 'Usuário não encontrado!' });
            }

            const usuarioAtual = usuario[0];

            // Pattern de Atualização Parcial (Nullish Coalescing)
            // Mantém o valor antigo se o novo não for enviado
            const nomeAtualizado = nome ?? usuarioAtual.nome;
            const emailAtualizado = email ?? usuarioAtual.email;

            await usuarioModel.atualizar(idUsuario, nomeAtualizado, emailAtualizado);
            
            res.status(200).json({ message: 'Vendedor atualizado com sucesso!' });

        } catch (error) {
            console.error('Erro ao atualizar vendedor:', error);
            res.status(500).json({ erro: 'Erro interno no servidor ao atualizar vendedor.' });
        }
    },

    /**
     * Remove fisicamente um vendedor do sistema.
     * @route DELETE /vendedores/:idUsuario
     * @param {string} req.params.idUsuario - UUID do usuário.
     * @returns {object} 200 - Removido com sucesso.
     * @returns {object} 404 - Usuário não encontrado.
     */
    deletarVendedor: async (req, res) => {
        try {
            const { idUsuario } = req.params;

            // Validação de Input
            if (idUsuario.length != 36) {
                return res.status(400).json({ erros: `ID do vendedor inválido!` });
            }

            // Verifica existência antes de deletar
            const vendedor = await usuarioModel.buscarUm(idUsuario);

            if (!vendedor || vendedor.length !== 1) {
                return res.status(404).json({ erro: 'Vendedor não encontrado' });
            }

            // Execução da exclusão
            await usuarioModel.deletar(idUsuario);
            
            res.status(200).json({ message: "Vendedor deletado com sucesso!" });

        } catch (error) {
            console.error('Erro ao deletar o vendedor: ', error);
            res.status(500).json({ erro: 'Erro interno no servidor ao deletar o vendedor!' });
        }
    }
};

module.exports = { usuarioController };