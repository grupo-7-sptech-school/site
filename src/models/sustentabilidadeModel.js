var database = require("../database/config");

function obterMediaMensal(idEmpresa) {

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

module.exports = { 
    obterMediaMensal 
};
