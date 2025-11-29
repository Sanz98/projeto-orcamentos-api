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
    }
}



module.exports = {
    orcamentoController
};
