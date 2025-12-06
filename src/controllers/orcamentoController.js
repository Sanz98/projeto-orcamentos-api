const { orcamentoModel } = require("../models/orcamentoModel");
const { usuarioModel } = require("../models/usuarioModel");

const orcamentoController = {

    listarOrcamento: async (req, res) => {
        try {

            const orcamento = await orcamentoModel.buscarTodos();
            res.status(200).json(orcamento);

        } catch (error) {
            console.error('Erro ao listar orcamentos:', error);
            res.status(500).json({ error: 'Erro ao buscar Orcamento' })

        }
    },

    //Função criar orçamentos 


    criarOrcamento: async (req, res) => {
        try {

            const { idCliente, status, dataCriacao, prazoEntrega, condicaoPagamento, valorTotal, desconto, validadeDias, observacoes, idVendedor, itens
            } = req.body;

            if (idCliente == undefined || idCliente.trim() == "" || valorTotal == undefined || isNaN(valorTotal) || idVendedor == undefined || idVendedor.trim() == "") {
                return res.status(400).json({ erro: "Campos obrigatórios não preenchidos!" });
            }

            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do cliente está inválido!" });
            }

            // VALIDAR SE O idCliente EXISTE NO DB

            if (idVendedor.length != 36) {
                return res.status(400).json({ erro: "id do vendedor está inválido!" });
            }

            const vendedor = await usuarioModel.buscarUm(idVendedor);

            if (!vendedor || vendedor.length <= 0) {
                return res.status(404).json({ erro: "vendedor não encontrado!" });
            }

            for (const item of itens) {
                if (item.tituloAmbiente == undefined || item.tituloAmbiente.trim() == "" || item.descricaoDetalhada == undefined || item.descricaoDetalhada.trim() == "" || isNaN(item.valorUnitario) || item.valorUnitario <= 0) {
                    return res.status(400).json({ erro: "Campos obrigatórios do item não preenchido!" });
                }
            }

            await orcamentoModel.criarOrcamento(idCliente, status, dataCriacao, prazoEntrega, condicaoPagamento, valorTotal, desconto, validadeDias, observacoes, idVendedor, { itens });

            res.status(201).json({
                message: 'orçamento criado com sucesso!'
            })
        } catch (error) {
            console.error('Erro ao criar orçamento!:', error)
            res.status(500).json({
                error: 'Erro interno no servidor ao cadastrar orçamento!'
            })
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
    }
}



module.exports = { orcamentoController };
