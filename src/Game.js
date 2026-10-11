// Responsável pela apresentação e, futuramente, pela coordenação dos estados do jogo.
class Game {
  constructor() {
    // O ecrã inicial é o único estado apresentado nesta fase.
  }

  mostrarEcraInicial() {
    background('#e8f4f2');

    // Faixa decorativa simples para evocar o ambiente costeiro.
    noStroke();
    fill('#0b7285');
    rect(0, height * 0.72, width, height * 0.28);
    fill('#14919b');
    ellipse(width * 0.5, height * 0.72, width * 1.25, height * 0.16);

    textAlign(CENTER, CENTER);
    fill('#073b4c');
    textStyle(BOLD);
    textSize(48);
    text('Coast Guardians', width / 2, height * 0.32);

    textStyle(NORMAL);
    textSize(20);
    text('Coastal Zone Protection', width / 2, height * 0.43);

    textSize(16);
    text('Ecrã inicial provisório', width / 2, height * 0.55);
    text('Clique para iniciar', width / 2, height * 0.62);
  }
}
