var database = require("../database/config");

function gerarFiltro(periodo) {
    switch (periodo) {
        case "dia":
            return "ce.data >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
        case "semana":
            return "ce.data >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
        case "mes":
            return "ce.data >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
        case "ano":
            return "ce.data >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
        default:
            return "DATE(ce.data) = CURDATE()";
    }
}

function FiltroGrafico1(periodo) {
    switch (periodo) {
        case "dia":
            return "HOUR(ce.data) AS periodo";
        case "semana":
            return "date_format(ce.data, '%Y-%m-%d') AS periodo";
        case "mes":
            return "MONTH(ce.data) AS periodo";
        case "ano":
            return "YEAR(ce.data) AS periodo";
        default:
            return "HOUR(ce.data) AS periodo";
    }
}

function FiltroGrafico2(periodo) {
    switch (periodo) {
        case "dia":
            return "HOUR(ce.data)";
        case "semana":
            return "date_format(ce.data, '%Y-%m-%d')";
        case "mes":
            return "MONTH(ce.data)";
        case "ano":
            return "YEAR(ce.data)";
        default:
            return "HOUR(ce.data)";
    }
}

function FiltroSemana(periodo) {
    switch (periodo) {
        case "dia":
            return "";
        case "semana":
            return "AND ce.data >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        case "mes":
            return "";
        case "ano":
            return "";
        default:
            return "";
    }
}


function FiltroMaquina(maquina) {
    switch (maquina) {
        case "m1":
            return "1598329989";
        case "m2":
            return "1598329990";
        // case "m3":
        //      return "1598329992";
        // case "m4":
        //      return "1598329991";
        // case "m5":
        //      return "1598329995";
        default:
            return "1598329989";
    }
}


function obterMediaMensal(idEmpresa, periodo) {

    let filtroTempo1 = FiltroGrafico1(periodo);
    let filtroTempo2 = FiltroGrafico2(periodo);
    let limiteSemana = FiltroSemana(periodo);

    var instrucao = `
         SELECT ${filtroTempo1},
        ROUND(SUM((ce.potencia * ce.intervalo_medicao) / 3600), 2) AS consumo
        FROM ConsumoEnergia ce
        JOIN Maquina m ON ce.fkMaquina = m.hostName
        WHERE m.fkEmpresa = ${idEmpresa}
        ${limiteSemana}
        GROUP BY ${filtroTempo2}
        ORDER BY periodo;
    `;
    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}


function MaiorConsumo(idEmpresa, periodo) {

    let filtroTempo = gerarFiltro(periodo);
    var instrucao = `
    SELECT 
    m.identificador,
    m.hostName,
    ROUND(SUM((ce.potencia * ce.intervalo_medicao) / 3600), 2) AS total_consumo_wh,
    DATE_FORMAT(MAX(ce.data), '%Y-%m-%d %H:%i') AS ultima_captura
FROM ConsumoEnergia ce
JOIN Maquina m
    ON ce.fkMaquina = m.hostName
WHERE m.fkEmpresa = ${idEmpresa}
  AND ${filtroTempo}
GROUP BY 
    m.hostName,
    m.identificador
ORDER BY total_consumo_wh DESC
LIMIT 5;
    `;
    
    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

function emissaoPoluentes(idEmpresa) {
    var instrucao = `
        SELECT 
            MONTH(ce.timestamp) AS mes,
            ROUND(AVG(ce.watts), 2) AS media_watts
        FROM ConsumoEnergia ce
        JOIN Maquina m 
            ON ce.fkMaquina = m.hostName
        WHERE m.fkEmpresa = ${idEmpresa}
        GROUP BY MONTH(ce.timestamp)
        ORDER BY mes;
    `;
    
    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

function consumoAtual(idEmpresa, maquina) {
    let maquinaSelecionada = FiltroMaquina(maquina);

    var instrucao = `
    SELECT ce.potencia AS potencia
    FROM ConsumoEnergia ce
    JOIN Maquina m ON ce.fkMaquina = m.hostName
    WHERE m.fkEmpresa = ${idEmpresa}
    AND m.hostName = '${maquinaSelecionada}'
    ORDER BY ce.data DESC
    LIMIT 1;
    `;
    
    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

            // Dados KPIs

function ConsumoTotal(idEmpresa, periodo) {

  let filtroTempo = gerarFiltro(periodo);

    var instrucao = `
        SELECT 
            ROUND(SUM((ce.potencia * ce.intervalo_medicao) / 3600), 2) AS total_consumo_wh
        FROM ConsumoEnergia ce
        JOIN Maquina m
            ON ce.fkMaquina = m.hostName
        WHERE m.fkEmpresa = ${idEmpresa}
        AND ${filtroTempo}
        `;
    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}
function ReducaoCO2(idEmpresa) {

    var instrucao = `
   SELECT 
    m.identificador,
    m.hostName,
    ROUND(SUM(ce.watts) / 1000, 2) AS kwh_dia
    FROM ConsumoEnergia ce
    JOIN Maquina m
    ON ce.fkMaquina = m.hostName
    WHERE m.fkEmpresa = ${idEmpresa}
    AND DATE(ce.timestamp) = CURDATE()
    GROUP BY m.identificador, m.hostName
    ORDER BY kwh_dia DESC
    LIMIT 1;
    `;
    
    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

function maquinaMaiorConsumo(idEmpresa, periodo) {

    let filtroTempo = gerarFiltro(periodo);
    var instrucao = `
    SELECT 
        m.identificador,
        m.hostName,
        MAX(ce.potencia) AS potencia_maxima
    FROM ConsumoEnergia ce
    JOIN Maquina m
        ON ce.fkMaquina = m.hostName
    WHERE m.fkEmpresa = ${idEmpresa}
    AND ${filtroTempo}
    GROUP BY m.identificador, m.hostName
    ORDER BY potencia_maxima DESC
    LIMIT 1;
    `;

    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

function NomeMaquinaConsumo(idEmpresa, periodo) {

    let filtroTempo = gerarFiltro(periodo);
    var instrucao = `
    SELECT 
        m.identificador,
        m.hostName,
        ROUND(SUM((ce.potencia * ce.intervalo_medicao) / 3600), 2) AS total_consumo_wh
    FROM ConsumoEnergia ce
    JOIN Maquina m
        ON ce.fkMaquina = m.hostName
    WHERE m.fkEmpresa = ${idEmpresa}
    AND ${filtroTempo}       -- dia, semana, mês ou ano
    GROUP BY m.hostName
    ORDER BY total_consumo_wh DESC
    LIMIT 1;
    `;
    
    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

    function buscarFiltrado(idEmpresa, periodo){

    let filtroTempo = gerarFiltro(periodo);
    const instrucao = `
    SELECT 
        m.identificador,
        m.hostName,
        ce.data,
        ce.potencia,
        ce.intervalo_medicao,
        ROUND((ce.potencia * ce.intervalo_medicao) / 3600, 2) AS consumo_wh
    FROM ConsumoEnergia ce
    JOIN Maquina m
        ON ce.fkMaquina = m.hostName
    WHERE m.fkEmpresa = ${idEmpresa}
    AND ${filtroTempo}
    ORDER BY ce.idConsumo DESC
    LIMIT 1;
    `;

    console.log("Executando:", instrucao);
    return database.executar(instrucao);
}

module.exports = { 
    // Gráficos
    obterMediaMensal, 
    MaiorConsumo,
    emissaoPoluentes,
    consumoAtual,
    
    //KPIs
    ConsumoTotal,
    ReducaoCO2,
    maquinaMaiorConsumo,
    NomeMaquinaConsumo,
    buscarFiltrado
};
