var database = require("../database/config");

function dadosGrafico(hostName, limite) {

    var instrucao = `
        SELECT 
            captura AS valor,
            DATE_FORMAT(dtRegistro, '%H:%i:%s') AS momento_grafico
        FROM registro
        JOIN Maquina m ON c.fkMaquina = m.hostName
        WHERE fkComponente = ${idComponente}
        AND m.hostName = ${hostName}
        ORDER BY idRegistro DESC
        LIMIT ${limite};
     `

    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

module.exports = { dadosGrafico };
