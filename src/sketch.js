// Ponto de entrada do p5.js: configura o canvas e apresenta o ecrã inicial.
let jogo;

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('jogo');
  jogo = new Game();
  windowResized();
}

function draw() {
  jogo.mostrarEcraInicial();
}

// Ajusta a escala do canvas ao espaço disponível sem alterar a resolução lógica.
function windowResized() {
  const larguraDisponivel = min(windowWidth - 32, 800);
  const escala = min(larguraDisponivel / 800, 1);
  const canvas = document.querySelector('#jogo canvas');
  if (canvas) {
    canvas.style.width = `${800 * escala}px`;
    canvas.style.height = `${600 * escala}px`;
  }
}


