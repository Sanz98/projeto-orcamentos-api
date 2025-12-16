const { orcamentoModel } = require("../models/orcamentoModel");
const { usuarioModel } = require("../models/usuarioModel");

const orcamentoController = {

    listarOrcamento: async (req, res) => {
        try {
            // 1. Recuperamos os dados que o Middleware 'autenticado' salvou
            const { idUsuario, perfil } = req.usuario;

            let orcamentos;

            // 2. Lógica de Decisão 
            if (perfil === 'gerente') {
                // Se for gerente, busca TUDO
                orcamentos = await orcamentoModel.buscarTodos();
            } else {
                // Se for vendedor, busca SÓ OS DELE usando o idUsuario
                orcamentos = await orcamentoModel.buscarPorVendedor(idUsuario);
            }


            res.status(200).json(orcamentos);

        } catch (error) {
            console.error('Erro ao listar orcamentos:', error);
            res.status(500).json({ error: 'Erro ao buscar Orcamento' })

        }
    },

    buscarOrcamentoPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado.' });
            }

            // Regra de Segurança
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Você não tem permissão para ver este orçamento.' });
            }

            return res.status(200).json(orcamento);

        } catch (error) {
            console.error('Erro ao buscar detalhes:', error);
            return res.status(500).json({ erro: 'Erro interno ao buscar detalhes.' });
        }
    },

    //Função criar orçamentos 


    criarOrcamento: async (req, res) => {
        try {
            // 1. SEGURANÇA: Pegamos o ID de quem está logado (Vem do Middleware)
            const idVendedor = req.usuario.idUsuario;

            // 2. Extraímos o resto dos dados do Body (REMOVI o idVendedor daqui)
            let {
                idCliente, status, dataCriacao, prazoEntrega,
                condicaoPagamento, desconto, validadeDias, observacoes,
                itens
            } = req.body;

            // --- Validação de Campos Básicos ---
            // Note que não validamos mais se idVendedor veio no body, pois pegamos do token
            if (!idCliente || !itens || itens.length === 0) {
                return res.status(400).json({ erro: "Campos obrigatórios (Cliente, Itens) não preenchidos!" });
            }

            // --- Tratamento de Defaults ---
            if (!dataCriacao) dataCriacao = new Date();

            if (!prazoEntrega) {
                let data = new Date();
                data.setDate(data.getDate() + 60);
                prazoEntrega = data;
            }

            if (!status || (status !== 'Em Analise' && status !== 'Aprovado' && status !== 'Rejeitado')) {
                status = 'Em Analise';
            }

            // --- Lógica de Soma ---
            let valorTotalCalculado = 0.0;

            for (let item of itens) {
                if (!item.quantidade || item.quantidade <= 0) item.quantidade = 1;

                if (!item.valorUnitario || item.valorUnitario < 0) {
                    return res.status(400).json({ erro: `O item '${item.tituloAmbiente}' está sem valor unitário!` });
                }

                valorTotalCalculado += (Number(item.valorUnitario) * Number(item.quantidade));
            }

            if (!desconto) desconto = 0.0;

            // --- Validação de IDs ---
            if (idCliente.length != 36) return res.status(400).json({ erro: "ID do cliente inválido!" });

            // (Opcional) Validar se o ID do token é válido, mas o middleware já deve garantir isso.
            if (!idVendedor || idVendedor.length != 36) return res.status(401).json({ erro: "Token inválido ou sem ID de usuário." });

            // --- Persistência ---
            await orcamentoModel.criarOrcamento(
                idCliente, status, dataCriacao, prazoEntrega, condicaoPagamento,
                valorTotalCalculado,
                desconto, validadeDias, observacoes,
                idVendedor, // <--- Usando a variável segura do Token
                { itens }
            );

            res.status(201).json({
                message: 'Orçamento criado com sucesso!',
                criadoPor: idVendedor, // Só para você confirmar no retorno
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
    atualizarOrcamento: async (req, res) => {
        try {

            const { id } = req.params; // Pega o ID da URL
            const { status, valorTotal } = req.body;

            // 1. Buscar o orçamento atual para verificar como ele está
            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado' });
            }

            // 2. Regra [RN04]: Não pode editar se já estiver fechado
            if (orcamento.status === 'Aprovado' || orcamento.status === 'Rejeitado') {
                return res.status(400).json({ erro: 'Orçamento fechado não pode ser alterado.' });
            }

            // 3. Regra [RN02]: Se for vendedor, só pode editar se for dele
            // (Nota: Gerente pode editar qualquer um)
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.id) {
                return res.status(403).json({ erro: 'Sem permissão para editar este orçamento.' });
            }

            // Se passou por tudo, atualiza
            await orcamentoModel.atualizarOrcamento(id, { status, valorTotal });
            res.status(200).json({ message: 'Orçamento atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro ao atualizar orçamento' });
        }
    },

    /**
     * Adiciona um item avulso ao orçamento existente.
     * @route POST /orcamentos/:id/itens
     * @param {string} req.params.id - ID do Orçamento.
     * @param {object} req.body - Dados do Item.
     * @returns {object} 201 - Item criado e total atualizado.
     */
    adicionarItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { tituloAmbiente, descricaoDetalhada, valorUnitario, quantidade } = req.body;

            // 1. Validação de Input
            if (!tituloAmbiente || !descricaoDetalhada || !valorUnitario) {
                return res.status(400).json({ erro: "Campos obrigatórios do item não preenchidos!" });
            }

            // 2. Busca o orçamento para validar permissões
            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado.' });
            }

            // Regra [RN04]: Não pode mexer se já estiver fechado
            if (orcamento.status === 'Aprovado' || orcamento.status === 'Rejeitado') {
                return res.status(400).json({ erro: 'Não é possível adicionar itens a um orçamento fechado.' });
            }


            // Regra [RN02]: Segurança de Vendedor (Só mexe no dele)
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Sem permissão para alterar este orçamento.' });
            }

            // 3. Execução
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

    deletarOrcamento: async (req, res) => {
        try {
            const { id } = req.params;

            // 1. Busca para verificar existência e permissão
            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento não encontrado.' });
            }

            // 2. Regra de Segurança: Só o dono ou gerente pode deletar
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor !== req.usuario.idUsuario) {
                return res.status(403).json({ erro: 'Sem permissão para excluir este orçamento.' });
            }

            // 3. Regra de Negócio (Opcional): Não deletar orçamentos Aprovados
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
     * Remove um item de um orçamento.
     * @route DELETE /orcamentos/:id/itens/:idItem
     */
    deletarItem: async (req, res) => {
        try {
            const { id, idItem } = req.params; // 'id' é do Orçamento, 'idItem' é do Item

            // 1. Busca o Orçamento Pai para validar permissões (RN02 e RN04)
            const orcamento = await orcamentoModel.buscarPorId(id);

            if (!orcamento) {
                return res.status(404).json({ erro: 'Orçamento pai não encontrado.' });
            }

            // Regra [RN04]: Não pode mexer se já estiver fechado
            if (orcamento.status === 'Aprovado' || orcamento.status === 'Rejeitado') {
                return res.status(400).json({ erro: 'Não é possível remover itens de um orçamento fechado.' });
            }

            // Regra [RN02]: Segurança de Vendedor
            // Nota: Adicionei o toLowerCase() para evitar aquele erro de comparação de string
            if (req.usuario.perfil !== 'gerente' && orcamento.idVendedor.toLowerCase() !== req.usuario.idUsuario.toLowerCase()) {
                return res.status(403).json({ erro: 'Sem permissão para alterar este orçamento.' });
            }

            // 2. Executa a exclusão
            await orcamentoModel.deletarItem(id, idItem);

            res.status(200).json({ message: 'Item removido e valor total atualizado!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro interno ao deletar item.' });
        }
    },
};

module.exports = { orcamentoController };
