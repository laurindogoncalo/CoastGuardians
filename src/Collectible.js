
class Collectible {
  constructor(x, y, tipo = 'LIXO') {
    this.x = x;
    this.y = y;
    this.tipo = tipo;

    // Limites usados para detetar colisões.
    this.largura = 34;
    this.altura = 42;
  }

  desenhar() {
    push();
    translate(this.x, this.y);

    // Pequena sombra para destacar o objeto do fundo.
    noStroke();
    fill(7, 59, 76, 28);
    ellipse(2, 21, 27, 6);

    rectMode(CENTER);
    strokeWeight(1.5);

    // Cada tipo de resíduo tem o seu próprio desenho.
    switch (this.tipo) {
      case 'GARRAFA':
        this.desenharGarrafa();
        break;

      case 'SACO':
        this.desenharSaco();
        break;

      case 'COPO':
        this.desenharCopo();
        break;

      case 'EMBALAGEM':
        this.desenharEmbalagem();
        break;

      default:
        this.desenharLata();
        break;
    }

    pop();
  }

  desenharGarrafa() {
    // Corpo transparente da garrafa.
    stroke('#36798b');
    fill('#a9e3e9');
    rect(0, 3, 18, 29, 4);

    // Gargalo.
    fill('#8fd4df');
    rect(0, -14, 9, 8, 2);

    // Tampa.
    stroke('#24576a');
    fill('#e08d55');
    rect(0, -20, 10, 5, 1);

    // Etiqueta.
    noStroke();
    fill('#ffffff');
    rect(0, 4, 15, 8, 2);

    fill('#258a93');
    rect(0, 4, 10, 2, 1);
  }

  desenharSaco() {
    // Pega do saco.
    noFill();
    stroke('#397c69');
    strokeWeight(2.5);
    arc(0, -12, 13, 15, PI, TWO_PI);

    // Corpo do saco.
    stroke('#397c69');
    strokeWeight(1.5);
    fill('#8ec9a8');

    beginShape();
    vertex(-12, -12);
    vertex(12, -12);
    vertex(15, 12);
    vertex(9, 18);
    vertex(-10, 16);
    vertex(-15, 10);
    endShape(CLOSE);

    // Dobra do plástico.
    stroke('#d5f0dc');
    line(-8, -5, 7, -5);
    line(-7, 1, 8, 1);
  }

  desenharCopo() {
    // Corpo do copo.
    stroke('#547d8c');
    fill('#e6f0f2');

    beginShape();
    vertex(-11, -13);
    vertex(11, -13);
    vertex(7, 17);
    vertex(-7, 17);
    endShape(CLOSE);

    // Abertura do copo.
    fill('#ffffff');
    ellipse(0, -13, 22, 6);

    // Borda inferior.
    stroke('#9db8c1');
    line(-6, 13, 6, 13);

    // Palhinha.
    stroke('#e08d55');
    strokeWeight(2.5);
    line(3, -15, 3, -23);

    strokeWeight(1.5);
  }

  desenharEmbalagem() {
    // Embalagem retangular.
    stroke('#a6682b');
    fill('#edc17c');
    rect(0, 1, 29, 26, 3);

    // Parte superior dobrada.
    fill('#f5d59f');
    beginShape();
    vertex(-14, -12);
    vertex(-5, -18);
    vertex(14, -12);
    vertex(5, -7);
    endShape(CLOSE);

    // Faixa central da embalagem.
    stroke('#b57a3d');
    line(-12, 3, 12, 3);

    noStroke();
    fill('#ffffff');
    rect(0, -2, 12, 6, 1);

    fill('#b57a3d');
    rect(0, -2, 7, 2, 1);
  }

  desenharLata() {
    // Resíduo genérico: lata de metal.
    stroke('#526b76');
    fill('#bdcbd0');
    rect(0, 1, 23, 31, 4);

    // Tampa superior.
    fill('#e4ebed');
    ellipse(0, -14, 23, 7);

    // Abertura da lata.
    noFill();
    stroke('#657f89');
    ellipse(0, -14, 10, 3);

    // Reflexo lateral.
    stroke('#ffffff');
    strokeWeight(2);
    line(-7, -8, -7, 9);

    strokeWeight(1.5);
  }
}
