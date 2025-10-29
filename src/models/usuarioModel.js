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


function puxarProcesso() {
    var instrucaoSql = `SELECT * FROM Processo ORDER BY dtregistro DESC LIMIT 100;`;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function puxarAlerta() {
    var instrucaoSql = `SELECT 
    Alerta.idAlerta,
    Alerta.dtHora,
    Alerta.estado,
    Alerta.captura,
    Componente.nome AS componenteNome,
    Maquina.identificador AS identificador
    FROM Alerta
    JOIN Registro ON Alerta.fkRegistro = Registro.idRegistro
    JOIN Componente ON Registro.fkComponente = Componente.idComponente
    JOIN Maquina ON Componente.fkMaquina = Maquina.hostname
    WHERE alerta.estado != "NORMAL"
    ORDER BY Alerta.dtHora DESC
    LIMIT 4;`;

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
    cadastrarComponentes
}