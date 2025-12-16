const { usuarioModel } = require("../models/usuarioModel");
const bcrypt = require('bcrypt');

const usuarioController = {

    listarVendores: async (req, res) => {
        try {
            const vendedores = await usuarioModel.buscarTodos();
            
            // ALTERAÇÃO DE SEGURANÇA: Mapeamos apenas os dados seguros
            // O front-end não precisa (e não deve) receber a senhaHash
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

    criarVendedor: async (req, res) => {
        try {
            const { nome, email, senha } = req.body;
            const perfilFixo = 'vendedor';

            // Validação de campos
            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Preencha todos os campos.' });
            }

            // Verifica se email já existe
            const usuarioExistente = await usuarioModel.buscarPorEmail(email);
            if (usuarioExistente) {
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
            
            // Pega quem está fazendo o pedido (vem do Token)
            const perfilSolicitante = req.usuario.perfil;

            if (idUsuario.length != 36) {
                return res.status(400).json({ erro: 'ID do usuário inválido!' });
            }

            const usuariosEncontrados = await usuarioModel.buscarUm(idUsuario);

            if (!usuariosEncontrados || usuariosEncontrados.length === 0) {
                return res.status(404).json({ erro: 'Usuário não encontrado!' });
            }

            const usuarioAlvo = usuariosEncontrados[0];

            // Regra de Negócio: Gerente não altera outro Gerente (a não ser ele mesmo, mas simplificamos aqui)
            if (perfilSolicitante === 'gerente' && usuarioAlvo.perfil === 'gerente' && req.usuario.idUsuario !== idUsuario) {
                return res.status(403).json({ 
                    erro: 'Operação Negada: Gerentes não podem alterar o cadastro de outros Gerentes.' 
                });
            }

            // Mantém o dado antigo se não vier um novo
            const nomeAtualizado = nome ?? usuarioAlvo.nome;
            const emailAtualizado = email ?? usuarioAlvo.email;

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
                return res.status(400).json({ erros: `ID inválido!` });
            }

            // ALTERAÇÃO DE SEGURANÇA: Impede que você delete sua própria conta
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
