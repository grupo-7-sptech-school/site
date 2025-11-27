
const params = new URLSearchParams(window.location.search);
const idMaquina = params.get("id");

if (!idMaquina || idMaquina.includes('${')) {
    console.error("ID inválido na URL:", idMaquina);
    document.body.insertAdjacentHTML('afterbegin',
        '<div style="padding:12px;background:#fee;border:1px solid #f99;color:#900;">Erro: link inválido. Abra o dashboard pela lista de máquinas.</div>');
    throw new Error('ID inválido na URL');
}

let hostNameGlobal = null;


async function carregarAlertasSemana() {
    if (!hostNameGlobal) return;

    const resp = await fetch(`/grafico/alertas-semana/${hostNameGlobal}`);
    const dados = await resp.json();

    const kpi = document.getElementById("kpiAlertasSemana");

    if (dados && dados.total !== undefined) {
        kpi.innerText = dados.total;
    } else {
        kpi.innerText = "--";
    }
}



async function carregarRam7dias() {

    if (!idMaquina) {
        console.error("ID da máquina não foi informado na URL.");
        return;
    }

    hostNameGlobal = idMaquina; 

    console.log(`Buscando dados para o HostName: ${hostNameGlobal}`);


    try {
        const resposta = await fetch(`/grafico/ram-7dias/${encodeURIComponent(hostNameGlobal)}`);

        if (!resposta.ok) {
            console.error(`Erro na requisição: ${resposta.status} - ${resposta.statusText}`);
            if(resposta.status === 404) {
                alert("Erro 404: A rota '/grafico/ram-7dias' não foi encontrada. Verifique o app.js.");
            }
            return;
        }

        const dados = await resposta.json();
        console.log("Dados recebidos do gráfico:", dados);

        if (!dados || dados.length === 0) {
            console.warn("Nenhum dado encontrado para esta máquina.");
            document.getElementById("kpiMedia").innerText = "0%";
            document.getElementById("kpiPico").innerText = "0%";
            document.getElementById("kpiHorasCriticas").innerText = "0h";
            return;
        }


        var labels = [];
        var valores = [];
        var coresPontos = [];
        var tamanhosPontos = [];
        var limiteCritico = 90;
        var soma = 0;
        var maior = 0;
        var horasCriticas = 0;

        for (var i = 0; i < dados.length; i++) {
            var hora = dados[i].hora; 
            var valor = parseFloat(dados[i].ramPercent);

            labels.push(hora);
            valores.push(valor);

            if (valor >= 90) {
                coresPontos.push("red");
                tamanhosPontos.push(6);
            } else {
                coresPontos.push("#18B187"); 
                tamanhosPontos.push(3);
            }

            soma += valor;
            if (valor > maior) maior = valor;
            if (valor >= 90) horasCriticas++; 
        }

        var media = soma / dados.length;
        document.getElementById("kpiMedia").innerText = media.toFixed(1) + "%";
        document.getElementById("kpiPico").innerText = maior.toFixed(1) + "%";
        document.getElementById("kpiHorasCriticas").innerText = horasCriticas ;

        montarGrafico(labels, valores, coresPontos, tamanhosPontos, 90);

        carregarGraficoPizzaRAM(hostNameGlobal);

        carregarAlertasSemana();

    } catch (error) {
        console.error("Erro interno ao carregar gráfico:", error);
    }
}


function carregarGraficoPizzaRAM(hostName) {
    if(!hostName){
        console.log("Não foi possível encontrar o hostname")
        return;
    }

    fetch(`/grafico/top3-maquinas-ram/${encodeURIComponent(hostName)}`)
        .then(r => r.json())
        .then(data => {
            var nomes = []; 
            var consumos = [];

            for (var i = 0; i < data.length; i++) {
                nomes.push(data[i].nomeMaquina || data[i].idMaquina);
                consumos.push(data[i].consumoMedio);
            }

            var ctx = document.getElementById('graficoPizzaRAM').getContext('2d');

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: nomes,
                    datasets: [{
                        data: consumos,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                }
            });
        })
        .catch(error => console.error("Erro:", error));
}



function montarGrafico(labels, valores, coresPontos, tamanhosPontos, limiteCritico) {
    const ctx = document.getElementById('graficoRam7dias').getContext('2d');

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "RAM (%)",
                data: valores,
                borderColor: "rgba(255, 150, 200, 0.8)",
                backgroundColor: "rgba(255, 150, 200, 0.2)",
                borderWidth: 2,
                pointBackgroundColor: coresPontos,
                pointRadius: tamanhosPontos,
                tension: 0.25,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                annotation: {
                    annotations: {
                        linhaCritica: {
                            type: "line",
                            yMin: limiteCritico,
                            yMax: limiteCritico,
                            borderColor: "red",
                            borderWidth: 2,
                            borderDash: [6, 6],
                            label: {
                                display: true,
                                content: "Crítico (90%)",
                                position: "end",
                                color: "red",
                                backgroundColor: "white"
                            }
                        }
                    }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: value => value + "%"
                    }
                },
                x: {
                    ticks: { autoSkip: true, maxRotation: 45 }
                }
            }
        }
    });
}
