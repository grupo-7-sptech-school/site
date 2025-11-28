require("dotenv").config();
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

    console.log(`Recuperando alertas por componente`);

    medidaModel.alertaPorComponente(hostName).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar alertas.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function maiorProcessoCpu(req, res) {
    var hostName = req.body.host;

    console.log(`Recuperando maior processo CPU`);

    medidaModel.maiorProcessoCpu(hostName).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar maior processo CPU.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function maiorProcessoRam(req, res) {
    var hostName = req.body.host;

    console.log(`Recuperando maior processo RAM`);

    medidaModel.maiorProcessoRam(hostName).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar maior processo RAM.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function alterarMetricas(req, res) {
    const { nomeComponente, hostName, preventivoInicio, preventivoFim, criticoInicio, criticoFim } = req.body;

    console.log(`Alterando métricas`);

    medidaModel.alterarMetricas(nomeComponente, hostName, preventivoInicio, preventivoFim, criticoInicio, criticoFim).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao alterar métricas.", erro.sqlMessage);
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
    try {
        const { hostName } = req.body;

        if (!hostName) {
            return res.status(400).json({ error: "hostName é obrigatório" });
        }

        console.log(`Buscando máquina: ${hostName}`);

        medidaModel.puxarMaquinaProcessos(hostName).then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!")
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar máquina.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    } catch (error) {
        console.error("Erro em puxarMaquinaProcessos:", error);
        res.status(500).json({ 
            error: "Erro ao buscar máquina",
            details: error.message 
        });
    }
}

function quantidadeAlertasProcessos(req, res) {
    try {
        const { hostName } = req.body;

        if (!hostName) {
            return res.status(400).json({ error: "hostName é obrigatório" });
        }

        console.log(`Buscando quantidade de alertas: ${hostName}`);

        medidaModel.quantidadeAlertasProcessos(hostName).then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!")
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar quantidade de alertas.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    } catch (error) {
        console.error("Erro em quantidadeAlertasProcessos:", error);
        res.status(500).json({ error: error.message });
    }
}

function rankingProcessos(req, res) {
    try {
        const { hostName, limite = 5 } = req.body;

        if (!hostName) {
            return res.status(400).json({ error: "hostName é obrigatório" });
        }

        console.log(`Buscando ranking CPU: ${hostName}, limite: ${limite}`);

        medidaModel.rankingProcessos(hostName, limite).then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!")
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar ranking CPU.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    } catch (error) {
        console.error("Erro em rankingProcessos:", error);
        res.status(500).json({ error: error.message });
    }
}

function rankingProcessosRAM(req, res) {
    try {
        const { hostName, limite = 5 } = req.body;

        if (!hostName) {
            return res.status(400).json({ error: "hostName é obrigatório" });
        }

        console.log(`Buscando ranking RAM: ${hostName}, limite: ${limite}`);

        medidaModel.rankingProcessosRAM(hostName, limite).then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!")
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar ranking RAM.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    } catch (error) {
        console.error("Erro em rankingProcessosRAM:", error);
        res.status(500).json({ error: error.message });
    }
}

function graficoProcessos(req, res) {
    try {
        const { hostName } = req.body;

        if (!hostName) {
            return res.status(400).json({ error: "hostName é obrigatório" });
        }

        console.log(`Buscando gráfico CPU: ${hostName}`);

        medidaModel.graficoProcessos(hostName).then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!")
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar gráfico CPU.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    } catch (error) {
        console.error("Erro em graficoProcessos:", error);
        res.status(500).json({ error: error.message });
    }
}

function graficoProcessosRAM(req, res) {
    try {
        const { hostName } = req.body;

        if (!hostName) {
            return res.status(400).json({ error: "hostName é obrigatório" });
        }

        console.log(`Buscando gráfico RAM: ${hostName}`);

        medidaModel.graficoProcessosRAM(hostName).then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!")
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar gráfico RAM.", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
    } catch (error) {
        console.error("Erro em graficoProcessosRAM:", error);
        res.status(500).json({ error: error.message });
    }
}

async function recomendacoesIA(req, res) {
    try {
        const { cpu, ram, disco } = req.body;

        console.log("Dados para IA:", { cpu, ram, disco });

        const recomendacoes = [
            "- Sistema operando dentro dos parâmetros normais",
            "- Monitorar consumo de recursos periodicamente",
            "- Verificar processos em background desnecessários"
        ];

        if (cpu > 80) {
            recomendacoes.push("- Alto consumo de CPU - verifique processos com uso elevado");
        }
        if (ram > 85) {
            recomendacoes.push("- Alto consumo de RAM - considere otimização de memória");
        }
        if (disco > 5) {
            recomendacoes.push("- Muitos alertas - revise configurações do sistema");
        }

        res.json({
            success: true,
            recomendacoes: recomendacoes.join('\n'),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Erro em recomendacoesIA:", error);
        res.status(500).json({
            success: false,
            error: "Erro interno ao gerar recomendações",
            details: error.message
        });
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