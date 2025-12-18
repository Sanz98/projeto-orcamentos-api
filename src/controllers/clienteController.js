const { clienteModel } = require('../models/clienteModel');

/**
 * Controller responsável pelo CRUD (Create, Read, Update) de Clientes.
 * Intermedia as requisições HTTP e a lógica de banco de dados.
 */
const clienteController = {

    /**
     * Retorna a lista completa de clientes cadastrados.
     * @param {object} req - Objeto de requisição HTTP.
     * @param {object} res - Objeto de resposta HTTP.
     * @returns {Array} JSON com array de clientes (Status 200).
     */
    listarClientes: async (req, res) => {
        try {
            const clientes = await clienteModel.buscarTodos();
            res.status(200).json(clientes);
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ erro: 'Erro interno ao buscar clientes.' });
        }
    },

    /**
     * Busca um cliente específico pelo seu ID (GUID).
     * @param {object} req - Requisição contendo o ID nos parâmetros da URL (req.params).
     * @returns {object} JSON com os dados do cliente (Status 200) ou erro (400/404).
     */
    buscarClientePorId: async (req, res) => {
        try {
            const { id } = req.params;

            // Validação estrutural básica de um UUID (36 caracteres)
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

    /**
     * Cadastra um novo cliente no banco de dados.
     * @param {object} req - Body contendo { nomeCliente, telefoneCliente }.
     * @returns {object} Mensagem de sucesso (Status 201).
     */
    criarCliente: async (req, res) => {
        try {
            const { nomeCliente, telefoneCliente } = req.body;

            // Validação de campos obrigatórios
            if (!nomeCliente) {
                return res.status(400).json({ erro: 'O nome do cliente é obrigatório.' });
            }

            // Validação de integridade do banco (Tamanho da coluna CHAR/VARCHAR)
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

    /**
     * Atualiza os dados de um cliente existente.
     * Implementa lógica de atualização parcial (mantém dados antigos se não enviados novos).
     * @param {string} req.params.id - ID do cliente a ser editado.
     */
    atualizarCliente: async (req, res) => {
        try {
            const { id } = req.params;
            const { nomeCliente, telefoneCliente } = req.body;

            if (id.length != 36) return res.status(400).json({ erro: 'ID inválido.' });

            // Busca prévia para garantir existência e permitir merge de dados
            const clienteAtual = await clienteModel.buscarPorId(id);
            if (!clienteAtual) {
                return res.status(404).json({ erro: 'Cliente não encontrado.' });
            }

            // Lógica de "Coalescência Nula" (Nullish Coalescing).
            // Se o novo valor for null/undefined, mantém o valor que já estava no banco (clienteAtual).
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