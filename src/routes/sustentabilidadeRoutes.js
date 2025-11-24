var express = require("express");
var router = express.Router();

var sustentabilidadeController = require("../controllers/sustentabilidadeController");

// Rotas dos Gráficos
router.get("/consumo/:idEmpresa/:periodo", function (req, res) {
    sustentabilidadeController.obterMediaMensal(req, res);
});

router.get("/maior/:idEmpresa/:periodo", function (req, res) {
    sustentabilidadeController.MaiorConsumo(req, res);
});

router.get("/emissao/:idEmpresa", function (req, res) {
    sustentabilidadeController.emissaoPoluentes(req, res);
});

router.get("/atual/:idEmpresa/:maquina", function (req, res) {
    sustentabilidadeController.consumoAtual(req, res);
});

//Rota KPIs
router.get("/total/:idEmpresa/:periodo", function (req, res) {
    sustentabilidadeController.ConsumoTotal(req, res);
});

router.get("/co2/:idEmpresa", function (req, res) {
    sustentabilidadeController.ReducaoCO2(req, res);
});

router.get("/potencia/:idEmpresa/:periodo", function (req, res) {
    sustentabilidadeController.maquinaMaiorConsumo(req, res);
});

router.get("/nomeMaquina/:idEmpresa/:periodo", function (req, res) {
    sustentabilidadeController.NomeMaquinaConsumo(req, res);
});

router.get("/kpis/:idEmpresa/:periodo", function (req, res) {
    sustentabilidadeController.buscarFiltrado(req, res);
});

module.exports = router;
