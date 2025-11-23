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


module.exports = {
    dadosGrafico,
    leituraDisco,
    escritaDisco,
    top3,
    maisLeitura,
    maisEscrita
};
