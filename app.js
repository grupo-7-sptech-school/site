var ambiente_processo = 'desenvolvimento';
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");

var PORTA_APP = process.env.APP_PORT || 3333;
var HOST_APP = process.env.APP_HOST || 'localhost';

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
        const usuarioModel = require("./src/models/usuarioModel");
        const processos = await usuarioModel.puxarProcesso();

        if (!processos || processos.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum processo encontrado"
            });
        }

        console.log(`${processos.length} processos encontrados`);

        const analise = gerarAnaliseLocalDetalhada(processos);

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

























// gerado por IA


function gerarAnaliseLocalDetalhada(processos) {
    console.log("Gerando análise detalhada...");
    
    const processosAtivos = processos.filter(p => p.nome !== 'Idle');
    
    const processosCPU = [...processosAtivos].sort((a, b) => b.cpuPorcentagem - a.cpuPorcentagem);
    const processosRAM = [...processosAtivos].sort((a, b) => b.ramPorcentagem - a.ramPorcentagem);
    
    const totalCPU = processosAtivos.reduce((sum, p) => sum + (p.cpuPorcentagem || 0), 0);
    
    const ramCalculada = calcularRamRealista(processosAtivos);
    const totalRAM = ramCalculada.totalRAM;
    const ramProcessos = ramCalculada.ramProcessos;
    
    const mediaCPU = totalCPU / processosAtivos.length;
    const mediaRAM = ramProcessos / processosAtivos.length;
    
    const processosCriticosCPU = processosAtivos.filter(p => p.cpuPorcentagem > 10);
    const processosCriticosRAM = processosAtivos.filter(p => p.ramPorcentagem > 5); 
    const processosCriticos = [...new Set([...processosCriticosCPU, ...processosCriticosRAM])];
    
    const categorias = {
        desenvolvimento: processosAtivos.filter(p => 
            p.nome.toLowerCase().includes('code') || 
            p.nome.toLowerCase().includes('java') ||
            p.nome.toLowerCase().includes('node') ||
            p.nome.toLowerCase().includes('python')
        ),
        navegador: processosAtivos.filter(p => 
            p.nome.toLowerCase().includes('chrome') ||
            p.nome.toLowerCase().includes('firefox') ||
            p.nome.toLowerCase().includes('edge') ||
            p.nome.toLowerCase().includes('browser')
        ),
        comunicacao: processosAtivos.filter(p => 
            p.nome.toLowerCase().includes('discord') ||
            p.nome.toLowerCase().includes('whatsapp') ||
            p.nome.toLowerCase().includes('slack') ||
            p.nome.toLowerCase().includes('teams')
        ),
        sistema: processosAtivos.filter(p => 
            p.nome.toLowerCase().includes('system') ||
            p.nome.toLowerCase().includes('svchost') ||
            p.nome.toLowerCase().includes('windows') ||
            p.nome.toLowerCase().includes('explorer')
        ),
        banco_dados: processosAtivos.filter(p => 
            p.nome.toLowerCase().includes('mysql') ||
            p.nome.toLowerCase().includes('sql') ||
            p.nome.toLowerCase().includes('mongo') ||
            p.nome.toLowerCase().includes('postgres')
        ),
        outros: processosAtivos.filter(p => 
            !p.nome.toLowerCase().includes('code') &&
            !p.nome.toLowerCase().includes('java') &&
            !p.nome.toLowerCase().includes('chrome') &&
            !p.nome.toLowerCase().includes('discord') &&
            !p.nome.toLowerCase().includes('system') &&
            !p.nome.toLowerCase().includes('mysql')
        )
    };
    
    const consumoPorCategoria = {};
    Object.keys(categorias).forEach(categoria => {
        const processosCategoria = categorias[categoria];
        consumoPorCategoria[categoria] = {
            cpu: processosCategoria.reduce((sum, p) => sum + p.cpuPorcentagem, 0),
            ram: calcularRamCategoria(processosCategoria),
            quantidade: processosCategoria.length
        };
    });
    
    const alertas = gerarAlertasInteligentes(processosAtivos, totalCPU, totalRAM, processosCriticos);
    
    const recomendacoes = gerarRecomendacoesDetalhadas(processosAtivos, categorias, consumoPorCategoria, totalRAM);
    
    const relatorio = `🔍 **RELATÓRIO DETALHADO DO SERVIDOR**

📊 **ESTATÍSTICAS GERAIS**
• Total de processos: ${processos.length} (${processosAtivos.length} ativos)
• Uso total de CPU: ${totalCPU.toFixed(2)}%
• Uso estimado de RAM: ${totalRAM.toFixed(2)}%  
• Média por processo - CPU: ${mediaCPU.toFixed(2)}%
• Média por processo - RAM: ${mediaRAM.toFixed(2)}%
• Processos críticos identificados: ${processosCriticos.length}

📈 **DETALHES DE MEMÓRIA**
• RAM utilizada por processos: ${ramProcessos.toFixed(2)}%
• RAM do sistema/cache: ${(totalRAM - ramProcessos).toFixed(2)}%
• Eficiência de memória: ${calcularEficienciaMemoria(totalRAM)}

🚨 **ALERTAS DO SISTEMA**
${alertas.length > 0 ? alertas.join('\n') : 'Nenhum alerta crítico detectado'}

📂 **DISTRIBUIÇÃO POR CATEGORIA**
${Object.entries(consumoPorCategoria).map(([categoria, dados]) => {
    const emoji = {
        desenvolvimento: '💻',
        navegador: '🌐',
        comunicacao: '💬',
        sistema: '⚙️',
        banco_dados: '🗄️',
        outros: '📦'
    }[categoria];
    return `${emoji} ${categoria.toUpperCase()}: ${dados.quantidade} processos (CPU: ${dados.cpu.toFixed(1)}%, RAM: ${dados.ram.toFixed(1)}%)`;
}).join('\n')}

 **TOP 5 - CONSUMO DE CPU**
${processosCPU.slice(0, 5).map((p, i) => 
    `${i+1}. ${p.nome} - ${p.cpuPorcentagem.toFixed(2)}% CPU }`
).join('\n')}

 **TOP 5 - CONSUMO DE MEMÓRIA**
${processosRAM.slice(0, 5).map((p, i) => 
    `${i+1}. ${p.nome} - ${p.ramPorcentagem.toFixed(2)}% RAM }`
).join('\n')}

 **PROCESSOS CRÍTICOS IDENTIFICADOS**
${processosCriticos.slice(0, 5).map(p => 
    `• ${p.nome} (CPU: ${p.cpuPorcentagem.toFixed(1)}%, RAM: ${p.ramPorcentagem.toFixed(1)}%)`
).join('\n') || '• Nenhum processo crítico identificado'}

 **RECOMENDAÇÕES DETALHADAS**
${recomendacoes.join('\n')}

 **DESEMPENHO DO SISTEMA**: ${calcularSaudeSistema(totalCPU, totalRAM, processosCriticos.length)}
 **ANÁLISE GERADA**: ${new Date().toLocaleString('pt-BR')}
`;
    return {
        relatorio: relatorio,
        estatisticas: {
            totalProcessos: processos.length,
            processosAtivos: processosAtivos.length,
            usoTotalCPU: totalCPU,
            usoTotalRAM: totalRAM,
            ramProcessos: ramProcessos,
            ramSistema: totalRAM - ramProcessos,
            processosCriticos: processosCriticos.length,
            categorias: consumoPorCategoria
        },
        alertas: alertas,
        top_processos: {
            cpu: processosCPU.slice(0, 5),
            ram: processosRAM.slice(0, 5),
            criticos: processosCriticos.slice(0, 5)
        }
    };
}

