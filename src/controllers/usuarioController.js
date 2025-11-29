const {usuarioModel} = require("../models/usuarioModel");
const bcrypt = require('bcrypt');


    /*
    -----------------------
    LISTAR TODOS CLIENTES
    GET /clientes
    -----------------------
    */

const usuarioController ={
    
    listarVendores: async (req, res)=>{
        try {
            const clientes = await usuarioModel.buscarTodos();
            res.status(200).json(clientes);
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({error: 'Error ao buscar clientes'});
            
        }

    },

    /*
    -----------------------
    CRIAR UM NOVO CLIENTE
    POST /cliente
    BODY:
    {
        "nomeCliente": "nome",
        "cpfCliente": "000.000.000-00"
    }
    -----------------------
    */

    criarCliente: async (req, res)=>{
        try {

           const {nomeCliente, cpfCliente, emailCliente, senhaCliente} = req.body;
           
           if (nomeCliente == undefined || cpfCliente == undefined || emailCliente == undefined || senhaCliente == undefined) {
                return res.status(400).json({erro: 'Campos obrigatorios não preenchidos!'});
           }

           
           const clientes = await clienteModel.buscarPorCPF(cpfCliente);
           
           if (clientes.length > 0 ) {
               return res.status(409).json({erro: 'CPF já cadastrado!'})
            }
            
            const saltRounds = 10;
 
            const senhaHash = bcrypt.hashSync(senhaCliente, saltRounds);

           await clienteModel.inserirCliente(nomeCliente, cpfCliente, emailCliente, senhaHash);

           res.status(201).json({message: 'Cliente cadastrado com sucesso!'});
            
        } catch (error) {
            console.error('Erro ao cadastrar cliente:', error);
            res.status(500).json({erro: 'Erro ao cadatrar cliente.'});
        }
    }
    
}

module.exports={usuarioController};




/* registrarUsuario: async (req, res) => {
        try {
            const { nome, email, senha, perfil } = req.body;

            // Validação
            if (!nome || !email || !senha || !perfil) {
                return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
            }

            if (perfil !== 'vendedor' && perfil !== 'gerente') {
                return res.status(400).json({ erro: 'Perfil inválido. Use "vendedor" ou "gerente".' });
            }

            const usuarioExistente = await usuarioModel.buscarPorEmail(email);

            if (usuarioExistente) {
                return res.status(409).json({ erro: 'E-mail já cadastrado.' });
            }

            
            // Criptografia
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);

            // Salvar no banco
            await usuarioModel.inserir(nome, email, senhaHash, perfil);

            res.status(201).json({ message: 'Usuário criado com sucesso!' });

        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({ erro: 'Erro interno ao registrar usuário.' });
        }
        
    }, */