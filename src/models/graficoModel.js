var database = require("../database/config");

function dadosGrafico(idComponente, limite) {

    var instrucao = `
        SELECT 
            captura AS valor,
            DATE_FORMAT(dtRegistro, '%H:%i:%s') AS momento_grafico
        FROM registro
        WHERE fkComponente = ${idComponente}
        ORDER BY idRegistro DESC
        LIMIT ${limite};
    `;

    console.log("Executando SQL:\n" + instrucao);
    return database.executar(instrucao);
}

module.exports = { dadosGrafico };
