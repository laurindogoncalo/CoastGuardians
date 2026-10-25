// Representa um resíduo que pode ser recolhido pela rede.
class Collectible {
  constructor(x, y, tipo = 'LIXO') {
    // x e y representam o centro do objeto.
    this.x = x;
    this.y = y;
    this.largura = 30;
    this.altura = 38;
    this.tipo = tipo;
  }

  desenhar() {
    rectMode(CENTER);
    stroke('#52616b');
    strokeWeight(1);
    fill('#adb7bc');
    rect(this.x, this.y, this.largura, this.altura, 4);

    noStroke();
    fill('#263238');
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(9);
    text(this.tipo, this.x, this.y);
    textStyle(NORMAL);
    rectMode(CORNER);
  }
}
