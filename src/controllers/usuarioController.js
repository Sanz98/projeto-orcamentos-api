const { usuarioModel } = require("../models/usuarioModel");
const bcrypt = require('bcrypt');

const usuarioController = {

    listarVendores: async (req, res) => {
        try {
            const vendedores = await usuarioModel.buscarTodos();
            res.status(200).json(vendedores);
        } catch (error) {
            console.error('Erro ao listar vendedores:', error);
            res.status(500).json({ error: 'Error ao buscar vendedores' });

        }

    },

    criarVendedor: async (req, res) => {
      
        try {
            const { nome, email, senha } = req.body;
            const perfilFixo = 'vendedor';

            // --- VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS (Dica extra) ---
            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Preencha todos os campos.' });
            }

            // ---  VERIFICA SE O EMAIL JÁ EXISTE ---
            // Chama o model para buscar pelo email fornecido
            const usuarioExistente = await usuarioModel.buscarPorEmail(email);

            // Se usuarioExistente não for nulo/vazio, significa que já tem cadastro
            if (usuarioExistente) {
                // Retorna 409 (Conflict) e encerra a função com "return"
                return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
            }

            
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

    atualizarVendedor: async (req, res) => {
        try {
            const { idUsuario } = req.params;
            const { nome, email } = req.body;

            // Validação de UUID.
            if (idUsuario.length != 36) {
                return res.status(400).json({ erro: 'id do usuario inválido!' });
            }

            const usuario = await usuarioModel.buscarUm(idUsuario)

            // Validação de o Produto existe.
            if (!usuario || usuario.length !== 1) {
                return res.status(404).json({ erro: 'Usuario não encontrado!' });
            }

            const usuarioAtual = usuario[0];

            const nomeAtualizado = nome ?? usuarioAtual.nome;
            const emailAtualizado = email ?? usuarioAtual.email;

            await usuarioModel.atualizar(idUsuario, nomeAtualizado, emailAtualizado);
            res.status(200).json({ message: 'Vendedor atualizado com sucesso!' });

        } catch (error) {
            console.error('Erro ao atualizar vendedor:', error);
            res.status(500).json({ erro: 'Erro interno no servidor ao atualizar vendedor.' });
        }

    },

    deletarVendedor: async (req, res) => {
        try {
            const { idUsuario } = req.params;
            
            if (idUsuario.length != 36) {
                return res.status(400).json({ erros: `id do vendedor invalida!` });
            }

            const vendedor = await usuarioModel.buscarUm(idUsuario);

            if (!vendedor || vendedor.length !== 1) {
                return res.status(404).json({ erro: 'vendedor nao encontrado' });

            }


            await usuarioModel.deletar(idUsuario);
            res.status(200).json({ message: "vendedor deletado com sucesso!" });

        } catch (error) {
            console.error('Erro ao deletar o vendedor: ', error);
            res.status(500).json({ erro: 'Erro interno no servidor ao deletar o vendedor!' });

        }
    }

};

module.exports = { usuarioController };
