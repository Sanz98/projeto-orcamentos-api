// Importação do Model para persistência de dados
const { orcamentoModel } = require("../models/orcamentoModel");

const orcamentoController = {

    /**
     * Lista os orçamentos com filtro de segurança por perfil.
     * @route GET /orcamentos
     * @returns {object} 200 - JSON com array de orçamentos.
     * @returns {object} 500 - Erro interno do servidor.
     */
    listarOrcamento: async (req, res) => {
        try {
            // Extrai dados do usuário injetados pelo middleware de autenticação (JWT)
            const { idUsuario, perfil } = req.usuario;

            let orcamentos;

            // Decisão baseada no perfil (Tópico 13.3 da grade)
            if (perfil === 'gerente') {
                // Acesso total (Full Access)
                orcamentos = await orcamentoModel.buscarTodos();
            } else {
                // Acesso restrito ao proprietário do registro
                orcamentos = await orcamentoModel.buscarPorVendedor(idUsuario);
            }

            return res.status(200).json(orcamentos);

        } catch (error) {
            console.error('Stacktrace do erro ao listar orçamentos:', error);
            res.status(500).json({ error: 'Falha interna ao buscar orçamentos.' });
        }
    },

    /**
     * Cria um novo orçamento no sistema.
     * @route POST /orcamentos
     * @param {object} req.body - { nomeCliente, telefoneCliente, valorTotal, idVendedor }
     * @returns {object} 201 - Orçamento criado com sucesso.
     * @returns {object} 400 - Falha de validação (campos obrigatórios).
     */
    criarOrcamento: async (req, res) => {
        try {
            // Destructuring do payload recebido
            const { nomeCliente, telefoneCliente, valorTotal, idVendedor } = req.body;

            // Validação de Integridade dos Dados (Sanity Check)
            if (nomeCliente == undefined || telefoneCliente == undefined || isNaN(valorTotal)) {
                return res.status(400).json({
                    erro: 'Bad Request: Campos obrigatórios não preenchidos ou inválidos.'
                });
            }

            // Chama camada de persistência
            await orcamentoModel.criarOrcamento(nomeCliente, telefoneCliente, valorTotal, idVendedor);

            // Retorna 201 (Created) conforme padrão HTTP REST
            res.status(201).json({
                message: 'Orçamento criado com sucesso!'
            });

        } catch (error) {
            console.error('Erro crítico ao criar orçamento:', error);
            res.status(500).json({
                error: 'Erro interno ao cadastrar orçamento.'
            });
        }
    },

    /**
     * Atualiza um orçamento existente (Status ou Valor).
     * @route PUT /orcamentos/:id
     * @param {string} req.params.id - ID do orçamento.
     * @returns {object} 200 - Atualizado com sucesso.
     * @returns {object} 400 - Regra de Negócio violada (Orçamento já fechado).
     * @returns {object} 403 - Acesso Negado (Vendedor tentando editar orçamento de outro).
     * @returns {object} 404 - Orçamento não encontrado.
     */
    atualizarOrcamento: async (req, res) => {
        try {
            const { id } = req.params; // ID do recurso na URL
            const { status, valorTotal } = req.body; // Dados para atualização

            // 1. Verificação de existência do recurso
            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado.' });
            }

            // 2. Regra de Negócio [RN04]: Imutabilidade de orçamentos fechados
            if (orcamento.status === 'Aprovado' || orcamento.status === 'Rejeitado') {
                return res.status(400).json({ erro: 'Operação negada: Orçamento já finalizado.' });
            }

            // 3. Regra de Negócio [RN02]: Controle de permissão de edição
            // Obs: req.usuario vem do token JWT decodificado
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Forbidden: Sem permissão para editar este orçamento.' });
            }

            // Persistência da atualização
            await orcamentoModel.atualizarOrcamento(id, { status, valorTotal });
            
            res.status(200).json({ message: 'Orçamento atualizado com sucesso!' });

        } catch (error) {
            console.error('Erro na atualização:', error);
            res.status(500).json({ erro: 'Erro interno ao atualizar orçamento.' });
        }
    }
};

module.exports = { orcamentoController };