

const { orcamentoModel } = require("../models/orcamentoModel")

const orcamentoController = {

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