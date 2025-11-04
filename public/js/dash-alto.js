const fkTipoUsuario = sessionStorage.getItem("FK_TIPO_USUARIO");
const listaMaquinas = document.getElementById('lista-maquinas');

const alertasMock = [
    { identificador: "Server-SP01", componenteNome: "CPU", captura: 87.5, estado: "ALERTA CRITICO", dtHora: "2025-10-28T21:05:17" },
    { identificador: "Server-SP02", componenteNome: "RAM", captura: 82.1, estado: "ALERTA PREVENTIVO", dtHora: "2025-10-28T21:03:12" },
    { identificador: "Server-SP03", componenteNome: "DISCO", captura: 91.3, estado: "ALERTA CRITICO", dtHora: "2025-10-28T21:01:45" },
    { identificador: "Server-SP01", componenteNome: "CPU", captura: 68.9, estado: "ALERTA PREVENTIVO", dtHora: "2025-10-28T21:00:32" }
];

const maquinasMock = [
    { HostName: "server-sp01", Identificador: "Server-SP01", IP: "192.168.0.10", DataCriacao: "2025-10-20T10:00:00", UltimoAlerta: "2025-10-28T21:05:17", CPU: 75, RAM: 82 },
    { HostName: "server-sp02", Identificador: "Server-SP02", IP: "192.168.0.11", DataCriacao: "2025-10-22T14:32:00", UltimoAlerta: "2025-10-28T21:03:12", CPU: 45, RAM: 70 },
    { HostName: "server-sp03", Identificador: "Server-SP03", IP: "192.168.0.12", DataCriacao: "2025-10-18T09:21:00", UltimoAlerta: "2025-10-28T21:01:45", CPU: 91, RAM: 76 },
    { HostName: "server-rj01", Identificador: "Server-RJ01", IP: "192.168.1.10", DataCriacao: "2025-10-15T08:00:00", UltimoAlerta: "2025-10-27T19:45:00", CPU: 20, RAM: 25 },
    { HostName: "server-rj02", Identificador: "Server-RJ02", IP: "192.168.1.11", DataCriacao: "2025-10-16T09:00:00", UltimoAlerta: "2025-10-28T18:30:00", CPU: 5, RAM: 8 } // Ociosa
];

