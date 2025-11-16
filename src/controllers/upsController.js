const upsModel = require('../models/upsModel');

function calcularKPIs(statusUPS) {
    if (!statusUPS || statusUPS.length === 0) {
        return {
            quantidadeUPS: 0,
            pue: 1.0,
            energiaDisponivel: 0,
            upsEmUso: 0,
            upsSemUso: 0
        };
    }

    const kpis = {
        quantidadeUPS: statusUPS.length,
        pue: calcularPUE(statusUPS),
        energiaDisponivel: calcularEnergiaDisponivel(statusUPS),
        upsEmUso: 0,
        upsSemUso: 0
    };

    statusUPS.forEach(ups => {
        if (ups.cargaAtual > 10 || ups.modoOperacao === 'BATERIA') {
            kpis.upsEmUso++;
        } else {
            kpis.upsSemUso++;
        }
    });

    return kpis;
}

function calcularPUE(dadosUPS) {
    if (!dadosUPS || dadosUPS.length === 0) return 1.0;

    console.log('Dados recebidos para cálculo PUE:');
    dadosUPS.forEach((ups, index) => {
        console.log(`UPS ${index + 1}:`, {
            identificador: ups.identificador,
            modoOperacao: ups.modoOperacao,
            cargaAtual: ups.cargaAtual,
            tensaoEntrada: ups.tensaoEntrada,
            tensaoSaida: ups.tensaoSaida,
            potenciaSaida: ups.potenciaSaida,
            nivelBateria: ups.nivelBateria
        });
    });

    let energiaTotal = 0;
    let energiaIT = 0;
    let count = 0;

    dadosUPS.forEach(ups => {
        let potenciaIT;

        // Se temos potência de saída direta, use-a (mais preciso)
        if (ups.potenciaSaida && ups.potenciaSaida > 0) {
            potenciaIT = ups.potenciaSaida;
        }
        // Caso contrário, calcule baseado em tensão e carga
        else if (ups.tensaoSaida && ups.cargaAtual) {
            // Assumindo corrente proporcional à carga
            // Para uma UPS típica, carga de 100% = corrente nominal
            const correnteEstimada = (ups.cargaAtual / 100) * 10; // 10A nominal
            potenciaIT = ups.tensaoSaida * correnteEstimada;
        } else {
            console.log(`Dados insuficientes para UPS ${ups.identificador}`);
            return; // Pula esta UPS se não tiver dados suficientes
        }

        let fatorPerdas;

        switch (ups.modoOperacao) {
            case 'REDE':
                // Modo rede: perdas de conversão AC-AC (5-8%)
                fatorPerdas = 1.07; // 7% de perdas
                break;
            case 'BATERIA':
                // Modo bateria: perdas de conversão DC-AC (10-15%)
                fatorPerdas = 1.12; // 12% de perdas
                break;
            case 'BYPASS':
                // Modo bypass: perdas mínimas (1-3%)
                fatorPerdas = 1.02; // 2% de perdas
                break;
            default:
                fatorPerdas = 1.08; // Padrão 8%
        }

        // Alta carga aumenta perdas (ineficiência)
        if (ups.cargaAtual > 90) {
            fatorPerdas += 0.05; // +5% em carga muito alta
        } else if (ups.cargaAtual > 70) {
            fatorPerdas += 0.03; // +3% em carga alta
        } else if (ups.cargaAtual < 20) {
            fatorPerdas += 0.02; // +2% em carga muito baixa (baixa eficiência)
        }

        if (ups.temperaturaAlta) {
            fatorPerdas += 0.04; // +4% por temperatura alta
        }
        if (ups.sobrecarga) {
            fatorPerdas += 0.08; // +8% por sobrecarga
        }
        if (ups.bateriaBaixa && ups.modoOperacao === 'BATERIA') {
            fatorPerdas += 0.03; // +3% por bateria baixa
        }

        const potenciaEntrada = potenciaIT * fatorPerdas;

        energiaTotal += potenciaEntrada;
        energiaIT += potenciaIT;
        count++;

        console.log(`🔧 Cálculo UPS ${ups.identificador}:`, {
            potenciaIT: `${potenciaIT.toFixed(1)}W`,
            modo: ups.modoOperacao,
            fatorPerdas: fatorPerdas.toFixed(3),
            potenciaEntrada: `${potenciaEntrada.toFixed(1)}W`,
            pueIndividual: fatorPerdas.toFixed(3)
        });
    });

    let pueFinal;
    if (energiaTotal > 0 && energiaIT > 0 && count > 0) {
        pueFinal = parseFloat((energiaTotal / energiaIT).toFixed(3));

        console.log(` PUE final: ${pueFinal}`, {
            energiaTotal: `${energiaTotal.toFixed(1)}W`,
            energiaIT: `${energiaIT.toFixed(1)}W`,
            upsCalculadas: count
        });
    } else {
        // Fallback se não conseguir calcular por energia
        pueFinal = calcularPUEBaseOperacao(dadosUPS);
        console.log(`PUE Fallback: ${pueFinal} (cálculo por operação)`);
    }

    // PUE deve estar entre 1.0 (ideal) e 2.5 (muito ruim)
    if (pueFinal < 1.0) {
        console.warn(' PUE menor que 1.0 - ajustando para 1.01');
        pueFinal = 1.01;
    }
    if (pueFinal > 2.5) {
        console.warn(' PUE maior que 2.5 - ajustando para 2.5');
        pueFinal = 2.5;
    }

    return pueFinal;
}

