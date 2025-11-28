var ambiente_processo = 'producao';
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");
var axios = require("axios");
var multer = require("multer");

var PORTA_APP = process.env.APP_PORT || 80;
var HOST_APP = process.env.APP_HOST || '0.0.0.0';

var app = express();

var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var medidasRouter = require("./src/routes/medidas");
var graficoRouter = require("./src/routes/grafico.js");
const upsRoutes = require('./src/routes/upsRoutes');
var sustentabilidadeRoutes = require("./src/routes/sustentabilidadeRoutes");
const alertaRouter = require("./src/routes/alerta");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/medidas", medidasRouter);
app.use("/grafico", graficoRouter);
app.use("/sustentabilidade", sustentabilidadeRoutes);
app.use("/alertas", alertaRouter);
app.use("/api/ups", upsRoutes);

app.get('/api/ups/teste-simples', (req, res) => {
    res.json({ 
        message: 'Rota UPS funcionando!',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/ups/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'UPS API funcionando',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/ups/routes', (req, res) => {
    const routes = [
        '/api/ups/health',
        '/api/ups/teste-simples', 
        '/api/ups/routes',
        '/api/ups/status',
        '/api/ups/estatisticas',
        '/api/ups/graficos',
        '/api/ups/lista',
        '/api/ups/teste'
    ];
    res.json({ availableRoutes: routes });
});

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const extensao = file.originalname.split('.').pop();
        const nomeArquivo = `${Date.now()}.${extensao}`; 
        cb(null, nomeArquivo);
    }
});

const upload = multer({storage});

