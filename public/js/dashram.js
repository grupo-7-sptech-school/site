async function carregarAlertasSemana(id) {
    const resp = await fetch(`/grafico/alertas-semana/${id}`);
    const dados = await resp.json();

    if (dados && dados.total !== undefined) {
        document.getElementById("kpiAlertasSemana").innerText = dados.total;
    } else {
        document.getElementById("kpiAlertasSemana").innerText = "--";
    }
}

async function carregarRam7dias() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const resposta = await fetch(`/grafico/ram-7dias/${id}`);
    const dados = await resposta.json();

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
        var valor = dados[i].ramPercent;

        labels.push(hora);
        valores.push(valor);

        if (valor >= 90) {
            coresPontos.push("red");
            tamanhosPontos.push(6);
        } else {
            coresPontos.push("rgba(255, 150, 200, 0.8)");
            tamanhosPontos.push(3);
        }

        soma += valor;
        if (valor > maior) maior = valor;
        if (valor >= limiteCritico) horasCriticas++;
    }

    if (dados.length > 0) {
        var media = soma / dados.length;

        document.getElementById("kpiMedia").innerText = media.toFixed(1) + "%";
        document.getElementById("kpiPico").innerText = maior.toFixed(1) + "%";
        document.getElementById("kpiHorasCriticas").innerText = horasCriticas + "h";
    } else {
        document.getElementById("kpiMedia").innerText = "--";
        document.getElementById("kpiPico").innerText = "--";
        document.getElementById("kpiHorasCriticas").innerText = "--";
    }

    montarGrafico(labels, valores, coresPontos, tamanhosPontos, 90);
    carregarAlertasSemana(id);
}

function carregarGraficoPizzaRAM() {
    fetch('/api/top-ram-machines')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            var nomes = [];
            var consumos = [];

            for (var i = 0; i < data.length; i++) {
                nomes.push(data[i].nome);
                consumos.push(data[i].consumo);
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
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Top 3 Máquinas por Consumo de RAM'
                        }
                    }
                }
            });
        })
        .catch(function (error) {
            console.error('Erro ao carregar gráfico de pizza:', error);
        });
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