function formatarData(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function atualizarKPIs(maquinas) {
    console.log("Atualizando KPIs com dados:", maquinas);
    
    let total = maquinas.length;
    let ativas = 0;
    let emAlerta = 0;
    let ociosas = 0;

    maquinas.forEach(maquina => {
        const cpu = maquina.CPU || 0;
        const ram = maquina.RAM || 0;
        
        if (cpu >= 10 || ram >= 10) {
            ativas++;
        }
        
        if (cpu > 80 || ram > 90 || cpu >= 70 || ram >= 80) {
            emAlerta++;
        }
        
        if (cpu < 10 && ram < 10) {
            ociosas++;
        }
    });

    animarContador('totalMaquinas', total);
    animarContador('maquinasAtivas', ativas);
    animarContador('maquinasAlerta', emAlerta);
    animarContador('maquinasOciosas', ociosas);
    
    atualizarPorcentagens(total, ativas, emAlerta, ociosas);
    
    console.log(`KPIs: Total=${total}, Ativas=${ativas}, Alerta=${emAlerta}, Ociosas=${ociosas}`);
}

function animarContador(elementId, valorFinal) {
    const elemento = document.getElementById(elementId);
    if (!elemento) return;
    
    let valorAtual = parseInt(elemento.textContent) || 0;
    const incremento = valorFinal > valorAtual ? 1 : -1;
    const velocidade = 50; // ms
    
    function atualizar() {
        valorAtual += incremento;
        elemento.textContent = valorAtual;
        
        if ((incremento > 0 && valorAtual < valorFinal) || 
            (incremento < 0 && valorAtual > valorFinal)) {
            setTimeout(atualizar, velocidade);
        } else {
            elemento.textContent = valorFinal;
        }
    }
    
    atualizar();
}

function atualizarPorcentagens(total, ativas, alerta, ociosas) {
    if (total > 0) {
        const percentAtivas = Math.round((ativas / total) * 100);
        const percentAlerta = Math.round((alerta / total) * 100);
        const percentOciosas = Math.round((ociosas / total) * 100);
        
        console.log(`Porcentagens: Ativas=${percentAtivas}%, Alerta=${percentAlerta}%, Ociosas=${percentOciosas}%`);
        
        // document.getElementById('percentualAtivas').textContent = `${percentAtivas}%`;
    }
}

function carregarMaquinas() {
    if (!listaMaquinas) {
        console.error("Elemento lista-maquinas não encontrado");
        return;
    }
    
    listaMaquinas.innerHTML = "";
    
    maquinasMock.forEach(m => {
        const usoCPU = `${m.CPU}%`, usoRAM = `${m.RAM}%`;
        let estado = "normal";
        if (m.CPU > 80 || m.RAM > 90) estado = "critico";
        else if (m.CPU >= 70 || m.RAM >= 80) estado = "preventivo";
        else if (m.CPU < 10 && m.RAM < 10) estado = "ocioso";

        const linha = document.createElement("div");
        linha.className = "line-notifica";
        linha.innerHTML = `
            <div class="box-id"><p>${m.HostName}</p></div>
            <div class="box-nome"><p>${m.Identificador}</p></div>
            <div class="box-uptime"><p>${m.IP}</p></div>
            <div class="box-uptime"><p>${formatarData(m.DataCriacao)}</p></div>
            <div class="box-ocorrencia"><p>${formatarData(m.UltimoAlerta)}</p></div>
            <div class="box-rack"><p>${usoCPU}</p></div>
            <div class="box-rack"><p>${usoRAM}</p></div>
            <div class="box-status"><p class="status ${estado}">${estado.toUpperCase()}</p></div>
        `;

        linha.addEventListener("click", () => {
            window.location.href = `dashboard.html?id=${encodeURIComponent(m.Identificador)}`;
        });

        listaMaquinas.appendChild(linha);
    });

    atualizarKPIs(maquinasMock);
}

function carregarMaquinas() {
    if (!listaMaquinas) {
        console.error("Elemento lista-maquinas não encontrado");
        return;
    }
    
    listaMaquinas.innerHTML = "";
    
    maquinasMock.forEach(m => {
        const usoCPU = `${m.CPU}%`, usoRAM = `${m.RAM}%`;
        let estado = "normal";
        if (m.CPU > 80 || m.RAM > 90) estado = "critico";
        else if (m.CPU >= 70 || m.RAM >= 80) estado = "preventivo";
        else if (m.CPU < 10 && m.RAM < 10) estado = "ocioso";

        const linha = document.createElement("div");
        linha.className = "line-notifica";
        linha.innerHTML = `
            <div class="box-id" data-title="${m.HostName}"><p>${m.HostName}</p></div>
            <div class="box-nome" data-title="${m.Identificador}"><p>${m.Identificador}</p></div>
            <div class="box-uptime" data-title="${m.IP}"><p>${m.IP}</p></div>
            <div class="box-uptime" data-title="${formatarData(m.DataCriacao)}"><p>${formatarData(m.DataCriacao)}</p></div>
            <div class="box-ocorrencia" data-title="${formatarData(m.UltimoAlerta)}"><p>${formatarData(m.UltimoAlerta)}</p></div>
            <div class="box-rack"><p>${usoCPU}</p></div>
            <div class="box-rack"><p>${usoRAM}</p></div>
            <div class="box-status"><p class="status ${estado}">${estado.toUpperCase()}</p></div>
        `;

        linha.addEventListener("click", () => {
            window.location.href = `dashboard.html?id=${encodeURIComponent(m.Identificador)}`;
        });

        listaMaquinas.appendChild(linha);
    });

    atualizarKPIs(maquinasMock);
}

function configurarPermissoesUsuario() {
    const btnCadastrarMaquina = document.getElementById("btnCadastrarMaquina");
    
    if (Number(fkTipoUsuario) !== 1 && btnCadastrarMaquina) {
        btnCadastrarMaquina.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Inicializando dashboard...");
    
    configurarPermissoesUsuario();
    
    const btnNotificacao = document.querySelector('.btn-notificacao');
    const modal = document.getElementById('modalNotificacoes');
    const btnFecharModal = document.getElementById('btnFecharModal');
    
    if (btnNotificacao && modal && btnFecharModal) {
        btnNotificacao.addEventListener("click", () => {
            console.log("Abrindo modal de notificações");
            modal.classList.add("active");
            carregarAlertas();
        });
        
        btnFecharModal.addEventListener("click", () => {
            modal.classList.remove("active");
        });
        
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });
    } else {
        console.warn("Elementos do modal de notificações não encontrados");
    }
    
    carregarMaquinas();
    
    console.log("Dashboard inicializado com sucesso!");
});

function iniciarAtualizacaoAutomatica() {
    setInterval(() => {
        console.log("Atualizando dados automaticamente...");
    }, 30000);
}

function filtrarPorStatus(status) {
    const linhas = document.querySelectorAll('.line-notifica');
    
    linhas.forEach(linha => {
        const statusElement = linha.querySelector('.status');
        if (statusElement) {
            const linhaStatus = statusElement.className.includes(status);
            linha.style.display = linhaStatus ? '' : 'none';
        }
    });
}

function pesquisarMaquinas(termo) {
    const linhas = document.querySelectorAll('.line-notifica');
    const termoLower = termo.toLowerCase();
    
    linhas.forEach(linha => {
        const textoLinha = linha.textContent.toLowerCase();
        linha.style.display = textoLinha.includes(termoLower) ? '' : 'none';
    });
}

// Iniciar atualização automática (descomente se quiser)
// iniciarAtualizacaoAutomatica();