var alertaModel = require("../models/alertaModel");

function kpis(req, res) {
    var hostName = req.body.hostName;
    var periodo = req.body.periodo;

    alertaModel.kpis(hostName, periodo)
        .then(r => {
            const linha = r[0];
            res.json({
                totalAlertas: linha.total,
                criticos: linha.criticos,
                ociosidade: linha.preventivos,
                componente: linha.componenteCritico
            });
        })
        .catch(e => { 
            console.log(e); 
            res.status(500).json(e); 
        });
}


function graficoLinha(req, res) {
    var hostName = req.body.hostName;
    var periodo = req.body.periodo;

    alertaModel.graficoLinha(hostName, periodo)
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}

function graficoComponentes(req, res) {
    var hostName = req.body.hostName;
    var periodo = req.body.periodo;

    alertaModel.graficoComponentes(hostName, periodo)
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}

function graficoTipos(req, res) {
    var hostName = req.body.hostName;
    var periodo = req.body.periodo;

    alertaModel.graficoTipos(hostName, periodo)
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}


module.exports = {
    kpis,
    graficoLinha,
    graficoComponentes,
    graficoTipos
};