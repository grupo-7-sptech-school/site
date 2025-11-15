var database = require("../database/config");

function buscarUltimasMedidas(idAquario, limite_linhas) {

    var instrucaoSql = `SELECT 
        dht11_temperatura as temperatura, 
        dht11_umidade as umidade,
                        momento,
                        DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico
                    FROM medida
                    WHERE fk_aquario = ${idAquario}
                    ORDER BY id DESC LIMIT ${limite_linhas}`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarMedidasEmTempoReal(idAquario) {

    var instrucaoSql = `SELECT 
        dht11_temperatura as temperatura, 
        dht11_umidade as umidade,
                        DATE_FORMAT(momento,'%H:%i:%s') as momento_grafico, 
                        fk_aquario 
                        FROM medida WHERE fk_aquario = ${idAquario} 
                    ORDER BY id DESC LIMIT 1`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function alertaPorComponente(hostName) {

    var instrucaoSql = `SELECT 
      a.dtHora AS dataHora,
      m.hostName AS hostname,
      m.identificador AS maquina,
      a.estado AS prioridade,
      a.descricao,
      a.captura,
      c.nome AS componente
    FROM Alerta a
      JOIN Componente c ON a.fkComponente = c.idComponente
      JOIN Maquina m ON c.fkMaquina = m.hostName
    WHERE m.hostName = ${hostName}
    ORDER BY a.dtHora DESC;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}



function maiorProcessoCpu(hostName) {

    var instrucaoSql = `SELECT 
    p.nome,
    p.cpuPorcentagem,
    p.dtRegistro
FROM (
    SELECT *
    FROM Processo 
    WHERE fkMaquina = ${hostName} 
      AND nome NOT IN (
        'idle', 'systemd', 'kthreadd', 'ksoftirqd', 'rcu_sched', 'migration',
        'system', 'init', 'udevd', 'cron', 'syslogd', 'kjournald'
      )
      AND nome NOT LIKE '%kernel%'
      AND nome NOT LIKE '%system%'
      AND nome NOT LIKE 'kworker/%'
      AND nome NOT LIKE 'rcu/%'
      AND nome NOT LIKE 'irq/%'
      AND nome NOT LIKE 'watchdog/%'
    ORDER BY dtRegistro DESC 
    LIMIT 100
) AS p
ORDER BY p.cpuPorcentagem DESC
LIMIT 1;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}



function maiorProcessoRam(hostName) {

    var instrucaoSql = `SELECT 
    p.nome,
    p.ramPorcentagem,
    p.dtRegistro
FROM (
    SELECT *
    FROM Processo 
    WHERE fkMaquina = 1598329989 
      AND nome NOT IN (
        'idle', 'systemd', 'kthreadd', 'ksoftirqd', 'rcu_sched', 'migration',
        'system', 'init', 'udevd', 'cron', 'syslogd', 'kjournald'
      )
      AND nome NOT LIKE '%kernel%'
      AND nome NOT LIKE '%system%'
      AND nome NOT LIKE 'kworker/%'
      AND nome NOT LIKE 'rcu/%'
      AND nome NOT LIKE 'irq/%'
      AND nome NOT LIKE 'watchdog/%'
    ORDER BY dtRegistro DESC 
    LIMIT 100
) AS p
ORDER BY p.ramPorcentagem DESC
LIMIT 1;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}




function maiorProcessoRam(body) {

    var instrucaoSql = `SELECT 
    p.nome,
    p.ramPorcentagem,
    p.dtRegistro
FROM (
    SELECT *
    FROM Processo 
    WHERE fkMaquina = 1598329989 
      AND nome NOT IN (
        'idle', 'systemd', 'kthreadd', 'ksoftirqd', 'rcu_sched', 'migration',
        'system', 'init', 'udevd', 'cron', 'syslogd', 'kjournald'
      )
      AND nome NOT LIKE '%kernel%'
      AND nome NOT LIKE '%system%'
      AND nome NOT LIKE 'kworker/%'
      AND nome NOT LIKE 'rcu/%'
      AND nome NOT LIKE 'irq/%'
      AND nome NOT LIKE 'watchdog/%'
    ORDER BY dtRegistro DESC 
    LIMIT 100
) AS p
ORDER BY p.ramPorcentagem DESC
LIMIT 1;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}



function alterarMetricas(nomeComponente, hostName, preventivoInicio, preventivoFim, criticoInicio, criticoFim) {

    const instrucaoSql = `
            UPDATE Metrica m
        JOIN Componente c ON m.fkComponente = c.idComponente
        JOIN Maquina ma ON c.fkMaquina = ma.hostName
        SET 
            m.preventivoInicio = ${preventivoInicio},
            m.preventivoFim = ${preventivoFim},
            m.criticoInicio = ${criticoInicio},
            m.criticoFim = ${criticoFim}
        WHERE c.nome = '${nomeComponente}'
          AND ma.hostName = '${hostName}';
    `;
    return database.executar(instrucaoSql);
}


function puxarMetricas(body) {

    const instrucaoSql = `
            SELECT 
    preventivoInicio,
    preventivoFim,
    criticoInicio,
    criticoFim
    FROM Metrica
    JOIN Componente ON fkComponente = idComponente
    WHERE fkMaquina = '${body.hostName}'
    AND nome = '${body.nomeComponente}';
    `;

    return database.executar(instrucaoSql);
}



module.exports = {
    buscarUltimasMedidas,
    buscarMedidasEmTempoReal,
    alertaPorComponente,
    maiorProcessoCpu,
    maiorProcessoRam,
    alterarMetricas,
    puxarMetricas
}