function calcularPUEBaseOperacao(dadosUPS) {
    if (!dadosUPS || dadosUPS.length === 0) return 1.0;

    let pueTotal = 0;
    let count = 0;

    dadosUPS.forEach(ups => {
        let pueIndividual = 1.0; // Base ideal

        // Fatores que aumentam o PUE
        if (ups.modoOperacao === 'BATERIA') {
            pueIndividual += 0.12; // Conversão DC-AC
        } else if (ups.modoOperacao === 'REDE') {
            pueIndividual += 0.07; // Conversão AC-AC
        } else {
            pueIndividual += 0.02; // Bypass (mínimo)
        }

        if (ups.cargaAtual > 90) pueIndividual += 0.05;
        else if (ups.cargaAtual > 70) pueIndividual += 0.03;
        else if (ups.cargaAtual < 20) pueIndividual += 0.02;

        if (ups.temperaturaAlta) pueIndividual += 0.04;
        if (ups.sobrecarga) pueIndividual += 0.08;

        pueTotal += pueIndividual;
        count++;
    });

    return parseFloat((pueTotal / count).toFixed(3));
}
function calcularEnergiaDisponivel(dadosUPS) {
    if (!dadosUPS || dadosUPS.length === 0) return 0;

    let totalBateria = 0;
    let count = 0;

    dadosUPS.forEach(ups => {
        if (ups.nivelBateria !== null && ups.nivelBateria !== undefined) {
            totalBateria += parseFloat(ups.nivelBateria);
            count++;
        }
    });

    return count > 0 ? Math.round(totalBateria / count) : 0;
}

function formatarDadosDonut(kpis) {
    return {
        labels: ["Em uso", "Sem uso"],
        datasets: [{
            data: [kpis.upsEmUso, kpis.upsSemUso],
            backgroundColor: ["#535756ff", "#0B795B"]
        }]
    };
}

function formatarDadosLinha(dadosAcionamentos, periodo) {
    if (!dadosAcionamentos || dadosAcionamentos.length === 0) {
        return gerarDadosLinhaMock();
    }

    const labels = dadosAcionamentos.map(item => {
        const data = new Date(item.data);
        return periodo === '24h'
            ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });

    const data = dadosAcionamentos.map(item => item.total_acionamentos);

    return {
        labels: labels,
        datasets: [{
            label: "Acionamentos de UPS",
            data: data,
            tension: 0.4,
            borderWidth: 3,
            borderColor: "#4bc0c0",
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            pointRadius: 5,
            pointBackgroundColor: "#4bc0c0",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            fill: true
        }]
    };
}

function gerarDadosLinhaMock() {
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const acionamentos = [3, 5, 2, 8, 4, 1, 6];

    return {
        labels: dias,
        datasets: [{
            label: "Acionamentos de UPS",
            data: acionamentos,
            tension: 0.4,
            borderWidth: 3,
            borderColor: "#4bc0c0",
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            pointRadius: 5,
            pointBackgroundColor: "#4bc0c0",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverRadius: 7,
            fill: true
        }]
    };
}


