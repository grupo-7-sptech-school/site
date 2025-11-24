var sustentabilidadeModel = require("../models/sustentabilidadeModel");

async function obterMediaMensal(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const periodo = req.params.periodo;

    try {
        const resultado = await sustentabilidadeModel.obterMediaMensal(idEmpresa, periodo);
        res.json(resultado);
    } catch (erro) {
        console.log("Erro no controller:", erro);
        res.status(500).json({ erro: "Erro ao buscar Gráfico de consumo" });
    }
    };

async function MaiorConsumo(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const periodo = req.params.periodo;

    try {
        const resultado = await sustentabilidadeModel.MaiorConsumo(idEmpresa, periodo);
        res.json(resultado);
    } catch (erro) {
        console.log("Erro no controller:", erro);
        res.status(500).json({ erro: "Erro ao buscar Gráfico de ranking" });
    }
}

function emissaoPoluentes(req, res) {
    var idEmpresa = req.params.idEmpresa;

    sustentabilidadeModel.emissaoPoluentes(idEmpresa)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log("ERRO no gráfico", erro);
            res.status(500).json(erro);
        });
}

function consumoAtual(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const maquina = req.params.maquina;

    sustentabilidadeModel.consumoAtual(idEmpresa, maquina)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log("ERRO no gráfico", erro);
            res.status(500).json(erro);
        });
}

// Dsdos das KPIs

async function ConsumoTotal(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const periodo = req.params.periodo;

    try {
        const resultado = await sustentabilidadeModel.ConsumoTotal(idEmpresa, periodo);
        res.json(resultado);
    } catch (erro) {
        console.log("Erro no controller:", erro);
        res.status(500).json({ erro: "Erro ao buscar KPIs" });
    }
    };

function ReducaoCO2(req, res) {
    var idEmpresa = req.params.idEmpresa;

    sustentabilidadeModel.ReducaoCO2(idEmpresa)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log("ERRO no gráfico", erro);
            res.status(500).json(erro);
        });
}

 async function maquinaMaiorConsumo(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const periodo = req.params.periodo;

    try {
        const resultado = await sustentabilidadeModel.maquinaMaiorConsumo(idEmpresa, periodo);
        res.json(resultado);
    } catch (erro) {
        console.log("Erro no controller:", erro);
        res.status(500).json({ erro: "Erro ao buscar KPIs" });
    }
    };

async function NomeMaquinaConsumo(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const periodo = req.params.periodo;

    try {
        const resultado = await sustentabilidadeModel.NomeMaquinaConsumo(idEmpresa, periodo);
        res.json(resultado);
    } catch (erro) {
        console.log("Erro no controller:", erro);
        res.status(500).json({ erro: "Erro ao buscar KPIs" });
    }
    };

async function buscarFiltrado(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const periodo = req.params.periodo;

    try {
        const resultado = await sustentabilidadeModel.buscarFiltrado(idEmpresa, periodo);
        res.json(resultado);
    } catch (erro) {
        console.log("Erro no controller:", erro);
        res.status(500).json({ erro: "Erro ao buscar KPIs" });
    }
    };

module.exports = { 
    //Gráficos
    obterMediaMensal,
    MaiorConsumo,
    emissaoPoluentes,
    consumoAtual,

    //KPIs
    ConsumoTotal,
    ReducaoCO2,
    maquinaMaiorConsumo,
    NomeMaquinaConsumo,

    //Adicionardo Filtro
    buscarFiltrado
};