function calcularRamRealista(processos) {
    let ramProcessos = 0;
    let totalRAM = 0;
    
    const processosSignificativos = processos.filter(p => p.ramPorcentagem > 0.1);
    ramProcessos = processosSignificativos.reduce((sum, p) => sum + p.ramPorcentagem, 0);
    
    const fatorCorrecao = 0.7; 
    ramProcessos = ramProcessos * fatorCorrecao;
    
    const overheadSistema = 15;
    totalRAM = Math.min(ramProcessos + overheadSistema, 100);
    
    if (totalRAM > 95) {
        const processosTop = processos.slice(0, 10); 
        const ramTop = processosTop.reduce((sum, p) => sum + p.ramPorcentagem, 0);
        totalRAM = Math.min(ramTop + 25, 100); 
    }
    
    return {
        totalRAM: Math.min(totalRAM, 100), 
        ramProcessos: ramProcessos
    };
}

function calcularRamCategoria(processosCategoria) {
    if (processosCategoria.length === 0) return 0;
    
    const processosOrdenados = [...processosCategoria].sort((a, b) => b.ramPorcentagem - a.ramPorcentagem);
    const topProcessos = processosOrdenados.slice(0, Math.min(3, processosOrdenados.length));
    
    return topProcessos.reduce((sum, p) => sum + p.ramPorcentagem, 0) * 0.8; 
}

