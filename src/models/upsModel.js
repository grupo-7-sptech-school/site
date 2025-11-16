const { executar } = require('../database/config');

const upsModel = {
    async obterStatusAtual() {
        const query = `
        SELECT 
            u.identificador,
            u.modelo,
            r.modoOperacao,
            r.nivelBateria,
            r.tempoBateria,
            r.tensaoEntrada,
            r.tensaoSaida,
            r.cargaAtual,
            r.potenciaSaida,
            r.frequencia,
            r.bateriaBaixa,
            r.sobrecarga,
            r.temperaturaAlta,
            r.falhaVentilador,
            r.dtRegistro
        FROM UPS u
        LEFT JOIN RegistroUPS r ON u.idUPS = r.fkUPS
        WHERE r.idRegistroUPS = (
            SELECT MAX(idRegistroUPS) 
            FROM RegistroUPS 
            WHERE fkUPS = u.idUPS
        )
        ORDER BY u.idUPS
    `;

        try {
            console.log(' Executando query de status UPS...');
            const resultados = await executar(query);
            console.log('Dados brutos do banco:', JSON.stringify(resultados, null, 2));
            return resultados;
        } catch (error) {
            console.error('Erro ao obter status UPS:', error);
            throw error;
        }
    },
    async incluirUPS(dadosUPS) {
        const query = `
        INSERT INTO UPS (identificador, modelo, fabricante, capacidadeVA, capacidadeWatts, ip, ativo, dataCriacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

        const valores = [
            dadosUPS.identificador,
            dadosUPS.modelo,
            dadosUPS.fabricante,
            dadosUPS.capacidadeVA,
            dadosUPS.capacidadeWatts,
            dadosUPS.ip,
            dadosUPS.ativo || true
        ];

        try {
            console.log('Inserindo nova UPS no banco:', dadosUPS);
            const resultado = await executar(query, valores);
            console.log('UPS inserida com sucesso. ID:', resultado.insertId);

            return {
                sucesso: true,
                id: resultado.insertId,
                mensagem: 'UPS cadastrada com sucesso'
            };
        } catch (error) {
            console.error('Erro ao inserir UPS:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Já existe uma UPS com este identificador');
            }

            throw new Error('Erro ao cadastrar UPS no banco de dados');
        }
    },

    async obterEstatisticas() {
        const query = `
            SELECT 
                COUNT(*) as total_ups,
                SUM(CASE WHEN r.modoOperacao = 'BATERIA' THEN 1 ELSE 0 END) as ups_em_bateria,
                AVG(r.nivelBateria) as media_bateria,
                MAX(r.tempoBateria) as max_tempo_bateria,
                SUM(CASE WHEN r.sobrecarga = TRUE THEN 1 ELSE 0 END) as total_sobrecargas
            FROM UPS u
            LEFT JOIN RegistroUPS r ON u.idUPS = r.fkUPS
            WHERE r.idRegistroUPS = (
                SELECT MAX(idRegistroUPS) 
                FROM RegistroUPS 
                WHERE fkUPS = u.idUPS
            )
        `;

        try {
            console.log('Executando query de estatísticas...');
            const resultados = await executar(query);
            console.log('Resultados estatísticas:', resultados[0]);
            return resultados[0] || {};
        } catch (error) {
            console.error('Erro ao obter estatísticas UPS:', error);
            throw error;
        }
    },

    async obterAlertasRecentes() {
        const query = `
            SELECT 
                a.dtHora,
                a.estado,
                a.descricao,
                a.captura
            FROM Alerta a
            WHERE a.fkRegistroUPS IS NOT NULL
            AND a.dtHora >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY a.dtHora DESC
            LIMIT 50
        `;

        try {
            const resultados = await executar(query);
            return resultados;
        } catch (error) {
            console.error('Erro ao obter alertas UPS:', error);
            throw error;
        }
    },

    async obterDadosParaGraficos(periodo = '1h') {
        let intervalo;
        switch (periodo) {
            case '1h': intervalo = '1 HOUR'; break;
            case '6h': intervalo = '6 HOUR'; break;
            case '24h': intervalo = '24 HOUR'; break;
            case '7d': intervalo = '7 DAY'; break;
            default: intervalo = '1 HOUR';
        }

        const query = `
            SELECT 
                r.dtRegistro,
                r.modoOperacao,
                r.nivelBateria,
                r.tensaoEntrada,
                r.tensaoSaida,
                r.cargaAtual,
                r.potenciaSaida,
                u.identificador
            FROM RegistroUPS r
            JOIN UPS u ON r.fkUPS = u.idUPS
            WHERE r.dtRegistro >= DATE_SUB(NOW(), INTERVAL ${intervalo})
            ORDER BY r.dtRegistro ASC
        `;

        try {
            const resultados = await executar(query);
            return this._processarDadosGraficos(resultados);
        } catch (error) {
            console.error('Erro ao obter dados gráficos UPS:', error);
            throw error;
        }
    },

    _processarDadosGraficos(dados) {
        const agrupadosPorUPS = {};

        dados.forEach(registro => {
            const upsId = registro.identificador;

            if (!agrupadosPorUPS[upsId]) {
                agrupadosPorUPS[upsId] = {
                    labels: [],
                    nivelBateria: [],
                    tensaoEntrada: [],
                    tensaoSaida: [],
                    cargaAtual: [],
                    modoOperacao: []
                };
            }

            agrupadosPorUPS[upsId].labels.push(
                new Date(registro.dtRegistro).toLocaleTimeString('pt-BR')
            );
            agrupadosPorUPS[upsId].nivelBateria.push(registro.nivelBateria);
            agrupadosPorUPS[upsId].tensaoEntrada.push(registro.tensaoEntrada);
            agrupadosPorUPS[upsId].tensaoSaida.push(registro.tensaoSaida);
            agrupadosPorUPS[upsId].cargaAtual.push(registro.cargaAtual);
            agrupadosPorUPS[upsId].modoOperacao.push(registro.modoOperacao);
        });

        return agrupadosPorUPS;
    },

    async enviarComandoUPS(comando) {
        return {
            sucesso: true,
            mensagem: `Comando ${comando} enviado com sucesso`,
            timestamp: new Date().toISOString()
        };
    },

    async listarTodasUPS() {
        const query = `
            SELECT 
                u.idUPS,
                u.identificador,
                u.modelo,
                u.fabricante,
                u.capacidadeVA,
                u.capacidadeWatts,
                u.ip,
                u.ativo,
                COUNT(m.hostName) as maquinas_protegidas
            FROM UPS u
            LEFT JOIN Maquina m ON u.idUPS = m.fkUPS
            GROUP BY u.idUPS
            ORDER BY u.identificador
        `;

        try {
            const resultados = await executar(query);
            return resultados;
        } catch (error) {
            console.error('Erro ao listar UPS:', error);
            throw error;
        }
    },
    async obterDadosAcionamentos(periodo = '7d') {
        let intervalo;
        switch (periodo) {
            case '24h': intervalo = '1 DAY'; break;
            case '7d': intervalo = '7 DAY'; break;
            case '30d': intervalo = '30 DAY'; break;
            default: intervalo = '7 DAY';
        }

        const query = `
        SELECT 
            DATE(r.dtRegistro) as data,
            COUNT(*) as total_acionamentos,
            SUM(CASE WHEN r.modoOperacao = 'BATERIA' THEN 1 ELSE 0 END) as acionamentos_bateria,
            SUM(CASE WHEN a.idAlerta IS NOT NULL THEN 1 ELSE 0 END) as acionamentos_com_alerta
        FROM RegistroUPS r
        LEFT JOIN Alerta a ON r.fkUPS = a.fkRegistroUPS
        WHERE r.dtRegistro >= DATE_SUB(NOW(), INTERVAL ${intervalo})
        AND (r.modoOperacao = 'BATERIA' OR a.idAlerta IS NOT NULL)
        GROUP BY DATE(r.dtRegistro)
        ORDER BY data ASC
    `;

        try {
            console.log('Buscando dados de acionamentos...');
            const resultados = await executar(query);
            console.log(` ${resultados.length} dias com acionamentos encontrados`);
            return resultados;
        } catch (error) {
            console.error(' Erro ao obter dados de acionamentos:', error);
            throw error;
        }
    }
};

module.exports = upsModel;