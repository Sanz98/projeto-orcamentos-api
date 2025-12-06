const { orcamentoModel } = require("../models/orcamentoModel")

const orcamentoController = {
  
    listarOrcamento: async (req, res) => {
        try {
            // 1. Recuperamos os dados que o Middleware 'autenticado' salvou
            const { idUsuario, perfil } = req.usuario;

            let orcamentos;

            // 2. Lógica de Decisão (Item 4.1.3 da grade)
            if (perfil === 'gerente') {
                // Se for gerente, busca TUDO
                orcamentos = await orcamentoModel.buscarTodos();
            } else {
                // Se for vendedor, busca SÓ OS DELE usando o idUsuario
                orcamentos = await orcamentoModel.buscarPorVendedor(idUsuario);
            }

            // 3. Retorna o resultado (que pode ser tudo ou filtrado)
            return res.status(200).json(orcamentos);
            
            } catch (error) {
                console.error('Erro ao listar orcamentos:', error);
                res.status(500).json({ error: 'Erro ao buscar Orçamento' });
            }
    },

    //Função criar orçamentos 


    criarOrcamento: async (req, res) => {
        try {
            const { nomeCliente, telefoneCliente, valorTotal, idVendedor } = req.body

            if (nomeCliente == undefined || telefoneCliente == undefined || isNaN(valorTotal)) {
                return res.status(400).json({
                    erro: 'Campos obrigatorios nao preenchidos!'
                })
            }

            await orcamentoModel.criarOrcamento(nomeCliente, telefoneCliente, valorTotal, idVendedor)

            res.status(201).json({
                message: 'orçamento criado  com sucesso!'
            })
        } catch (error) {
            console.error('Erro ao criar orçamento!:', error)
            res.status(500).json({
                error: ('Erro ao cadastrar orçamento!', error)
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
};



module.exports = {orcamentoController};
