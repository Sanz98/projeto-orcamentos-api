const {orcamentoModel} = require("../models/orcamentoModel");


const orcamentoController ={
    listarOrcamento: async (req, res) =>{
        try {

            const orcamento = await orcamentoModel.buscarTodos();
            res.status(200).json(orcamento);
            
        } catch (error) {
            console.error('Erro ao listar orcamentos:',error);
            res.status(500).json({error: 'Erro ao buscar Orcamento'})
            
        }
    },
}



module.exports={orcamentoController}