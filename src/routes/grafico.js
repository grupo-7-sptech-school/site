var express = require("express");
var router = express.Router();

var graficoController = require("../controllers/graficoController");

router.get("/dadosGrafico/:idComponente/:hostName", (req, res) => {
    graficoController.dadosGrafico(req, res);
});


module.exports = router;
