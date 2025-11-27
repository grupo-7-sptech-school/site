var database = require("../database/config");

function converterPeriodo(periodo) {
    if (periodo === "1 DAY" || periodo === "hoje") return 1;
    if (periodo === "7 DAY" || periodo === "semana") return 7;
    if (periodo === "15 DAY" || periodo === "2semanas") return 15;
    if (periodo === "30 DAY" || periodo === "mes") return 30;
    
    return 1;
}

function kpis(hostName, periodo) {
    var dias = converterPeriodo(periodo);

    var instrucao = `
        SELECT 
            (SELECT COUNT(*) 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.dtHora >= NOW() - INTERVAL ${dias} DAY) AS total,

            (SELECT COUNT(*) 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.estado = 'CRITICO'
             AND a.dtHora >= NOW() - INTERVAL ${dias} DAY) AS criticos,

            (SELECT COUNT(*) 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.estado = 'ALERTA'
             AND a.dtHora >= NOW() - INTERVAL ${dias} DAY) AS preventivos,

            (SELECT c.nome 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.dtHora >= NOW() - INTERVAL ${dias} DAY
             GROUP BY c.nome
             ORDER BY COUNT(*) DESC
             LIMIT 1) AS componenteCritico;
    `;

    return database.executar(instrucao);
}

function graficoLinha(hostName, periodo, componente = null) {
    var dias = converterPeriodo(periodo);
    
    var componenteFiltro = componente ? `AND c.nome = '${componente}'` : '';

    var instrucao = `
        SELECT 
            DATE_FORMAT(a.dtHora, '%d/%m %H:%i') AS momento,
            a.estado,
            c.nome AS componente
        FROM Alerta a
        JOIN Componente c ON a.fkComponente = c.idComponente
        WHERE c.fkMaquina = ${hostName}
        AND a.dtHora >= NOW() - INTERVAL ${dias} DAY
        ${componenteFiltro}
        ORDER BY a.dtHora ASC;
    `;

    return database.executar(instrucao);
}

function graficoComponentes(hostName, periodo) {
    var dias = converterPeriodo(periodo);

    var instrucao = `
        SELECT 
            c.nome AS componente,
            COUNT(*) AS total
        FROM Alerta a
        JOIN Componente c ON a.fkComponente = c.idComponente
        WHERE c.fkMaquina = ${hostName}
        AND a.dtHora >= NOW() - INTERVAL ${dias} DAY
        GROUP BY c.nome
        ORDER BY total DESC;
    `;

    return database.executar(instrucao);
}

function graficoTipos(hostName, periodo, componente = null) {
    var dias = converterPeriodo(periodo);
    
    var componenteFiltro = componente ? `AND c.nome = '${componente}'` : '';

    var instrucao = `
        SELECT 
            a.estado,
            COUNT(*) AS total
        FROM Alerta a
        JOIN Componente c ON a.fkComponente = c.idComponente
        WHERE c.fkMaquina = ${hostName}
        AND a.dtHora >= NOW() - INTERVAL ${dias} DAY
        ${componenteFiltro}
        GROUP BY a.estado;
    `;

    return database.executar(instrucao);
}

module.exports = {
    kpis,
    graficoLinha,
    graficoComponentes,
    graficoTipos
};