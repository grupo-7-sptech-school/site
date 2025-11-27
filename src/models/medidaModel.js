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







function puxarMaquinaProcessos(hostName) {

    const instrucaoSql = `
            SELECT
    m.preventivoInicio,
    m.preventivoFim,
    m.criticoInicio,
    m.criticoFim,
    ma.identificador AS nomeMaquina,
    ult.dtUltimaCaptura
    FROM Metrica m
    JOIN Componente c  ON m.fkComponente = c.idComponente
    JOIN Maquina ma    ON c.fkMaquina = ma.hostName
    JOIN (
        SELECT 
            c2.fkMaquina,
            MAX(r2.dtRegistro) AS dtUltimaCaptura
        FROM Registro r2
        JOIN Componente c2 ON r2.fkComponente = c2.idComponente
        GROUP BY c2.fkMaquina
    ) AS ult ON ult.fkMaquina = ma.hostName
    WHERE ma.hostName = '${hostName}';
        `;

    return database.executar(instrucaoSql);
}

function quantidadeAlertasProcessos(hostName) {

    const instrucaoSql = `
            SELECT 
    COUNT(*) AS total_alertas_semana,
    SUM(CASE WHEN a.estado = 'CRITICO' THEN 1 ELSE 0 END) AS total_criticos_semana,
    SUM(CASE WHEN a.estado = 'ALERTA' THEN 1 ELSE 0 END) AS total_preventivos_semana
    FROM Alerta a
    JOIN Componente c ON a.fkComponente = c.idComponente
    JOIN Maquina m ON c.fkMaquina = m.hostName
    WHERE m.hostName = '${hostName}';`;

    return database.executar(instrucaoSql);
}

function rankingProcessos(hostName, limite) {

    const instrucaoSql = `
                 SELECT p1.nome AS processo,
               p1.cpuPorcentagem AS cpu,
               p1.ramPorcentagem AS ram,
               CASE
                   WHEN p1.cpuPorcentagem >= 20 THEN 'CRÍTICO'
                   WHEN p1.cpuPorcentagem >= 10 THEN 'PREVENTIVO'
                   ELSE 'NORMAL'
               END AS status,
               p1.dtRegistro AS data_registro
        FROM Processo p1
        INNER JOIN (
            SELECT nome, MAX(idProcesso) AS maxId
            FROM Processo
            WHERE fkMaquina = ${hostName}
            GROUP BY nome
        ) p2 ON p1.nome = p2.nome AND p1.idProcesso = p2.maxId
        WHERE p1.fkMaquina = ${hostName}
        ORDER BY p1.cpuPorcentagem DESC
        LIMIT ${limite};
    `;

    return database.executar(instrucaoSql);
}


function rankingProcessosRAM(hostName, limite) {

    const instrucaoSql = `
                 SELECT p1.nome AS processo,
               p1.cpuPorcentagem AS cpu,
               p1.ramPorcentagem AS ram,
               CASE
                   WHEN p1.ramPorcentagem >= 20 THEN 'CRÍTICO'
                   WHEN p1.ramPorcentagem >= 10 THEN 'PREVENTIVO'
                   ELSE 'NORMAL'
               END AS status,
               p1.dtRegistro AS data_registro
        FROM Processo p1
        INNER JOIN (
            SELECT nome, MAX(idProcesso) AS maxId
            FROM Processo
            WHERE fkMaquina = ${hostName}
            GROUP BY nome
        ) p2 ON p1.nome = p2.nome AND p1.idProcesso = p2.maxId
        WHERE p1.fkMaquina = ${hostName}
        ORDER BY p1.ramPorcentagem DESC
        LIMIT ${limite};
    `;

    return database.executar(instrucaoSql);
}

function graficoProcessos(hostName) {
    const instrucaoSql = `
    WITH ultimos_registros AS (
    SELECT 
        idProcesso,      
        dtRegistro,
        cpuPorcentagem,
        ROW_NUMBER() OVER (ORDER BY idProcesso DESC) AS pos
    FROM Processo
    WHERE fkMaquina = ${hostName}
    ORDER BY idProcesso DESC
    LIMIT 1000   
),

grupos AS (
    SELECT 
        CEIL(pos / 100) AS grupo,
        SUM(cpuPorcentagem) AS total_cpu,
        MAX(dtRegistro) AS dtRegistro
    FROM ultimos_registros
    GROUP BY grupo
    ORDER BY grupo DESC
    LIMIT 10
)

SELECT * FROM grupos ORDER BY dtRegistro;
    `;
    return database.executar(instrucaoSql);
}


function graficoProcessosRAM(hostName) {
    const instrucaoSql = `
    WITH ultimos_registros AS (
    SELECT 
        idProcesso,      
        dtRegistro,
        ramPorcentagem,
        ROW_NUMBER() OVER (ORDER BY idProcesso DESC) AS pos
    FROM Processo
    WHERE fkMaquina = ${hostName}
    ORDER BY idProcesso DESC
    LIMIT 1000   
),

grupos AS (
    SELECT 
        CEIL(pos / 100) AS grupo,
        SUM(IFNULL(ramPorcentagem, 0)) AS total_ram,
        MAX(dtRegistro) AS dtRegistro
    FROM ultimos_registros
    GROUP BY grupo
    ORDER BY grupo DESC
    LIMIT 10
)

SELECT * FROM grupos ORDER BY dtRegistro;
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
    puxarMetricas,
    puxarMaquinaProcessos,
    quantidadeAlertasProcessos,
    rankingProcessos,
    rankingProcessosRAM,
    graficoProcessos,
    graficoProcessosRAM,
}