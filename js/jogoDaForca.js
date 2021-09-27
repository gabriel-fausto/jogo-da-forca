const letrasAlfabeto = ["A", "B", "C", "Ç", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
const limiteDeErros = 6;
let nomes = [];
let nomeSorteado = "";
let letrasErradas = [];
let letrasJaUtilizadas = [];
let exibindoMensagem = false;

//#region funcoes auxiliares do DOM
function elemento(id) {
    return document.getElementById(id);
}

function esconder(elemento) {
    elemento.classList.add("d-none");
}

function exibir(elemento) {
    elemento.classList.remove("d-none");
}

function criarEelemento(tipo) {
    return document.createElement(tipo);
}

function zerarOpacidadeDo(elemento) {
    elemento.classList.add("opacity-0")
}

function resetarOpacidadeDo(elemento) {
    elemento.classList.remove("opacity-0")
}
//#endregion

//#region funções auxiliares do jogo
function letraNa(posicao) {
    return nomeSorteado[posicao].toUpperCase();
}

function alfabetoContem(letra) {
    return letrasAlfabeto.includes(letra);
}

function letrasJaUtilizadasContem(letra) {
    return letrasJaUtilizadas.includes(letra);
}

function revelar(letra) {
    for (let posicao in nomeSorteado) {
        if (letraNa(posicao) == letra) {
            revelarLetraNa(posicao);
        }
    }
}

function revelarLetraNa(posicao) {
    elemento("palavra--letra--" + posicao).innerText = letraNa(posicao);
}

function exibirForcaInputs() {
    exibir(elemento("forca--inputs"));
    esconder(elemento("forca--vitoria"));
    esconder(elemento("forca--derrota"));
}

function exibirForcaVitoria() {
    esconder(elemento("forca--inputs"));
    exibir(elemento("forca--vitoria"));
    esconder(elemento("forca--derrota"));
}

function exibirForcaDerrota() {
    esconder(elemento("forca--inputs"));
    esconder(elemento("forca--vitoria"));
    exibir(elemento("forca--derrota"));
}

function exibirErro(mensagem) {
    if (!exibindoMensagem) {
        elemento("alert-erro--mensagem").innerText = mensagem
        ativarAlertErro();
        setTimeout(() => {
            ativarAlertErro();
        }, 5000);
    }
}

function ativarAlertErro() {
    elemento("exibir--alert--erro").click();
    exibindoMensagem = !exibindoMensagem;
}
//#endregion

//#region metodos de inicio de jogo
async function jogar() {
    carregarTelaDeJogo();
    iniciarVariaveisDeJogo();
    await carregarUmNome();
}

function iniciarVariaveisDeJogo() {
    elemento("palavra").innerText = "";
    elemento("letras--erradas").innerText = "";
    letrasErradas = [];
    letrasJaUtilizadas = [];
}

function limpaForca() {
    for (let i = 1; i <= limiteDeErros; i++) {
        zerarOpacidadeDo(elemento("corpo--" + i));
    }
}

async function carregarUmNome() {
    await chamarAPI();
    sortearNome();
    configurarNomeNaTela();
}

async function chamarAPI() {
    await fetch("http://hp-api.herokuapp.com/api/characters")
        .then(res => res.json()).then(dados => guardar(dados));
}

function guardar(dados) {
    nomes = dados.map(personagem => personagem.name);
}

function sortearNome() {
    let posicaoSorteada = Math.floor(Math.random() * nomes.length);
    nomeSorteado = nomes[posicaoSorteada];
}

function configurarNomeNaTela() {
    for (let posicaoDaLetra in nomeSorteado) {
        criarLetraEscondidaNa(posicaoDaLetra);
    }
}

function criarLetraEscondidaNa(posicao) {
    let letraEscondida = criarElementoLetraEscondida(posicao);
    elemento("palavra").appendChild(letraEscondida);
}

function criarElementoLetraEscondida(posicao) {
    let letra = criarEelemento("span");
    letra.id = "palavra--letra--" + posicao;
    letra.innerText = alfabetoContem(letraNa(posicao)) ? "_" : letraNa(posicao);
    return letra;
}

function carregarTelaDeJogo() {
    limpaForca();
    exibirForcaInputs();
}
//#endregion

//#region evento de envio de letra
function validarEnter(e) {
    if (e.key === "Enter") {
        enviarLetra();
    }
};

function enviarLetra() {
    let letraAvaliada = lerCampoLetra();
    if (validar(letraAvaliada)) {
        letrasJaUtilizadas.push(letraAvaliada);
        processar(letraAvaliada);
    }
}

function validar(letra) {
    if (!alfabetoContem(letra)) {
        exibirErro("Caracter invalido, por favor insira uma letra.\nExemplo de letra valida: J");
        return false;
    }
    else if (letrasJaUtilizadasContem(letra)) {
        exibirErro("Esta letra já foi enviada, envie uma nova letra!\nLista de letras já enviadas: " + [...letrasJaUtilizadas])
        return false;
    }
    return true;
}

function lerCampoLetra() {
    let campoLetra = elemento("forca--input--letra");
    let letra = campoLetra.value.toUpperCase();
    campoLetra.value = "";
    return letra;
}

function processar(letraAvaliada) {
    if (nomeSorteado.toUpperCase().includes(letraAvaliada))
        revelar(letraAvaliada);
    else
        processarErro(letraAvaliada);
    validarFimDeJogo();
}

function processarErro(letra) {
    letrasErradas.push(letra);
    exibirLetraErrada();
    exibirParteForca();
}

function exibirLetraErrada() {
    let letraErrada = criarEelemento("span");
    letraErrada.innerText = letrasErradas[letrasErradas.length - 1];
    elemento("letras--erradas").appendChild(letraErrada);
}

function exibirParteForca() {
    resetarOpacidadeDo(elemento("corpo--" + letrasErradas.length));
}
//#endregion

//#region funções de fim de jogo

function validarFimDeJogo() {
    if (letrasErradas.length == limiteDeErros) {
        return fimDeJogoPerdeu();
    }
    else if (!elemento("palavra").innerText.includes("_")) {
        return fimDeJogoGanhou();
    }
}

function fimDeJogoPerdeu() {
    exibirForcaDerrota();
}

function fimDeJogoGanhou() {
    exibirForcaVitoria();
}
//#endregion