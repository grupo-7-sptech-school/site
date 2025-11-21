var express = require("express");
var router = express.Router();

var sustentabilidadeController = require("../controllers/sustentabilidadeController");

router.get("/mensal/:idEmpresa", function (req, res) {
    sustentabilidadeController.obterMediaMensal(req, res);
});

module.exports = router;
