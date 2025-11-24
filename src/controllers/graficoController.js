var graficoModel = require("../models/graficoModel");

function dadosGrafico(req, res) {
    var idComponente = req.params.idComponente;
    var hostName = req.params.hostName;

    graficoModel.dadosGrafico(idComponente, hostName, 10)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });
}

function leituraDisco(req, res) {
    var hostName = req.params.hostName;

    graficoModel.leituraDisco(hostName)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });
}

function escritaDisco(req, res) {
    var hostName = req.params.hostName;

    graficoModel.escritaDisco(hostName)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });
}

function top3(req, res) {
    var hostName = req.params.hostName;

    graficoModel.top3(hostName)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });
}

function maisLeitura(req, res) {
    var hostName = req.params.hostName;

    graficoModel.maisLeitura(hostName)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });
}

function maisEscrita(req, res) {
    var hostName = req.params.hostName;

    graficoModel.maisEscrita(hostName)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });
}

async function ramUltimos7Dias(req, res) {
    var idMaquina = req.params.idMaquina;

    graficoModel.getRamUltimos7Dias(idMaquina)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });

}

function alertasSemana(req, res) {
    var id = req.params.idMaquina;

    graficoModel.alertasSemana(id)
        .then(r => res.json(r[0]))
        .catch(e => res.status(500).json(e));
}


module.exports = { 
    dadosGrafico,
    leituraDisco,
    escritaDisco,
    top3,
    maisLeitura,
    maisEscrita,
    ramUltimos7Dias,
    alertasSemana
};
