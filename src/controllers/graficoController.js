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
    var host = req.params.hostName;

    graficoModel.maisEscrita(host)
        .then(resposta => res.json(resposta))
        .catch(error => {
            res.status(500).json(error);
        });
}

function ramUltimos7Dias(req, res) {
    graficoModel.getRamUltimos7Dias(req.params.hostName)
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}


function alertasSemana(req, res) {
    var host = req.params.hostName;

    graficoModel.alertasSemana(host)
        .then(r => res.json(r[0]))
        .catch(e => res.status(500).json(e));
}


async function top3MaquinasRAM(req, res) {
    const hostName = req.params.hostName;
    try {
        const result = await graficoModel.top3MaquinasRAM(hostName);
        res.json(result);
    } catch (erro) {
        console.error("[top3MaquinasRAM] erro:", erro);
        res.status(500).json(erro);
    }
}







module.exports = { 
    dadosGrafico,
    leituraDisco,
    escritaDisco,
    top3,
    maisLeitura,
    maisEscrita,
    ramUltimos7Dias,
    alertasSemana,
    top3MaquinasRAM
};
