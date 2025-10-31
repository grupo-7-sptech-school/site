var ambiente_processo = 'producao';
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");
var axios = require("axios");

var PORTA_APP = process.env.APP_PORT || 80;
var HOST_APP = process.env.APP_HOST || '0.0.0.0';

var app = express();

var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var avisosRouter = require("./src/routes/avisos");
var medidasRouter = require("./src/routes/medidas");
var empresasRouter = require("./src/routes/empresas");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/avisos", avisosRouter);
app.use("/medidas", medidasRouter);
app.use("/empresas", empresasRouter);



const PDFDocument = require('pdfkit');


app.get("/relatorio/pdf", async (req, res) => {
    try {
        console.log('Gerando PDF completo...');

        const usuarioModel = require("./src/models/usuarioModel.js");
        const processos = await usuarioModel.puxarProcesso();

        if (!processos || processos.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum processo encontrado"
            });
        }

        const analise = gerarAnaliseLocalSimples(processos);

        const doc = new PDFDocument({ margin: 20 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_solardata_${Date.now()}.pdf"`);

        doc.pipe(res);

        const corPrimaria = '#18B187';
        const corSecundaria = '#2C3E50';
        const corAlerta = '#E74C3C';
        const corSucesso = '#27AE60';
        const corAtencao = '#F39C12';

        doc.fillColor(corPrimaria)
            .rect(0, 0, doc.page.width, 70)
            .fill();

        doc.fillColor('#FFFFFF')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('SOLARDATA', 50, 25)
            .fontSize(10)
            .text('Monitoramento de Servidores Verdes', 50, 50);

        doc.fillColor(corSecundaria)
            .fontSize(8)
            .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 400, 35, { align: 'right' });

        let yPosition = 100;

        const statusColor = analise.status === 'Crítico' ? corAlerta :
            analise.status === 'Atenção' ? corAtencao : corSucesso;

        doc.fillColor(statusColor)
            .rect(50, yPosition, doc.page.width - 100, 30)
            .fill();

        doc.fillColor('#FFFFFF')
            .fontSize(14)
            .font('Helvetica-Bold')
            .text(`STATUS: ${analise.status}`, 60, yPosition + 8);

        yPosition += 40;

        doc.fillColor(corSecundaria)
            .fontSize(14)
            .font('Helvetica-Bold')
            .text('MÉTRICAS PRINCIPAIS', 50, yPosition);

        yPosition += 25;

        const metrics = [
            { label: 'Processos Totais', value: processos.length },
            { label: 'Processos Ativos', value: analise.ativos },
            { label: 'Uso CPU Total', value: `${analise.totalCPU ? analise.totalCPU.toFixed(1) : '0.0'}%` },
            { label: 'Uso RAM Total', value: `${analise.totalRAM ? analise.totalRAM.toFixed(1) : '0.0'}%` }
        ];

        metrics.forEach((metric, index) => {
            const y = yPosition + (index * 20);

            doc.fillColor(corSecundaria)
                .fontSize(9)
                .text(`• ${metric.label}:`, 60, y);

            doc.fontSize(9)
                .font('Helvetica-Bold')
                .text(metric.value, 200, y);
        });

        yPosition += 100;

        if (analise.alertas && analise.alertas.length > 0) {
            doc.fillColor(corSecundaria)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('ALERTAS', 50, yPosition);

            yPosition += 20;

            analise.alertas.forEach((alerta) => {
                doc.fillColor(corAlerta)
                    .fontSize(9)
                    .text(`⚠ ${alerta}`, 60, yPosition);
                yPosition += 15;
            });

            yPosition += 5;
        }

        if (analise.topCPU && analise.topCPU.length > 0) {
            doc.fillColor(corSecundaria)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('TOP 5 - MAIOR CONSUMO CPU', 50, yPosition);

            yPosition += 20;

            doc.fillColor(corSecundaria)
                .fontSize(9)
                .text('#', 60, yPosition)
                .text('Processo', 100, yPosition)
                .text('Uso CPU', 400, yPosition, { align: 'right' });

            yPosition += 15;

            analise.topCPU.slice(0, 5).forEach((proc, index) => {
                const usage = proc.cpuPorcentagem || 0;

                doc.fillColor(corSecundaria)
                    .fontSize(9)
                    .text(`${index + 1}.`, 60, yPosition)
                    .text(proc.nome || 'Processo', 100, yPosition)
                    .text(`${usage.toFixed(1)}%`, 400, yPosition, { align: 'right' });

                yPosition += 15;
            });

            yPosition += 15;
        }

        if (analise.topRAM && analise.topRAM.length > 0) {
            doc.fillColor(corSecundaria)
                .fontSize(14)
                .font('Helvetica-Bold')
                .text('TOP 5 - MAIOR CONSUMO RAM', 50, yPosition);

            yPosition += 20;

            doc.fillColor(corSecundaria)
                .fontSize(9)
                .text('#', 60, yPosition)
                .text('Processo', 100, yPosition)
                .text('Uso RAM', 400, yPosition, { align: 'right' });

            yPosition += 15;

            analise.topRAM.slice(0, 5).forEach((proc, index) => {
                const usage = proc.ramPorcentagem || 0;

                doc.fillColor(corSecundaria)
                    .fontSize(9)
                    .text(`${index + 1}.`, 60, yPosition)
                    .text(proc.nome || 'Processo', 100, yPosition)
                    .text(`${usage.toFixed(1)}%`, 400, yPosition, { align: 'right' });

                yPosition += 15;
            });

            yPosition += 15;
        }

        const espaçoRestante = doc.page.height - yPosition - 50;
        
        if (espaçoRestante > 50) {
            const recomendacoes = gerarRecomendacoes(analise.alertas);

            if (recomendacoes.length > 0) {
                doc.fillColor(corPrimaria)
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text('RECOMENDAÇÕES', 50, yPosition);

                yPosition += 20;

                recomendacoes.forEach((recomendacao) => {
                    if (yPosition < doc.page.height - 50) {
                        doc.fillColor(corSecundaria)
                            .fontSize(9)
                            .text(`• ${recomendacao}`, 60, yPosition, {
                                width: doc.page.width - 120,
                                align: 'justify'
                            });
                        yPosition += 12;
                    }
                });
            }
        }

        // RODAPÉ FIXO NA PRIMEIRA PÁGINA
        doc.fillColor(corPrimaria)
            .rect(0, doc.page.height - 30, doc.page.width, 30)
            .fill();

        doc.fillColor('#FFFFFF')
            .fontSize(7)
            .text('SolarData - Monitoramento de Servidores Sustentáveis', 50, doc.page.height - 20)
            .text('Relatório gerado automaticamente', 400, doc.page.height - 20, { align: 'right' });

        doc.end();

        console.log('PDF gerado e enviado!');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        res.status(500).json({
            success: false,
            error: 'Falha ao gerar relatório PDF',
            details: error.message
        });
    }
});