function calcularEficienciaMemoria(ramTotal) {
    if (ramTotal < 40) return "🟢 Excelente";
    if (ramTotal < 70) return "🟡 Adequada";
    if (ramTotal < 85) return "🟠 Moderada";
    return "🔴 Baixa";
}

function gerarAlertasInteligentes(processos, totalCPU, totalRAM, processosCriticos) {
    const alertas = [];
    
    if (totalCPU > 80) {
        alertas.push("🚨 **ALTA UTILIZAÇÃO DE CPU** - Sistema sob estresse");
    } else if (totalCPU > 60) {
        alertas.push("⚠️ **CPU em uso moderado-alto** - Monitorar tendência");
    }
    
    if (totalRAM > 85) {
        alertas.push("🚨 **ALTA UTILIZAÇÃO DE MEMÓRIA** - Risco de lentidão");
    } else if (totalRAM > 70) {
        alertas.push("⚠️ **Memória em uso elevado** - Considerar otimização");
    }
    
    if (processosCriticos.length > 5) {
        alertas.push("🚨 **MÚLTIPLOS PROCESSOS CRÍTICOS** - Verificar urgente");
    } else if (processosCriticos.length > 2) {
        alertas.push("⚠️ **Processos com alto consumo identificados**");
    }
    
    const muitosJava = processos.filter(p => p.nome.toLowerCase().includes('java')).length;
    if (muitosJava > 2) {
        alertas.push("☕ **Múltiplos processos Java** - Verificar configurações de heap");
    }
    
    const muitosChrome = processos.filter(p => p.nome.toLowerCase().includes('chrome')).length;
    if (muitosChrome > 3) {
        alertas.push("🌐 **Múltiplas instâncias Chrome** - Consolidar abas para economizar RAM");
    }
    
    if (totalRAM > 95) {
        alertas.push("📊 **Possível sobreposição de memória** - Verificar métricas do sistema");
    }
    
    return alertas;
}

function gerarRecomendacoesDetalhadas(processos, categorias, consumoPorCategoria, totalRAM) {
    const recomendacoes = [];
    
    if (totalRAM > 80) {
        recomendacoes.push("• **Liberar memória urgentemente**: Fechar aplicações não essenciais");
        recomendacoes.push("• **Otimizar processos Java**: Ajustar parâmetros -Xmx e -Xms");
        recomendacoes.push("• **Reduzir abas do navegador**: Principalmente Chrome/Firefox");
    } else if (totalRAM > 60) {
        recomendacoes.push("• **Monitorar consumo de memória**: Identificar vazamentos");
        recomendacoes.push("• **Considerar upgrade de RAM**: Se consumo consistently alto");
    }
    
    if (consumoPorCategoria.navegador && consumoPorCategoria.navegador.ram > 15) {
        recomendacoes.push("• **Otimizar navegadores**: Usar extensões de gerenciamento de memória");
    }
    
    if (consumoPorCategoria.desenvolvimento && consumoPorCategoria.desenvolvimento.ram > 20) {
        recomendacoes.push("• **Configurar IDEs**: Limitar memória alocada para ferramentas de desenvolvimento");
    }
    
    if (categorias.java && categorias.java.length > 0) {
        recomendacoes.push("• **Revisar JVMs**: Configurar -XX:+UseG1GC para melhor gerenciamento");
    }
    
    recomendacoes.push("• **Implementar monitoramento contínuo** de recursos");
    recomendacoes.push("• **Agendar limpezas periódicas** de cache e processos");
    recomendacoes.push("• **Documentar padrões de uso** para planejamento de capacidade");
    
    return recomendacoes;
}

function calcularSaudeSistema(cpu, ram, criticos) {
    if (cpu > 80 || ram > 85 || criticos > 5) {
        return "🔴 CRÍTICO";
    } else if (cpu > 60 || ram > 70 || criticos > 2) {
        return "🟡 ATENÇÃO";
    } else {
        return "🟢 OK";
    }
}

app.listen(PORTA_APP, function () {
    console.log(`
   SOLARDATA - MONITORAMENTO DE SERVIDORES VERDES
   http://${HOST_APP}:${PORTA_APP}

   Acesse: http://localhost:${PORTA_APP}
    `);
});