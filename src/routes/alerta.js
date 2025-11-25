var express = require("express");
var router = express.Router();
var alertaController = require("../controllers/alertaController");

router.post("/kpis", function (req, res) {
    alertaController.kpis(req, res);
});

router.post("/graficoLinha", function (req, res) {
    alertaController.graficoLinha(req, res);
});

router.post("/graficoComponentes", function (req, res) {
    alertaController.graficoComponentes(req, res);
});

router.post("/graficoTipos", function (req, res) {
    alertaController.graficoTipos(req, res);
});

module.exports = router;