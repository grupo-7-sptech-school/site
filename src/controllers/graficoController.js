var graficoModel = require("../models/graficoModel");

function dadosGrafico(req, res) {
    var hostName = req.body.host;

    graficoModel.dadosGrafico(hostName, 10)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log("ERRO no gráfico", erro);
            res.status(500).json(erro);
        });
}

module.exports = { dadosGrafico };
