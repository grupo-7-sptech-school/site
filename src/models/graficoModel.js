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
        ORDER BY r.idRegistro DESC LIMIT 10;
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

function getRamUltimos7Dias(hostName) {
    var instrucao = `
        SELECT
            DATE_FORMAT(hora_chave, '%d/%m %H:%i') AS hora,
            ROUND(AVG(ram_val), 2) AS ramPercent
        FROM (
            SELECT
                r.captura AS ram_val,
                DATE_FORMAT(r.dtRegistro, '%Y-%m-%d %H:%i:00') AS hora_chave
            FROM Registro r
            JOIN Componente c ON r.fkComponente = c.idComponente
            JOIN Maquina m ON c.fkMaquina = m.hostName
            WHERE m.hostName = '${hostName}'
              AND LOWER(c.nome) LIKE '%ram%'
              AND r.captura IS NOT NULL
              AND r.dtRegistro >= NOW() - INTERVAL 7 DAY
        ) AS sub
        GROUP BY hora_chave
        ORDER BY hora_chave ASC;
    `;
    return database.executar(instrucao);
}



async function alertasSemana(hostName) {
    var instrucao = `
         SELECT 
            COUNT(a.idAlerta) AS total
        FROM Alerta a
        JOIN Componente c ON a.fkComponente = c.idComponente
        WHERE c.fkMaquina = '${hostName}'
          AND a.estado = 'CRITICO'
          AND a.dtHora >= NOW() - INTERVAL 7 DAY;
    `;
    return database.executar(instrucao);
}


function top3MaquinasRAM(hostName) {
    var instrucao = `
        SELECT
            m.hostName AS idMaquina,
            m.identificador AS nomeMaquina,
            ROUND(AVG(r.captura), 2) AS consumoMedio
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE LOWER(c.nome) LIKE '%ram%'
          AND r.dtRegistro >= NOW() - INTERVAL 7 DAY
          AND m.fkEmpresa = (
              SELECT fkEmpresa FROM Maquina WHERE hostName = '${hostName}'
          )
        GROUP BY m.hostName, m.identificador
        ORDER BY consumoMedio DESC
        LIMIT 3;
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
    alertasSemana,
    top3MaquinasRAM
};
