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

router.get("/ram-7dias/:hostName", (req, res) => {
    graficoController.ramUltimos7Dias(req, res);
});

router.get("/alertas-semana/:hostName", (req, res) => {
    graficoController.alertasSemana(req, res);
});


router.get("/top3-maquinas-ram/:hostName", function (req, res) {
    graficoController.top3MaquinasRAM(req, res);
});


module.exports = router;
