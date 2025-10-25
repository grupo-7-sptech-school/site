var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT idusuario, nome, email FROM Usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha, fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha);
    
    var instrucaoSql = `
        INSERT INTO Usuario (nome, email, senha, fkEmpresa, fkTipoUsuario) VALUES ('${nome}', '${email}', '${senha}', '${fkEmpresa}', '1');
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



module.exports = {
    autenticar,
    cadastrar,
    validarCodigo,
    puxarProcesso,
    validarEmailRecuperar,
    inserirRecuperacao
};