const upsController = {
    obterStatusUPS: async (req, res) => {
        try {
            console.log('=== INICIANDO obterStatusUPS ===');
            const status = await upsModel.obterStatusAtual();
            console.log('Status retornado:', JSON.stringify(status, null, 2));
            res.json(status);
        } catch (error) {
            console.error('ERRO COMPLETO obterStatusUPS:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                detalhes: error.message
            });
        }
    },

    obterEstatisticasUPS: async (req, res) => {
        try {
            console.log(' Recebida requisição para /estatisticas');

            const statusUPS = await upsModel.obterStatusAtual();
            console.log(`${statusUPS.length} UPS encontrados para cálculos`);

            console.log('Analise PUE:');
            statusUPS.forEach((ups, index) => {
                const campos = Object.keys(ups);
                console.log(`UPS ${index + 1} (${ups.identificador}) - Campos disponíveis:`, campos.filter(campo =>
                    campo.includes('potencia') ||
                    campo.includes('tensao') ||
                    campo.includes('corrente') ||
                    campo.includes('carga') ||
                    campo.includes('eficiencia')
                ));
            });

            const kpis = calcularKPIs(statusUPS);
            const estatisticasBD = await upsModel.obterEstatisticas();

            const resultado = {
                ...kpis,
                estatisticasDetalhadas: estatisticasBD,
                timestamp: new Date().toISOString()
            };

            console.log(' KPIs calculados:', {
                quantidade: resultado.quantidadeUPS,
                pue: resultado.pue,
                energia: resultado.energiaDisponivel,
                emUso: resultado.upsEmUso,
                semUso: resultado.upsSemUso
            });

            res.json(resultado);

        } catch (error) {
            console.error(' Erro ao obter estatísticas UPS:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }

    },

    obterDadosGraficos: async (req, res) => {
        try {
            const { periodo = '7d' } = req.query;
            console.log(`Recebida requisição para /graficos - período: ${periodo}`);

            const [dadosAcionamentos, statusUPS] = await Promise.all([
                upsModel.obterDadosAcionamentos(periodo),
                upsModel.obterStatusAtual()
            ]);

            const kpis = calcularKPIs(statusUPS);

            const dadosFormatados = {
                donut: formatarDadosDonut(kpis),
                linha: formatarDadosLinha(dadosAcionamentos, periodo),
                periodo: periodo,
                atualizadoEm: new Date().toISOString()
            };

            console.log('Dados gráficos formatados:', {
                donut: dadosFormatados.donut.datasets[0].data,
                linha: dadosFormatados.linha.labels?.length + ' dias de acionamentos'
            });

            res.json(dadosFormatados);

        } catch (error) {
            console.error('Erro ao obter dados gráficos:', error);

            const statusUPS = await upsModel.obterStatusAtual().catch(() => []);
            const kpis = calcularKPIs(statusUPS);

            res.json({
                donut: formatarDadosDonut(kpis),
                linha: gerarDadosLinhaMock(),
                usandoMock: true,
                error: error.message
            });
        }
    },

    obterAlertasUPS: async (req, res) => {
        try {
            const alertas = await upsModel.obterAlertasRecentes();
            res.json(alertas);
        } catch (error) {
            console.error('Erro ao obter alertas UPS:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    listarUPS: async (req, res) => {
        try {
            const upsList = await upsModel.listarTodasUPS();
            res.json(upsList);
        } catch (error) {
            console.error('Erro ao listar UPS:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    enviarComando: async (req, res) => {
        try {
            const { comando } = req.body;

            if (!comando) {
                return res.status(400).json({ error: 'Comando não especificado' });
            }

            const resultado = await upsModel.enviarComandoUPS(comando);
            res.json(resultado);
        } catch (error) {
            console.error('Erro ao enviar comando UPS:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    testarConexao: async (req, res) => {
        try {
            const database = require('../database/config.js');

            const [result] = await database.execute('SELECT 1 as test');
            console.log('Teste conexão:', result);

            const [tables] = await database.execute(`
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'solarData01' 
                AND TABLE_NAME = 'UPS'
            `);

            console.log('Tabela UPS existe?', tables.length > 0);

            res.json({
                conexao: 'OK',
                tabelaUPS: tables.length > 0,
                totalTabelas: tables.length
            });

        } catch (error) {
            console.error('Erro no teste:', error);
            res.status(500).json({
                error: error.message,
                stack: error.stack
            });
        }
    },
    incluirUPS: async (req, res) => {
        try {
            const {
                identificador,
                modelo,
                fabricante,
                capacidadeVA,
                capacidadeWatts,
                ip,
                ativo
            } = req.body;

            console.log('Recebida requisição para incluir UPS:', req.body);

            if (!identificador || !modelo || !fabricante) {
                return res.status(400).json({
                    sucesso: false,
                    error: 'Identificador, modelo e fabricante são obrigatórios'
                });
            }

            if (!capacidadeVA || capacidadeVA <= 0) {
                return res.status(400).json({
                    sucesso: false,
                    error: 'Capacidade VA deve ser maior que zero'
                });
            }

            const dadosUPS = {
                identificador: identificador.trim(),
                modelo: modelo.trim(),
                fabricante: fabricante.trim(),
                capacidadeVA: parseInt(capacidadeVA),
                capacidadeWatts: parseInt(capacidadeWatts) || Math.round(parseInt(capacidadeVA) * 0.8), // 80% da capacidade VA
                ip: ip ? ip.trim() : null,
                ativo: ativo !== undefined ? ativo : true
            };

            const resultado = await upsModel.incluirUPS(dadosUPS);

            res.json({
                sucesso: true,
                mensagem: 'UPS cadastrada com sucesso',
                dados: {
                    id: resultado.id,
                    identificador: dadosUPS.identificador,
                    modelo: dadosUPS.modelo
                }
            });

        } catch (error) {
            console.error('Erro ao incluir UPS:', error);

            if (error.message.includes('Já existe uma UPS')) {
                return res.status(409).json({
                    sucesso: false,
                    error: error.message
                });
            }

            res.status(500).json({
                sucesso: false,
                error: 'Erro interno do servidor ao cadastrar UPS'
            });
        }
    }
};

module.exports = upsController;