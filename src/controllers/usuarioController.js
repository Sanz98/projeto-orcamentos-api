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
            const { nome, email, senha } = req.body;
            const perfilFixo = 'vendedor'; // <<< FORÇA O PERFIL
            
            try {
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
    }
    
};

module.exports={usuarioController};
