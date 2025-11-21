var sustentabilidadeModel = require("../models/sustentabilidadeModel");

function obterMediaMensal(req, res) {
    var idEmpresa = req.params.idEmpresa;

    sustentabilidadeModel.obterMediaMensal(idEmpresa)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log("ERRO no gráfico", erro);
            res.status(500).json(erro);
        });
}

module.exports = { 
    obterMediaMensal 
};
