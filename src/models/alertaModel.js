var database = require("../database/config");

function converterPeriodo(periodo) {
    if (periodo === "hoje") return "NOW() - INTERVAL 1 DAY";
    if (periodo === "semana") return "NOW() - INTERVAL 7 DAY";
    if (periodo === "2semanas") return "NOW() - INTERVAL 15 DAY";
    if (periodo === "mes") return "NOW() - INTERVAL 30 DAY";

    return "NOW() - INTERVAL 1 DAY"; 
}

function kpis(hostName, periodo) {
    var intervalo = converterPeriodo(periodo);

    var instrucao = `
        SELECT 
            (SELECT COUNT(*) 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.dtHora >= ${intervalo}) AS total,

            (SELECT COUNT(*) 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.estado = 'CRITICO'
             AND a.dtHora >= ${intervalo}) AS criticos,

            (SELECT COUNT(*) 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.estado = 'ALERTA'
             AND a.dtHora >= ${intervalo}) AS preventivos,

            (SELECT c.nome 
             FROM Alerta a
             JOIN Componente c ON a.fkComponente = c.idComponente
             WHERE c.fkMaquina = ${hostName}
             AND a.dtHora >= ${intervalo}
             GROUP BY c.nome
             ORDER BY COUNT(*) DESC
             LIMIT 1) AS componenteCritico;
    `;

    return database.executar(instrucao);
}

function graficoLinha(hostName, periodo) {
    var intervalo = converterPeriodo(periodo);

    var instrucao = `
        SELECT 
            DATE_FORMAT(a.dtHora, '%d/%m %H:%i') AS momento,
            COUNT(*) AS total
        FROM Alerta a
        JOIN Componente c ON a.fkComponente = c.idComponente
        WHERE c.fkMaquina = ${hostName}
        AND a.dtHora >= ${intervalo}
        GROUP BY DATE_FORMAT(a.dtHora, '%d/%m %H')
        ORDER BY a.dtHora ASC;
    `;

    return database.executar(instrucao);
}

function graficoComponentes(hostName, periodo) {
    var intervalo = converterPeriodo(periodo);

    var instrucao = `
        SELECT 
            c.nome AS componente,
            COUNT(*) AS total
        FROM Alerta a
        JOIN Componente c ON a.fkComponente = c.idComponente
        WHERE c.fkMaquina = ${hostName}
        AND a.dtHora >= ${intervalo}
        GROUP BY c.nome
        ORDER BY total DESC;
    `;

    return database.executar(instrucao);
}

function graficoTipos(hostName, periodo) {
    var intervalo = converterPeriodo(periodo);

    var instrucao = `
        SELECT 
            estado,
            COUNT(*) AS total
        FROM Alerta a
        JOIN Componente c ON a.fkComponente = c.idComponente
        WHERE c.fkMaquina = ${hostName}
        AND a.dtHora >= ${intervalo}
        GROUP BY estado;
    `;

    return database.executar(instrucao);
}

module.exports = {
    kpis,
    graficoLinha,
    graficoComponentes,
    graficoTipos
};
