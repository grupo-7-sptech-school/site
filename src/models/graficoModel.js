var database = require("../database/config");

function dadosGrafico(idComponente, hostName, limite) {
    var instrucao = `
        SELECT 
            r.captura AS valor,
            DATE_FORMAT(r.dtRegistro, '%H:%i:%s') AS momento_grafico
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE c.idComponente = ${idComponente}
        AND m.hostName = ${hostName}
        ORDER BY r.idRegistro DESC
        LIMIT ${limite};
    `;

    return database.executar(instrucao);
}


module.exports = { dadosGrafico };