app.get("/relatorio/pdf", async (req, res) => {
    try {
        console.log('Gerando PDF com pdf-lib...');

        const usuarioModel = require("./src/models/usuarioModel.js");
        const processos = await usuarioModel.puxarProcesso();
        
        if (!processos || processos.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum processo encontrado"
            });
        }

        const analise = gerarAnaliseLocalSimples(processos);

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]);

        const { width, height } = page.getSize();
        const margin = 50;
        const maxWidth = width - (margin * 2);
        
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let y = height - margin;

        const drawText = (text, x, yPos, size = 10, isBold = false, color = rgb(0, 0, 0), maxWidth = width - (margin * 2)) => {
            const textString = String(text);
            const currentFont = isBold ? fontBold : font;
            page.drawText(textString, {
                x,
                y: yPos,
                size,
                font: currentFont,
                color,
                maxWidth,
            });
            return yPos - (size + 2);
        };

        y = drawText('SolarData - Relatório de Monitoramento', margin, y, 16, true, rgb(0.173, 0.243, 0.314));
        y = drawText(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, y, 8, false, rgb(0.5, 0.5, 0.5));
        
        y -= 10;

        page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 1,
            color: rgb(0.173, 0.243, 0.314),
        });

        y -= 20;

        const statusColor = analise.status === 'Crítico' ? rgb(1, 0, 0) :
                           analise.status === 'Atenção' ? rgb(0.953, 0.612, 0.071) : 
                           rgb(0.153, 0.682, 0.376);

        y = drawText(`STATUS DO SISTEMA: ${analise.status}`, margin, y, 14, true, statusColor);

        y -= 25;

        y = drawText('Métricas Principais', margin, y, 12, true, rgb(0.173, 0.243, 0.314));

        y -= 15;

        const metrics = [
            { label: 'Processos Totais', value: String(processos.length) },
            { label: 'Processos Ativos', value: String(analise.ativos) },
            { label: 'Uso CPU Total', value: `${Math.min(analise.totalCPU, 100)?.toFixed(1) || 0}%` },
            { label: 'Uso RAM Total', value: `${Math.min(analise.totalRAM, 100)?.toFixed(1) || 0}%` }
        ];

        metrics.forEach((m, index) => {
            const coluna = index % 2 === 0 ? margin : margin + 200;
            const linha = y - (Math.floor(index / 2) * 15);
            
            drawText(`${m.label}:`, coluna, linha, 9, false, rgb(0.5, 0.5, 0.5));
            drawText(m.value, coluna + 80, linha, 9, true, rgb(0.204, 0.286, 0.369));
        });

        y -= 40;

        if (analise.alertas?.length > 0) {
            y = drawText('Alertas', margin, y, 12, true, rgb(0.173, 0.243, 0.314));
            y -= 15;

            analise.alertas.forEach((alerta) => {
                y = drawText(`• ${alerta}`, margin + 10, y, 9, false, rgb(1, 0, 0), maxWidth - 10);
                y -= 2;
            });
            y -= 5;
        }

        y = drawText('Top 5 - Maior Consumo de CPU', margin, y, 12, true, rgb(0.173, 0.243, 0.314));
        y -= 15;

        drawText('#', margin, y, 8, true, rgb(0.204, 0.286, 0.369));
        drawText('Processo', margin + 30, y, 8, true, rgb(0.204, 0.286, 0.369));
        drawText('Uso CPU', width - margin - 40, y, 8, true, rgb(0.204, 0.286, 0.369));

        y -= 10;

        page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 0.5,
            color: rgb(0.173, 0.243, 0.314),
        });

        y -= 8;

        analise.topCPU.slice(0, 5).forEach((proc, index) => {
            const usage = Math.min(proc.cpuPorcentagem, 100);
            drawText(String(index + 1) + '.', margin, y, 8, false, rgb(0.5, 0.5, 0.5));
            drawText((proc.nome || 'Processo').substring(0, 25), margin + 20, y, 8, false, rgb(0.5, 0.5, 0.5));
            drawText(`${usage?.toFixed(1) || 0}%`, width - margin - 40, y, 8, false, rgb(0.5, 0.5, 0.5));
            y -= 12;
        });

        y -= 10;

        y = drawText('Top 5 - Maior Consumo de RAM', margin, y, 12, true, rgb(0.173, 0.243, 0.314));
        y -= 15;

        drawText('#', margin, y, 8, true, rgb(0.204, 0.286, 0.369));
        drawText('Processo', margin + 30, y, 8, true, rgb(0.204, 0.286, 0.369));
        drawText('Uso RAM', width - margin - 40, y, 8, true, rgb(0.204, 0.286, 0.369));

        y -= 10;

        page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 0.5,
            color: rgb(0.173, 0.243, 0.314),
        });

        y -= 8;

        analise.topRAM.slice(0, 5).forEach((proc, index) => {
            const usage = Math.min(proc.ramPorcentagem, 100);
            drawText(String(index + 1) + '.', margin, y, 8, false, rgb(0.5, 0.5, 0.5));
            drawText((proc.nome || 'Processo').substring(0, 25), margin + 20, y, 8, false, rgb(0.5, 0.5, 0.5));
            drawText(`${usage?.toFixed(1) || 0}%`, width - margin - 40, y, 8, false, rgb(0.5, 0.5, 0.5));
            y -= 12;
        });

        y -= 15;

        const recomendacoes = gerarRecomendacoes(analise.alertas);
        if (recomendacoes?.length > 0) {
            y = drawText('Recomendações', margin, y, 12, true, rgb(0.173, 0.243, 0.314));
            y -= 15;

            recomendacoes.forEach((rec) => {
                y = drawText(`• ${rec}`, margin + 10, y, 9, false, rgb(0.5, 0.5, 0.5), maxWidth - 10);
                y -= 2;
            });
        }

        const footerY = 30;
        drawText('SolarData - Monitoramento de Servidores Sustentáveis', margin, footerY, 8, false, rgb(0.173, 0.243, 0.314));
        drawText('Relatório gerado automaticamente', width - margin - 120, footerY, 8, false, rgb(0.173, 0.243, 0.314));

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio_solardata_${Date.now()}.pdf"`);
        
        res.send(Buffer.from(pdfBytes));
        
        console.log('PDF gerado com sucesso usando pdf-lib!');

    } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        res.status(500).json({
            success: false,
            error: 'Falha ao gerar relatório PDF',
            details: err.message
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