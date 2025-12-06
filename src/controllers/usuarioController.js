const {usuarioModel} = require("../models/usuarioModel");
const bcrypt = require('bcrypt');

const usuarioController ={
    
    listarVendores: async (req, res)=>{
        try {
            const vendedores = await usuarioModel.buscarTodos();
            res.status(200).json(vendedores);
        } catch (error) {
            console.error('Erro ao listar vendedores:', error);
            res.status(500).json({error: 'Error ao buscar vendedores'});
            
        }

    },

    criarVendedor: async (req, res) => {
        
        try {
                const { nome, email, senha } = req.body;
                const perfilFixo = 'vendedor'; // <<< FORÇA O PERFIL
                // ... (Validações)
                const senhaHash = await bcrypt.hash(senha, 10);

                // Chama o Model para salvar, garantindo que o perfil seja 'vendedor'
                await usuarioModel.inserirUsuario(nome, email, senhaHash, perfilFixo);

                return res.status(201).json({ mensagem: 'Vendedor cadastrado com sucesso!', perfil: perfilFixo });

            } catch (error) {
                // ... (Tratamento de erros de banco de dados, 500)
                console.error('Erro ao criar vendedor:', error);
                return res.status(500).json({ erro: 'Não foi possível cadastrar o vendedor.' }); 
            }
    },

    atualizarUsuario: async (req, res) => {
        try {
            const {idUsuario} = req.params;
            const {nome, email} = req.body;

            // Validação de UUID.
            if (idUsuario.length != 36) {
                return res.status(400).json({erro: 'id do usuario inválido!'});
            }

            const usuario = await usuarioModel.buscarUm(idUsuario)

            // Validação de o Produto existe.
            if (!usuario || usuario.length !== 1) {
                return res.status(404).json({erro: 'Usuario não encontrado!'});
            }

            const usuarioAtual = produto[0];

            const nomeAtualizado = nome ?? usuarioAtual.nome;
            const emailAtualizado = email ?? usuarioAtual.email;

            await produtoModel.atualizarProdutos(idProduto, nomeAtualizado, precoAtualizado);
            res.status(200).json({message: 'Produto atualizado com sucesso!'});

        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({erro: 'Erro interno no servidor ao atualizar produto.'});
        }
        
    },
    
};

module.exports={usuarioController};
