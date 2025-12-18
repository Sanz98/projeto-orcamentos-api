const { orcamentoModel } = require("../models/orcamentoModel");
const { usuarioModel } = require("../models/usuarioModel");

/**
 * Controller responsável pela gestão do ciclo de vida dos orçamentos.
 * Centraliza regras de negócio como cálculos de valores, controle de permissões (RBAC) e validação de status.
 */
const orcamentoController = {

    /**
     * Lista os orçamentos disponíveis.
     * Implementa filtro de visualização baseado no perfil do usuário:
     * - Gerentes: Visualizam todos os orçamentos.
     * - Vendedores: Visualizam apenas seus próprios orçamentos.
     * * @param {object} req - Requisição contendo `req.usuario` (injetado pelo middleware de auth).
     * @param {object} res - Resposta JSON com a lista de orçamentos.
     */
    listarOrcamento: async (req, res) => {
        try {
            // Recupera dados do token JWT decodificado
            const { idUsuario, perfil } = req.usuario;

            let orcamentos;

            // Regra de Negócio: Visibilidade de dados por perfil
            if (perfil === 'gerente') {
                orcamentos = await orcamentoModel.buscarTodos();
            } else {
                orcamentos = await orcamentoModel.buscarPorVendedor(idUsuario);
            }

            res.status(200).json(orcamentos);

        } catch (error) {
            console.error('Erro ao listar orcamentos:', error);
            res.status(500).json({ error: 'Erro ao buscar Orcamento' });
        }
    },

    /**
     * Busca os detalhes de um orçamento específico por ID.
     * Verifica se o usuário tem permissão para acessar aquele registro específico.
     * * @param {object} req - Requisição com `id` nos params.
     * @param {object} res - Resposta com o objeto do orçamento.
     */
    buscarOrcamentoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado.' });
            }

            // Regra de Segurança (Row-Level Security):
            // Impede que um vendedor acesse orçamentos de outro vendedor pela URL.
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Você não tem permissão para ver este orçamento.' });
            }

            return res.status(200).json(orcamento);

        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar detalhes.' });
        }
    },

    /**
     * Cria um novo orçamento e seus itens.
     * Calcula o valor total no backend para garantir integridade financeira.
     * * @param {object} req - Body contendo dados do cliente, itens e condições.
     * @param {object} res - Resposta com resumo da operação e totais calculados.
     */
    criarOrcamento: async (req, res) => {
        try {
            // O ID do vendedor vem do Token, nunca do body (para evitar falsificação de autoria)
            const idVendedor = req.usuario.idUsuario;

            let {
                idCliente, status, dataCriacao, prazoEntrega,
                condicaoPagamento, desconto, validadeDias, observacoes,
                itens
            } = req.body;

            // Validação de Campos Obrigatórios
            if (!idCliente || !itens || itens.length === 0) {
                return res.status(400).json({ erro: "Campos obrigatórios (Cliente, Itens) não preenchidos!" });
            }

            // Definição de valores padrão (Defaults)
            if (!dataCriacao) dataCriacao = new Date();
            
            if (!prazoEntrega) {
                let data = new Date();
                data.setDate(data.getDate() + 60); // Padrão de 60 dias para entrega
                prazoEntrega = data;
            }

            // Máquina de Estados: Status inicial padrão
            if (!status || (status !== 'Em Analise' && status !== 'Aprovado' && status !== 'Rejeitado')) {
                status = 'Em Analise';
            }

            // --- Lógica de Cálculo Financeiro ---
            // O backend recalcula tudo item a item. Não confiamos no total enviado pelo front.
            let valorTotalCalculado = 0.0;

            for (let item of itens) {
                // Normalização de quantidade
                if (!item.quantidade || item.quantidade <= 0) item.quantidade = 1;

                if (!item.valorUnitario || item.valorUnitario < 0) {
                    return res.status(400).json({ erro: `O item '${item.tituloAmbiente}' está sem valor unitário!` });
                }

                valorTotalCalculado += (Number(item.valorUnitario) * Number(item.quantidade));
            }

            if (!desconto) desconto = 0.0;

            // Validação de Integridade de IDs (UUID)
            if (idCliente.length != 36) return res.status(400).json({ erro: "ID do cliente inválido!" });
            if (!idVendedor || idVendedor.length != 36) return res.status(401).json({ erro: "Token inválido ou sem ID de usuário." });

            // Persistência no Banco de Dados
            await orcamentoModel.criarOrcamento(
                idCliente, status, dataCriacao, prazoEntrega, condicaoPagamento,
                valorTotalCalculado,
                desconto, validadeDias, observacoes,
                idVendedor,
                { itens }
            );

            res.status(201).json({
                message: 'Orçamento criado com sucesso!',
                criadoPor: idVendedor,
                totalBruto: valorTotalCalculado,
                totalLiquido: valorTotalCalculado - desconto
            });

        } catch (error) {
            console.error('Erro ao criar orçamento:', error);
            res.status(500).json({
                error: 'Erro interno no servidor ao cadastrar orçamento!'
            });
        }
    },

    /**
     * Atualiza dados do cabeçalho de um orçamento existente.
     * Bloqueia alterações em orçamentos já finalizados (Aprovado/Rejeitado).
     * * @param {string} req.params.id - ID do orçamento.
     * @param {object} req.body - Novos status ou valor total.
     */
    atualizarOrcamento: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, valorTotal } = req.body;

            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado' });
            }

            // Regra de Negócio: Imutabilidade de Orçamentos Fechados
            if (orcamento.status === 'Aprovado' || orcamento.status === 'Rejeitado') {
                return res.status(400).json({ erro: 'Orçamento fechado não pode ser alterado.' });
            }

            // Regra de Segurança: Verifica propriedade
            // CORREÇÃO APLICADA: Alterado de req.usuario.id para req.usuario.idUsuario para manter consistência
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Sem permissão para editar este orçamento.' });
            }

            await orcamentoModel.atualizarOrcamento(id, { status, valorTotal });
            res.status(200).json({ message: 'Orçamento atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro ao atualizar orçamento' });
        }
    },

    /**
     * Adiciona um item avulso a um orçamento já criado.
     * Recalcula o valor total implicitamente (depende da implementação do Model).
     * * @param {string} req.params.id - ID do orçamento pai.
     * @param {object} req.body - Dados do novo item.
     */
    adicionarItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { tituloAmbiente, descricaoDetalhada, valorUnitario, quantidade } = req.body;

            if (!tituloAmbiente || !descricaoDetalhada || !valorUnitario) {
                return res.status(400).json({ erro: "Campos obrigatórios do item não preenchidos!" });
            }

            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado.' });
            }

            // Bloqueio de edição em orçamentos fechados
            if (orcamento.status === 'Aprovado' || orcamento.status === 'Rejeitado') {
                return res.status(400).json({ erro: 'Não é possível adicionar itens a um orçamento fechado.' });
            }

            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Sem permissão para alterar este orçamento.' });
            }

            const novoItem = {
                tituloAmbiente,
                descricaoDetalhada,
                valorUnitario,
                quantidade: quantidade || 1
            };

            await orcamentoModel.adicionarItem(id, novoItem);

            res.status(201).json({ message: 'Item adicionado com sucesso!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro interno ao adicionar item.' });
        }
    },

    /**
     * Exclui um orçamento e seus itens associados.
     * Apenas Gerentes ou o Dono do orçamento podem realizar esta ação.
     * * @param {string} req.params.id - ID do orçamento a ser excluído.
     */
    deletarOrcamento: async (req, res) => {
        try {
            const { id } = req.params;

            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado.' });
            }

            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Sem permissão para excluir este orçamento.' });
            }

            // Regra de Negócio: Proteção de Histórico
            if (orcamento.status === 'Aprovado') {
                return res.status(400).json({ erro: 'Não é permitido excluir orçamentos já aprovados.' });
            }

            await orcamentoModel.deletarOrcamento(id);

            res.status(200).json({ message: 'Orçamento e itens excluídos com sucesso!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro interno ao excluir orçamento.' });
        }
    },

    /**
     * Remove um item específico de um orçamento.
     * * @param {string} req.params.id - ID do orçamento pai.
     * @param {string} req.params.idItem - ID do item a ser removido.
     */
    deletarItem: async (req, res) => {
        try {
            const { id, idItem } = req.params;

            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento pai não encontrado.' });
            }

            if (orcamento.status === 'Aprovado' || orcamento.status === 'Rejeitado') {
                return res.status(400).json({ erro: 'Não é possível remover itens de um orçamento fechado.' });
            }

            // Normalização com toLowerCase() para evitar falhas de comparação de string
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor.toLowerCase() !== req.usuario.idUsuario.toLowerCase()) {
                return res.status(403).json({ erro: 'Sem permissão para alterar este orçamento.' });
            }

            await orcamentoModel.deletarItem(id, idItem);

            res.status(200).json({ message: 'Item removido e valor total atualizado!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro interno ao deletar item.' });
        }
    },
};

module.exports = { orcamentoController };