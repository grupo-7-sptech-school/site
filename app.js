var ambiente_processo = 'producao';
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");

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
            analise: analise.relatorio,
            estatisticas: analise.estatisticas,
            alertas: analise.alertas,
            top_processos: analise.top_processos,
            provedor_ia: "Sistema de Análise Local",
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





function gerarAnaliseLocalSimples(processos) {  // ativo é a lista com todos os processos ATIVOS rsrs
    var ativos = [];
    for (var i = 0; i < processos.length; i++) {
        if (processos[i].nome != 'Idle') { // validação se o proecsso é ativo ou n
            ativos.push(processos[i]);
        }
    }

    var totalCPU = soma(ativos, 'cpuPorcentagem');
    var totalRAM = soma(ativos, 'ramPorcentagem'); 
    var mediaCPU = 0;
    var mediaRAM = 0;

    if (ativos.length > 0) {
        mediaCPU = totalCPU / ativos.length;
        mediaRAM = totalRAM / ativos.length;
    }


    var topCPU = ordenar(ativos, 'cpuPorcentagem').slice(0, 5);  // ordeno os 5 maiores
    var topRAM = ordenar(ativos, 'ramPorcentagem').slice(0, 5);  // ordeno os 5 maiores

    var criticos = [];
    for (var i = 0; i < ativos.length; i++) {
        if (ativos[i].cpuPorcentagem > 10 || ativos[i].ramPorcentagem > 5) {  // crio a lista de processos criticos, aqueles que tem maior
            criticos.push(ativos[i]);                                        //  consumo ou de ram ou de cpu
        }
    }

    var categorias = {
        dev: filtrar(ativos, ['code', 'java', 'node', 'python']),      // defino o que é sistema, dev e por ai vai
        navegador: filtrar(ativos, ['chrome', 'firefox', 'edge']),
        comunicacao: filtrar(ativos, ['discord', 'whatsapp', 'teams']),
        sistema: filtrar(ativos, ['system', 'svchost', 'windows']),
        outros: ativos
    };

    var alertas = [];
    if (totalCPU > 80) alertas.push('CPU acima do limite recomendado.');    // alertas... "Ah tá muito alto"
    if (totalRAM > 85) alertas.push('RAM acima do limite recomendado.');
    if (criticos.length > 5) alertas.push('Número elevado de processos críticos.');

    var relatorio = '';
    relatorio += 'RELATÓRIO DO SERVIDOR\n\n';
    relatorio += 'GERAL\n';
    relatorio += 'Processos totais: ' + processos.length + '\n';
    relatorio += 'Processos ativos: ' + ativos.length + '\n';
    relatorio += 'Uso total de CPU: ' + totalCPU.toFixed(1) + '%\n';
    relatorio += 'Soma total de RAM: ' + totalRAM.toFixed(1) + '%\n';
    relatorio += 'Média de CPU por processo: ' + mediaCPU.toFixed(1) + '%\n';
    relatorio += 'Média de RAM por processo: ' + mediaRAM.toFixed(1) + '%\n\n';

    relatorio += 'ALERTAS\n';
    if (alertas.length > 0) {
        for (var i = 0; i < alertas.length; i++) {   // puxo os alertas definidos acima
            relatorio += alertas[i] + '\n';
        }
    } else {
        relatorio += 'Nenhum alerta.\n';
    }

    relatorio += '\nCATEGORIAS\n';
    relatorio += 'Desenvolvimento: ' + categorias.dev.length + ' processos\n';    // exibo o que defini acima
    relatorio += 'Navegadores: ' + categorias.navegador.length + ' processos\n';
    relatorio += 'Comunicação: ' + categorias.comunicacao.length + ' processos\n';
    relatorio += 'Sistema: ' + categorias.sistema.length + ' processos\n';
    relatorio += 'Outros: ' + categorias.outros.length + ' processos\n\n';

    relatorio += 'TOP 5 CPU\n';
    for (var i = 0; i < topCPU.length; i++) {
        relatorio += (i + 1) + '. ' + topCPU[i].nome + ' - ' + topCPU[i].cpuPorcentagem.toFixed(1) + '%\n'; // exibo o que defini acima
    }

    relatorio += '\nTOP 5 RAM\n';
    for (var i = 0; i < topRAM.length; i++) {
        relatorio += (i + 1) + '. ' + topRAM[i].nome + ' - ' + topRAM[i].ramPorcentagem.toFixed(1) + '%\n'; // exibo o que defini acima
    }

    var status = saude(totalCPU, totalRAM, criticos.length);   // ve como o sistema tá, critico e tals

    relatorio += '\nRESUMO\n';
    if (status == 'Crítico') {  // exibo o resumo com base no status
        relatorio += 'O servidor apresenta alto consumo de recursos e vários processos críticos em execução.\n';
        relatorio += 'Recomenda-se verificar aplicações de desenvolvimento e navegadores que utilizam mais recursos.\n';
    } else if (status == 'Atenção') {
        relatorio += 'O servidor está operando normalmente, mas há sinais de sobrecarga em alguns processos.\n';
    } else {
        relatorio += 'O servidor está operando de forma estável e eficiente.\n';
    }

    relatorio += '\nSTATUS GERAL: ' + status + '\n';
    relatorio += 'Gerado em: ' + new Date().toLocaleString('pt-BR') + '\n';   // data de quando foi gerado e coloco em PT-BR

    return { relatorio: relatorio, alertas: alertas, topCPU: topCPU, topRAM: topRAM, criticos: criticos }; // jogo tudo no return
}


function soma(arr, campo) {
    var total = 0;
    for (var i = 0; i < arr.length; i++) {  // função que soma a RAM total e a CPU
        total += arr[i][campo] || 0;
    }
    return total;
}

function ordenar(arr, campo) {
    return arr.sort(function (a, b) {  //Função pronta que ordena facinho
        return b[campo] - a[campo];
    });
}


function filtrar(arr, termos) {
    var resultado = [];
    for (var i = 0; i < arr.length; i++) {  // Filtra o que é cada tipo, dev, sistema...
        var nome = arr[i].nome.toLowerCase();
        for (var j = 0; j < termos.length; j++) {
            if (nome.indexOf(termos[j]) !== -1) {
                resultado.push(arr[i]);
                break;
            }
        }
    }
    return resultado;
}

function saude(cpu, ram, crit) {   // ve o estado
    if (cpu > 80 || ram > 85 || crit > 5) return 'Crítico';
    if (cpu > 60 || ram > 70 || crit > 2) return 'Atenção';
    return 'Normal';
}


app.listen(PORTA_APP, function () {
    console.log(`
   SOLARDATA - MONITORAMENTO DE SERVIDORES VERDES
   http://${HOST_APP}:${PORTA_APP}

   Acesse: http://localhost:${PORTA_APP}
    `);
});