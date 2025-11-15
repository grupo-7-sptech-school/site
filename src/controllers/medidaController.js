var medidaModel = require("../models/medidaModel");

function buscarUltimasMedidas(req, res) {

    const limite_linhas = 7;

    var idAquario = req.params.idAquario;

    console.log(`Recuperando as ultimas ${limite_linhas} medidas`);

    medidaModel.buscarUltimasMedidas(idAquario, limite_linhas).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}


function buscarMedidasEmTempoReal(req, res) {

    var idAquario = req.params.idAquario;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.buscarMedidasEmTempoReal(idAquario).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}


function alertaPorComponente(req, res) {

    var hostName = req.body.host;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.alertaPorComponente(hostName).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}


function maiorProcessoCpu(req, res) {

    var hostName = req.body.host;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.maiorProcessoCpu(hostName).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}


function maiorProcessoRam(req, res) {

    var hostName = req.body.host;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.maiorProcessoRam(hostName).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}



function alterarMetricas(req, res) {

    const { nomeComponente, hostName, preventivoInicio, preventivoFim, criticoInicio, criticoFim } = req.body;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.alterarMetricas(nomeComponente, hostName, preventivoInicio, preventivoFim, criticoInicio, criticoFim).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar as ultimas medidas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}


async function puxarMetricas(req, res) {
    const body = req.body;

    medidaModel.puxarMetricas(body)
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado[0]);
            } else {
                res.status(404).json({ erro: "Nenhuma métrica encontrada." });
            }
        })
        .catch(erro => {
            console.error("Erro ao puxar métricas:", erro);
            res.status(500).json(erro);
        });
}


module.exports = {
    buscarUltimasMedidas,
    buscarMedidasEmTempoReal,
    alertaPorComponente,
    maiorProcessoCpu,
    maiorProcessoRam,
    alterarMetricas,
    puxarMetricas
}