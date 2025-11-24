var database = require("../database/config");

function dadosGrafico(idComponente, hostName) {
    var instrucao = `
        SELECT 
            r.captura AS valor,
            DATE_FORMAT(r.dtRegistro, '%H:%i:%s') AS momento_grafico
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE c.idComponente = ${idComponente}
        AND m.hostName = '${hostName}'
        ORDER BY r.idRegistro DESC LIMIT 1;
    `;
    return database.executar(instrucao);
}

function leituraDisco(hostName) {
    var instrucao = `
        SELECT 
            rd.taxaLeitura AS valor,
            DATE_FORMAT(rd.dtRegistro, '%H:%i:%s') AS momento_grafico
        FROM RegistroDisco rd
        JOIN Componente c ON rd.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE c.tipo = 'Leitura' 
        AND m.hostName = '${hostName}'
        ORDER BY rd.idRegistroDisco DESC LIMIT 1;
    `;
    return database.executar(instrucao);
}

function escritaDisco(hostName) {
    var instrucao = `
        SELECT 
            rd.taxaEscrita AS valor,
            DATE_FORMAT(rd.dtRegistro, '%H:%i:%s') AS momento_grafico
        FROM RegistroDisco rd
        JOIN Componente c ON rd.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE c.tipo = 'Escrita' 
        AND m.hostName = '${hostName}'
        ORDER BY rd.idRegistroDisco DESC LIMIT 1;
    `;
    return database.executar(instrucao);
}

function top3(hostName) {
    var instrucao = `
        SELECT rd.top1, rd.top1Valor, rd.top2, rd.top2Valor, rd.top3, rd.top3Valor
        FROM RegistroDisco rd
         JOIN Componente c ON rd.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE m.hostName = '${hostName}'
         ORDER BY rd.idRegistroDisco DESC LIMIT 1;
    `;
    return database.executar(instrucao);
}

function maisLeitura(hostName) {
    var instrucao = `
        SELECT rd.procMaisLeitura, rd.procMaisLeituraValor
        FROM RegistroDisco rd
        JOIN Componente c ON rd.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE m.hostName = '${hostName}'
        ORDER BY rd.idRegistroDisco DESC
        LIMIT 1;
    `;
    return database.executar(instrucao);
}

function maisEscrita(hostName) {
    var instrucao = `
        SELECT rd.procMaisEscrita, rd.procMaisEscritaValor
        FROM RegistroDisco rd
        JOIN Componente c ON rd.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE m.hostName = '${hostName}'
        ORDER BY rd.idRegistroDisco DESC
        LIMIT 1;
    `;
    return database.executar(instrucao);
}

async function getRamUltimos7Dias(idMaquina) {
  var instrucaoSql = `
    SELECT 
        DATE_FORMAT(r.dtRegistro, '%Y-%m-%d %H:00:00') AS hora,
        ROUND(AVG(r.captura), 2) AS ramPercent
    FROM Registro r
    JOIN Componente c 
        ON r.fkComponente = c.idComponente
    WHERE r.fkComponente = 2
      AND c.fkMaquina = ${idMaquina}
      AND r.dtRegistro >= NOW() - INTERVAL 7 DAY
    GROUP BY hora
    ORDER BY hora ASC;
  `;
  return database.executar(instrucaoSql);
}

async function alertasSemana(idMaquina) {
    var instrucao = `
        SELECT COUNT(*) AS total
        FROM Alerta
        WHERE fkComponente = 2
          AND dtHora >= NOW() - INTERVAL 7 DAY
          AND fkRegistro IN (
              SELECT idRegistro FROM Registro WHERE fkComponente = 2
          );
    `;
    return database.executar(instrucao);
}



module.exports = {
    dadosGrafico,
    leituraDisco,
    escritaDisco,
    top3,
    maisLeitura,
    maisEscrita,
    getRamUltimos7Dias,
    alertasSemana
};
