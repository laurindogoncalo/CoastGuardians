// Ponto de entrada do P5.js: cria o canvas e chama o objeto principal do jogo.
let jogo;

function setup() {
  const canvas = createCanvas(800, 600);
  canvas.parent('jogo');
  jogo = new Game();
  ajustarCanvas();
}



function draw() {
  if (!jogo) return;

  // Desenha o estado atual do jogo.
  jogo.desenhar();

  // Desenha a identificação por cima do ecrã.
  jogo.desenharIdentificacao();
}


// Os cliques permitem iniciar o jogo e pedir acesso ao microfone.
function mousePressed() {
  if (jogo) jogo.tratarClique();
  return false;
}

function windowResized() {
  ajustarCanvas();
}

// Mantém a resolução lógica de 800 x 600 e ajusta a apresentação à janela.
function ajustarCanvas() {
  const canvas = document.querySelector('#jogo canvas');
  if (!canvas) return;

  const larguraDisponivel = Math.max(280, Math.min(windowWidth - 32, 800));
  const escala = larguraDisponivel / 800;
  canvas.style.width = `${larguraDisponivel}px`;
  canvas.style.height = `${600 * escala}px`;
}
