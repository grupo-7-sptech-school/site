var express = require("express");
var router = express.Router();

var graficoController = require("../controllers/graficoController");

router.get("/dadosGrafico/:idComponente/:hostName", function (req, res) {
    graficoController.dadosGrafico(req, res);
});

router.get("/disco/leitura/:hostName", function (req, res) {
    graficoController.leituraDisco(req, res);
});

router.get("/disco/escrita/:hostName", function (req, res) {
    graficoController.escritaDisco(req, res);
});

router.get("/disco/top3/:hostName", function (req, res) {
    graficoController.top3(req, res);
});

router.get("/disco/maisLeitura/:hostName", function (req, res) {
    graficoController.maisLeitura(req, res);
});

router.get("/disco/maisEscrita/:hostName", function (req, res) {
    graficoController.maisEscrita(req, res);
});

router.get("/ram-7dias/:idMaquina", function (req, res) {
    graficoController.getRamUltimos7Dias(req, res);
});

module.exports = router;
