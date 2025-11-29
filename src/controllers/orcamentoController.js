const { orcamentoModel } = require("../models/orcamentoModel")

const orcamentoController = {
  
      listarOrcamento: async (req, res) =>{
        try {

            const orcamento = await orcamentoModel.buscarTodos();
            res.status(200).json(orcamento);
            
        } catch (error) {
            console.error('Erro ao listar orcamentos:',error);
            res.status(500).json({error: 'Erro ao buscar Orcamento'})
            
        }
    },

    //Função criar orçamentos 


    criarOrcamento: async (req, res) => {
        try {
            const { nomeCliente, telefoneCliente, valorTotal } = req.body

            if (nomeCliente == undefined || telefoneCliente == undefined || isNaN(valorTotal)) {
                return res.status(400).json({
                    erro: 'Campos obrigatorios nao preenchidos!'
                })
            }

            await orcamentoModel.criarOrcamento(nomeCliente, telefoneCliente, valorTotal)

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
            await orcamentoModel.atualizar(id, { status, valorTotal });
            res.status(200).json({ message: 'Orçamento atualizado com sucesso!' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: 'Erro ao atualizar orçamento' });
        }
    }
}



module.exports = {
    orcamentoController
};
