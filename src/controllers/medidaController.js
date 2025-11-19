require("dotenv").config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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





function puxarMaquinaProcessos(req, res) {

    var hostName = req.body.hostName;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.puxarMaquinaProcessos(hostName).then(function (resultado) {
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

function quantidadeAlertasProcessos(req, res) {

    var hostName = req.body.hostName;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.quantidadeAlertasProcessos(hostName).then(function (resultado) {
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

function rankingProcessos(req, res) {

    var hostName = req.body.hostName;
    var limite = req.body.limite;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.rankingProcessos(hostName, limite).then(function (resultado) {
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


function rankingProcessosRAM(req, res) {

    var hostName = req.body.hostName;
    var limite = req.body.limite;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.rankingProcessosRAM(hostName, limite).then(function (resultado) {
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


function graficoProcessos(req, res) {

    var hostName = req.body.hostName;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.graficoProcessos(hostName).then(function (resultado) {
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

function graficoProcessosRAM(req, res) {

    var hostName = req.body.hostName;

    console.log(`Recuperando medidas em tempo real`);

    medidaModel.graficoProcessosRAM(hostName).then(function (resultado) {
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


async function recomendacoesIA(req, res) {
    try {
        const { cpu, ram, disco } = req.body; 

        const prompt = `
            Você é um especialista em monitoramento de servidores e otimização de infraestrutura.
            Analise os valores recebidos e gere recomendações técnicas específicas, SEM sugestões genéricas, (não fale se o uso 
            de algo estiver 0 por cento ou perto) DE EXTREMA IMPORTANCIA NÃO FALAR SE ESTIVER 0 POR CENTO DE USO...
            CPU: {${cpu}}%
            RAM: {${ram}}%
            Disco: {${disco}}%
            Formato:
            - Recomendação 1
            - Recomendação 2
            - Recomendação 3
            - Recomendação 4
        `;

        const chatResponse = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "Você é um assistente técnico de otimização de hardware." },
                { role: "user", content: prompt }
            ],
            temperature: 0.3,
        });

        const texto = chatResponse.choices[0].message.content;
        res.status(200).json({ recomendacoes: texto });

    } catch (err) {
        console.error("Erro IA:", err);
        res.status(500).json({ erro: "Falha ao gerar recomendações" });
    }
}


module.exports = {
    buscarUltimasMedidas,
    buscarMedidasEmTempoReal,
    alertaPorComponente,
    maiorProcessoCpu,
    maiorProcessoRam,
    alterarMetricas,
    puxarMetricas,
    puxarMaquinaProcessos,
    quantidadeAlertasProcessos,
    rankingProcessos,
    graficoProcessos,
    graficoProcessosRAM,
    rankingProcessosRAM,
    recomendacoesIA
}