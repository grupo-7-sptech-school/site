var graficoModel = require("../models/graficoModel");

function dadosGrafico(req, res) {
    var idComponente = req.params.idComponente;
    var hostName = req.params.hostName;

    graficoModel.dadosGrafico(idComponente, hostName, 10)
        .then(r => res.json(r))
        .catch(e => {
            console.log("ERRO no gráfico", e);
            res.status(500).json(e);
        });
}

module.exports = { dadosGrafico };
