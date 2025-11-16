const express = require('express');
const router = express.Router();
const upsController = require('../controllers/upsController');

router.get('/status', upsController.obterStatusUPS);
router.get('/estatisticas', upsController.obterEstatisticasUPS);
router.get('/alertas', upsController.obterAlertasUPS);
router.get('/graficos', upsController.obterDadosGraficos);
router.post('/comando', upsController.enviarComando);
router.get('/lista', upsController.listarUPS);
router.get('/teste', upsController.testarConexao);
router.post('/incluir', upsController.incluirUPS);

router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'UPS API funcionando',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;