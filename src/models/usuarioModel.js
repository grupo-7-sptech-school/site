var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT idusuario, fkEmpresa, fktipoUsuario, nome, email FROM Usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha, fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha);

    var instrucaoSql = `
        INSERT INTO Usuario (nome, email, senha, fkEmpresa, fkTipoUsuario) VALUES ('${nome}', '${email}', '${senha}', '${fkEmpresa}','1');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function validarCodigo(codigoAtivacao) {

    var instrucaoSql = `SELECT *from ChaveAtivacao where chave = '${codigoAtivacao}' LIMIT 1`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function validarEmailRecuperar(emailRecuperar) {

    var instrucaoSql = `SELECT *from Usuario where email = '${emailRecuperar}' LIMIT 1`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function inserirRecuperacao(email, token) {
    console.log("Inserindo token de recuperação para:", email, token);

    var instrucaoSql = `
        UPDATE Usuario 
        SET tokenRecuperacao = '${token}'
        WHERE email = '${email}';
    `;
    console.log("Executando SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function validarTokenRecuperacao(tokenRecuperacao) {

    var instrucaoSql = `SELECT *from Usuario where tokenRecuperacao = '${tokenRecuperacao}' LIMIT 1`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function redefinirSenha(idUsuario, novaSenha) {
    console.log("Inserindo token de recuperação para:", idUsuario);

    var instrucaoSql = `
        UPDATE Usuario 
        SET senha = '${novaSenha}'
        WHERE idUsuario = '${idUsuario}';
    `;
    console.log("Executando SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function puxarProcesso() {
    var instrucaoSql = `SELECT * FROM Processo ORDER BY dtregistro DESC LIMIT 100;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function puxarAlerta() {
    var instrucaoSql = `SELECT Alerta.idAlerta,
    Alerta.dtHora,
    Alerta.estado,
    Alerta.captura,
    Componente.nome AS componenteNome,
    Maquina.identificador AS identificador
    FROM Alerta
    LEFT JOIN Registro ON Alerta.fkRegistro = Registro.idRegistro
    JOIN Componente ON Alerta.fkComponente = Componente.idComponente
    JOIN Maquina ON Componente.fkMaquina = Maquina.hostName
    WHERE Alerta.estado != "NORMAL"
    ORDER BY Alerta.dtHora DESC
    LIMIT 4;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function infoUsuario(idUsuario) {
    var instrucaoSql = `SELECT 
    u.nome AS Nome,
    e.nomeFantasia AS Empresa,
    u.email AS Email
    FROM Usuario u
    JOIN Empresa e ON u.fkEmpresa = e.idEmpresa
    WHERE u.idUsuario = ${idUsuario};`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function validarSenha(senha, idUsuario) {
    var instrucaoSql = `SELECT
     *FROM Usuario where senha = "${senha}" 
     AND idUsuario = "${idUsuario}";`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function senhaAlterada(senha, idUsuario) {
    var instrucaoSql = `UPDATE 
    Usuario SET senha = "${senha}" 
    where idUsuario = "${idUsuario}";`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


function kpisDashAlta() {
    var instrucaoSql = `SELECT 
    m.hostName AS HostName,
    m.identificador AS Identificador,
    m.ip AS IP,
    m.dtCriacao AS DataCriacao,
    ult.estado AS EstadoAtual,
    ult.dtHora AS UltimoAlerta,
    ult.descricao AS DescricaoUltimoAlerta,

    -- Buscar o último valor de CPU
    (
        SELECT r.captura
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        WHERE c.nome LIKE 'CPU%' AND c.fkMaquina = m.hostName
        ORDER BY r.dtRegistro DESC
        LIMIT 1
    ) AS CpuUso,

    -- Buscar o último valor de RAM
    (
        SELECT r.captura
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        WHERE c.nome LIKE 'RAM%' AND c.fkMaquina = m.hostName
        ORDER BY r.dtRegistro DESC
        LIMIT 1
    ) AS RamUso,

    CASE
        WHEN ult.estado = 'CRITICO' THEN 'Crítico'
        WHEN ult.estado = 'ALERTA' THEN 'Em Alerta'
        WHEN ult.estado = 'NORMAL' THEN 'Normal'
        WHEN (
            (SELECT r.captura
             FROM Registro r
             JOIN Componente c ON r.fkComponente = c.idComponente
             WHERE c.nome LIKE 'CPU%' AND c.fkMaquina = m.hostName
             ORDER BY r.dtRegistro DESC
             LIMIT 1) < 20
            AND
            (SELECT r.captura
             FROM Registro r
             JOIN Componente c ON r.fkComponente = c.idComponente
             WHERE c.nome LIKE 'RAM%' AND c.fkMaquina = m.hostName
             ORDER BY r.dtRegistro DESC
             LIMIT 1) < 20
        ) THEN 'Ociosa'
        WHEN ult.estado IS NULL THEN 'Normal'
        ELSE 'Desconhecido'
    END AS StatusInterpretado

FROM Maquina m
LEFT JOIN (
    SELECT 
        a1.*
    FROM Alerta a1
    INNER JOIN (
        SELECT fkComponente, MAX(dtHora) AS MaxHora
        FROM Alerta
        GROUP BY fkComponente
    ) ultimos ON a1.fkComponente = ultimos.fkComponente AND a1.dtHora = ultimos.MaxHora
) AS ult
ON ult.fkComponente IN (
    SELECT idComponente FROM Componente WHERE fkMaquina = m.hostName
)
ORDER BY m.hostName;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function puxarMaquinas() {
    var instrucaoSql = `SELECT 
    m.hostName AS 'HostName',
    m.identificador AS 'Identificador',
    m.ip AS 'IP',
    m.dtCriacao AS 'Data de Criação',
    (SELECT r.captura 
     FROM Registro r
     JOIN Componente c ON r.fkComponente = c.idComponente
     WHERE c.nome LIKE 'CPU%' AND c.fkMaquina = m.hostName
     ORDER BY r.dtRegistro DESC
     LIMIT 1) AS 'CPU Atual (%)',
    (SELECT r.captura 
     FROM Registro r
     JOIN Componente c ON r.fkComponente = c.idComponente
     WHERE c.nome LIKE 'RAM%' AND c.fkMaquina = m.hostName
     ORDER BY r.dtRegistro DESC
     LIMIT 1) AS 'RAM Atual (%)',
    (SELECT a.estado 
     FROM Alerta a
     JOIN Componente c ON a.fkComponente = c.idComponente
     WHERE c.fkMaquina = m.hostName
     ORDER BY a.dtHora DESC
     LIMIT 1) AS 'Último Estado',
    (SELECT a.dtHora 
     FROM Alerta a
     JOIN Componente c ON a.fkComponente = c.idComponente
     WHERE c.fkMaquina = m.hostName
     ORDER BY a.dtHora DESC
     LIMIT 1) AS 'Data do Último Alerta',
    (SELECT a.descricao 
     FROM Alerta a
     JOIN Componente c ON a.fkComponente = c.idComponente
     WHERE c.fkMaquina = m.hostName
     ORDER BY a.dtHora DESC
     LIMIT 1) AS 'Descrição do Último Alerta'
     FROM Maquina m
     ORDER BY m.hostName;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}




function puxarTodosAlertas() {
    var instrucaoSql = `SELECT 
    DATE_FORMAT(a.dtHora, '%Y-%m-%d %H:%i') AS dataHora,
    m.identificador AS maquina,
    CASE 
        WHEN c.nome LIKE 'CPU%' THEN 'Consumo elevado de CPU'
        WHEN c.nome LIKE 'RAM%' THEN 'Consumo elevado de RAM'
        WHEN c.nome LIKE 'DISCO%' THEN 'Consumo elevado de DISCO'
        ELSE CONCAT('Anomalia em ', c.nome)
    END AS tipoAlerta,
    CASE 
        WHEN a.estado = 'CRITICO' THEN 'Crítico'
        WHEN a.estado = 'ALERTA' THEN 'Preventivo'
        WHEN a.estado = 'NORMAL' THEN 'Ociosidade'
        ELSE 'Desconhecido'
    END AS prioridade,
    a.descricao AS descricao
    FROM Alerta a
    JOIN Componente c ON a.fkComponente = c.idComponente
    JOIN Maquina m ON c.fkMaquina = m.hostName
    ORDER BY a.dtHora DESC
    LIMIT 10;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}





function cadastrarMaquina(identificador, hostname, mac, ip, fkEmpresa) {
    var instrucaoSql = `
        INSERT INTO Maquina (hostName, identificador, fkEmpresa, macAdress, ip)
        VALUES (${hostname}, '${identificador}', ${fkEmpresa}, '${mac}', '${ip}');
    `;
    console.log("Executando SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrarComponentes(fkMaquina) {
    var instrucaoSql = `
        INSERT INTO Componente (nome, quantidade, unidadeDeMedida, fkMaquina)
        VALUES 
        ('CPU', 1, '%', ${fkMaquina}),
        ('RAM', 1, '%', ${fkMaquina}),
        ('DISCO', 1, '%', ${fkMaquina});
        `;

    console.log("Executando SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizarFoto(idUsuario, urlFoto) {
    const instrucaoSql = `
        UPDATE Usuario 
        SET fotoPerfil = '${urlFoto}'
        WHERE idUsuario = ${idUsuario};
    `;

    return database.executar(instrucaoSql);
}



module.exports = {
    autenticar,
    cadastrar,
    validarCodigo,
    puxarProcesso,
    validarEmailRecuperar,
    inserirRecuperacao,
    puxarAlerta,
    cadastrarMaquina,
    puxarMaquinas,
    cadastrarComponentes,
    validarTokenRecuperacao,
    redefinirSenha,
    kpisDashAlta,
    infoUsuario,
    validarSenha,
    senhaAlterada,
    puxarTodosAlertas,
    atualizarFoto
}