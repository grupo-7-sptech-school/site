var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.post("/validarCodigo", function (req, res) {
    usuarioController.validarCodigo(req, res);
});

router.post('/enviar-email', function (req, res) {
    usuarioController.sendEmail(req, res);
});

router.get("/puxarProcesso", function (req, res) {
    usuarioController.puxarProcesso(req, res);
});


module.exports = router;