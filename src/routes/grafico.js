var express = require("express");
var router = express.Router();

var graficoController = require("../controllers/graficoController");

router.get("/dadosGrafico/:idComponente/:hostName", function (req, res) {
    graficoController.dadosGrafico(req, res);
});



module.exports = router;
