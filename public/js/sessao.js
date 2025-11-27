// sessão
function validarSessao() {
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;

    var b_usuario = document.getElementById("b_usuario");

    if (email != null && nome != null) {
        b_usuario.innerHTML = nome;
    } else {
        window.location = "../login.html";
    }
    carregarFotoUsuario();
}

function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}

function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "flex";
}

function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "none";

    var divErrosLogin = document.getElementById("div_erros_login");
    if (texto) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.innerHTML = texto;
    }
}

async function carregarFotoUsuario() {
    const idUsuario = sessionStorage.getItem("ID_USUARIO");
    if (!idUsuario) return;

    try {
        const resp = await fetch("/usuarios/infoUsuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idUsuario })
        });
        const dados = await resp.json();
        if (!dados || dados.length === 0) return;

        let foto = dados[0].fotoPerfil;
        if (!foto) return;

        if (!foto.startsWith("/uploads") && !/^https?:\/\//.test(foto)) {
            foto = "/uploads/" + foto;
        }

        const cacheBust = "?t=" + Date.now();
        const urlFinal = foto + cacheBust;

        const elemsTopo = document.querySelectorAll("#fotoTopo, .foto-topo");
        elemsTopo.forEach(el => { if (el.tagName === "IMG") el.src = urlFinal; else el.style.backgroundImage = `url(${urlFinal})`; });

        const fotoPerfil = document.getElementById("fotoPerfil");
        if (fotoPerfil) fotoPerfil.src = urlFinal;
    } catch (err) {
        console.error("Erro ao carregar foto do usuário:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    carregarFotoUsuario();
});


