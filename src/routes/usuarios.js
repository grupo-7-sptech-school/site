var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");
const { config } = require("dotenv");

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

router.get("/puxarAlerta", function (req, res) {
    usuarioController.puxarAlerta(req, res);
});

router.post("/validarEmailRecuperar", function (req, res) {
    usuarioController.validarEmailRecuperar(req, res);
});

router.put("/inserirRecuperacao", function (req, res) {
    usuarioController.inserirRecuperacao(req, res);
});


router.post("/enviarRecuperacao", async function (req, res) {
    const { email, token } = req.body; 
    try {
        await usuarioController.enviarRecuperacao(email, token);
        res.status(200).json({ message: "E-mail enviado com sucesso!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ message: "Erro ao enviar e-mail", error: erro.message });
    }});


router.post("/cadastrarMaquina", function (req, res) {
    usuarioController.cadastrarMaquinaController(req, res);
});

module.exports = router;