app.get("/analisar-processos", async (req, res) => {
    try {
        const usuarioModel = require("./src/models/usuarioModel.js");
        const processos = await usuarioModel.puxarProcesso();

        if (!processos || processos.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum processo encontrado"
            });
        }

        console.log(`${processos.length} processos encontrados`);

        const analise = gerarAnaliseLocalSimples(processos);

        res.json({
            success: true,
            message: "Análise detalhada gerada com sucesso!",
            quantidade_processos: processos.length,
            status: analise.status,
            metricas: {
                processos_totais: processos.length,
                processos_ativos: analise.ativos,
                cpu_total: analise.totalCPU ? analise.totalCPU.toFixed(1) + '%' : '0%',
                ram_total: analise.totalRAM ? analise.totalRAM.toFixed(1) + '%' : '0%'
            },
            alertas: analise.alertas,
            top_processos_cpu: analise.topCPU.slice(0, 5).map((proc, index) => ({
                posicao: index + 1,
                nome: proc.nome,
                uso_cpu: proc.cpuPorcentagem ? proc.cpuPorcentagem.toFixed(1) + '%' : '0%'
            })),
            top_processos_ram: analise.topRAM.slice(0, 5).map((proc, index) => ({
                posicao: index + 1,
                nome: proc.nome,
                uso_ram: proc.ramPorcentagem ? proc.ramPorcentagem.toFixed(1) + '%' : '0%'
            })),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Erro na análise:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});










function gerarAnaliseLocalSimples(processos) {
    var ativos = processos.filter(proc => proc.nome !== 'Idle' && proc.nome);

    var totalCPU = ativos.reduce((sum, proc) => sum + (proc.cpuPorcentagem || 0), 0);
    var totalRAM = ativos.reduce((sum, proc) => sum + (proc.ramPorcentagem || 0), 0);
    totalRAM = Math.min(totalRAM, 100);

    var mediaCPU = ativos.length > 0 ? totalCPU / ativos.length : 0;
    var mediaRAM = ativos.length > 0 ? totalRAM / ativos.length : 0;

    var topCPU = [...ativos].sort((a, b) => (b.cpuPorcentagem || 0) - (a.cpuPorcentagem || 0)).slice(0, 5);
    var topRAM = [...ativos].sort((a, b) => (b.ramPorcentagem || 0) - (a.ramPorcentagem || 0)).slice(0, 5);

    // Identificar processos críticos
    var criticos = ativos.filter(proc =>
        (proc.cpuPorcentagem || 0) > 10 ||
        (proc.ramPorcentagem || 0) > 5
    );

    var alertas = [];
    if (totalCPU > 80) alertas.push('CPU acima do limite recomendado.');
    if (totalRAM > 85) alertas.push('RAM acima do limite recomendado.');
    if (criticos.length > 5) alertas.push('Número elevado de processos críticos.');

    var status = 'Normal';
    if (totalCPU > 80 || totalRAM > 85 || criticos.length > 5) {
        status = 'Crítico';
    } else if (totalCPU > 60 || totalRAM > 70 || criticos.length > 2) {
        status = 'Atenção';
    }

    return {
        relatorio: `Relatório gerado em ${new Date().toLocaleString('pt-BR')}`,
        alertas: alertas,
        topCPU: topCPU,
        topRAM: topRAM,
        criticos: criticos,
        ativos: ativos.length,
        totalCPU: totalCPU,
        totalRAM: totalRAM,
        status: status
    };
}

function gerarRecomendacoes(alertas) {
    const recomendacoes = [];

    if (alertas.some(alerta => alerta.includes('CPU'))) {
        recomendacoes.push('Considere encerrar processos que estão consumindo muita CPU, especialmente os listados no Top 5.');
        recomendacoes.push('Verifique se há processos com vazamento de CPU e reinicie-os.');
    }

    if (alertas.some(alerta => alerta.includes('RAM'))) {
        recomendacoes.push('Processos com alto consumo de memória devem ser investigados. Verifique se há gargalos.');
        recomendacoes.push('Considere aumentar a memória física ou otimizar as aplicações para reduzir o uso de RAM.');
    }

    if (alertas.some(alerta => alerta.includes('críticos'))) {
        recomendacoes.push('Revise a lista de processos críticos e encerre os que não são essenciais para o sistema.');
    }

    if (recomendacoes.length === 0) {
        recomendacoes.push('O sistema está operando dentro dos parâmetros normais. Mantenha o monitoramento regular.');
    }

    return recomendacoes;
}

app.listen(PORTA_APP, function () {
    console.log(`
   SOLARDATA - MONITORAMENTO DE SERVIDORES VERDES
   http://${HOST_APP}:${PORTA_APP}

   Acesse: http://localhost:${PORTA_APP}
    `);
});