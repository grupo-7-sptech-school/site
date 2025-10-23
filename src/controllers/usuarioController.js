var usuarioModel = require("../models/usuarioModel");
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'techsolardata@gmail.com', 
        pass: 'edzh ucgj mdat bahl' //senha de aplicativo gerada
    }
});



function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`); // transforma JSON em String

                    if (resultadoAutenticar.length == 1) {
                        console.log(resultadoAutenticar);



                        res.json({
                            idusuario: resultadoAutenticar[0].idusuario,
                            email: resultadoAutenticar[0].email,
                            nome: resultadoAutenticar[0].nome,
                            senha: resultadoAutenticar[0].senha
                        });

                    } else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var fkEmpresa = req.body.fkEmpresaServer;


    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else {

        usuarioModel.cadastrar(nome, email, senha, fkEmpresa)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}


function validarCodigo(req, res) {

    var codigoAtivacao = req.body.codigoAtivacao;

    console.log(`Recuperando código de ativação`);

    usuarioModel.validarCodigo(codigoAtivacao).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum resultado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar o código de ativação.", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}



function puxarProcesso(req, res) {
    usuarioModel.puxarProcesso()
        .then(resultado => {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum processo encontrado!");
            }
        })
        .catch(erro => {
            console.error("❌ Erro:", erro);
            res.status(500).json({
                message: "Erro ao buscar processos",
                erro: erro.sqlMessage || erro.message
            });
        });
}



function sendEmail(req, res) {
    const { representante, email, assunto, telefone, mensagem } = req.body;

    if (!representante || !email || !assunto || !telefone || !mensagem) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const mailOptions = {
        from: email,
        to: 'techsolardata@gmail.com',
        subject: assunto,
        text: `Nome: ${representante}\nEmail: ${email}\nTelefone: ${telefone}\nMensagem: ${mensagem}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erro ao enviar email:', error);
            return res.status(500).json({ 
                message: 'Erro ao enviar o e-mail', 
                error: error.message 
            });
        }

        res.status(200).json({ 
            message: 'E-mail enviado com sucesso!',
            previewUrl: nodemailer.getTestMessageUrl(info)
        });
    });
}


module.exports = {
    autenticar,
    cadastrar,
    validarCodigo,
    sendEmail,
    puxarProcesso,
}