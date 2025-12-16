const { clienteModel } = require('../models/clienteModel');

const clienteController = {

    listarClientes: async (req, res) => {
        try {
            const clientes = await clienteModel.buscarTodos();
            res.status(200).json(clientes);
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ erro: 'Erro interno ao buscar clientes.' });
        }
    },

    buscarClientePorId: async (req, res) => {
        try {
            const { id } = req.params;
            
            if (id.length != 36) {
                return res.status(400).json({ erro: 'ID inválido.' });
            }

            const cliente = await clienteModel.buscarPorId(id);

            if (!cliente) {
                return res.status(404).json({ erro: 'Cliente não encontrado.' });
            }

            res.status(200).json(cliente);
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            res.status(500).json({ erro: 'Erro interno no servidor.' });
        }
    },

    criarCliente: async (req, res) => {
        try {
            const { nomeCliente, telefoneCliente } = req.body;

            // Validação simples
            if (!nomeCliente) {
                return res.status(400).json({ erro: 'O nome do cliente é obrigatório.' });
            }

            // O telefone é opcional no banco? Se for NOT NULL no banco, valide aqui.
            // Pelo seu script é CHAR(12), então não pode ser muito longo.
            if (telefoneCliente && telefoneCliente.length > 12) {
                return res.status(400).json({ erro: 'Telefone excede 12 caracteres.' });
            }

            await clienteModel.inserir(nomeCliente, telefoneCliente);

            res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });

        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            res.status(500).json({ erro: 'Erro interno ao cadastrar cliente.' });
        }
    },

    atualizarCliente: async (req, res) => {
        try {
            const { id } = req.params;
            const { nomeCliente, telefoneCliente } = req.body;

            // 1. Valida ID
            if (id.length != 36) return res.status(400).json({ erro: 'ID inválido.' });

            // 2. Busca o cliente atual
            const clienteAtual = await clienteModel.buscarPorId(id);
            if (!clienteAtual) {
                return res.status(404).json({ erro: 'Cliente não encontrado.' });
            }

            // 3. Atualização Parcial (Mantém o antigo se não vier novo)
            const novoNome = nomeCliente ?? clienteAtual.nomeCliente;
            const novoTelefone = telefoneCliente ?? clienteAtual.telefoneCliente;

            await clienteModel.atualizar(id, novoNome, novoTelefone);

            res.status(200).json({ message: 'Cliente atualizado com sucesso!' });

        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            res.status(500).json({ erro: 'Erro interno ao atualizar cliente.' });
        }
    }

};

module.exports = { clienteController };