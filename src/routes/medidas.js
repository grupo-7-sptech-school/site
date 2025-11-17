var express = require("express");
var router = express.Router();

var medidaController = require("../controllers/medidaController");

router.get("/ultimas/:idAquario", function (req, res) {
    medidaController.buscarUltimasMedidas(req, res);
});

router.get("/tempo-real/:idAquario", function (req, res) {
    medidaController.buscarMedidasEmTempoReal(req, res);
})

router.post("/alertaPorComponente", function (req, res) {
    medidaController.alertaPorComponente(req, res);
})

router.post("/maiorProcessoCpu", function (req, res) {
    medidaController.maiorProcessoCpu(req, res);
})

router.post("/maiorProcessoRam", function (req, res) {
    medidaController.maiorProcessoRam(req, res);
})

router.put("/alterarMetricas", function (req, res) {
    medidaController.alterarMetricas(req, res);
})

router.post("/puxarMetricas", function (req, res) {
    medidaController.puxarMetricas(req, res);
})

router.post("/puxarMaquinaProcessos", function (req, res) {
    medidaController.puxarMaquinaProcessos(req, res);
})

router.post("/quantidadeAlertasProcessos", function (req, res) {
    medidaController.quantidadeAlertasProcessos(req, res);
})

router.post("/rankingProcessos", function (req, res) {
    medidaController.rankingProcessos(req, res);
})

module.exports = router;