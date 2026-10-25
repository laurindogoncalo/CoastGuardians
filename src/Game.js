// Coordena os estados, a interface, os níveis e as colisões do Coast Guardians.
class Game {
  constructor() {
    this.estado = 'menu';
    this.resultadoTipo = '';
    this.nivelConcluido = 1;

    // Controlador do microfone e dos efeitos sonoros.
    this.audioController = new AudioController();

    // Rede controlada pelo rato.
    this.rede = {
      x: width / 2 - 36,
      y: height / 2 - 36,
      largura: 72,
      altura: 72
    };

    // Objetivos por nível: fácil, intermédio e difícil.
    this.metasNivel = [8, 12, 16];
    this.nivel = 1;
    this.residuosNoNivel = 0;
    this.residuosTotal = 0;

    this.pontuacao = 0;
    this.vidas = 3;
    this.saudeCosteira = 35;

    // O tempo só conta durante a execução do jogo.
    this.duracaoJogo = 150;
    this.tempoUsadoMs = 0;
    this.inicioSegmentoTempo = 0;

    this.lixo = [];
    this.animais = [];
    this.proximoLixo = 0;

    // Proteção breve para não descontar várias vidas
    // enquanto a rede continua em contacto com o mesmo perigo.
    this.proximaColisaoAnimal = 0;
    this.duracaoProtecaoAnimal = 1200;

    this.criarObjetosDoNivel();
  }

  // ---------- Preparação de cada nível ----------

  criarObjetosDoNivel() {
    this.lixo = [];
    this.animais = [];

    const tiposLixo = ['GARRAFA', 'SACO', 'COPO', 'LIXO', 'EMBALAGEM'];

    // Começamos com cinco resíduos no ecrã. Os restantes aparecem
    // progressivamente à medida que o jogador recolhe os existentes.
    for (let i = 0; i < 5; i++) {
      const posicao = this.gerarPosicaoLivre(28, this.lixo, []);
      this.lixo.push(
        new Collectible(posicao.x, posicao.y, tiposLixo[i])
      );
    }

    const quantidadeAnimais = this.nivel + 1;
    const velocidade = this.nivel === 1 ? 0 : (this.nivel === 2 ? 0.65 : 1.05);

    for (let i = 0; i < quantidadeAnimais; i++) {
      const posicao = this.gerarPosicaoLivre(
        28,
        this.lixo,
        this.animais
      );

      this.animais.push({
        x: posicao.x,
        y: posicao.y,
        tamanho: 54,
        vx: velocidade === 0 ? 0 : random([-velocidade, velocidade]),
        vy: velocidade === 0 ? 0 : random([-velocidade * 0.55, velocidade * 0.55]),
        velocidade: this.nivel === 3 ? 0.85 : velocidade
      });
    }

    this.proximoLixo = millis() + 1200;
  }

  // Gera uma posição que não esteja demasiado perto de outros objetos
  // nem da rede, para evitar sobreposições logo ao aparecer.
  gerarPosicaoLivre(raio, lixoExistente = [], animaisExistentes = []) {
    const centroRedeX = this.rede.x + this.rede.largura / 2;
    const centroRedeY = this.rede.y + this.rede.altura / 2;

    for (let tentativa = 0; tentativa < 45; tentativa++) {
      const x = random(50 + raio, width - 50 - raio);
      const y = random(145 + raio, height - 75 - raio);

      const pertoDoLixo = lixoExistente.some(obj =>
        dist(x, y, obj.x, obj.y) < 78
      );

      const pertoDeAnimal = animaisExistentes.some(obj =>
        dist(x, y, obj.x, obj.y) < 95
      );

      const pertoDaRede =
        dist(x, y, centroRedeX, centroRedeY) < 125;

      if (!pertoDoLixo && !pertoDeAnimal && !pertoDaRede) {
        return { x, y };
      }
    }

    // Alternativa caso o cenário esteja demasiado cheio.
    return {
      x: random(50 + raio, width - 50 - raio),
      y: random(145 + raio, height - 75 - raio)
    };
  }

  // ---------- Ciclo principal ----------

  desenhar() {
    if (this.estado === 'menu') {
      this.mostrarEcraInicial();
      return;
    }

    if (this.estado === 'calibracao') {
      this.audioController.atualizar();

      if (this.audioController.erro || !this.audioController.pronto) {
        this.mostrarEcraCalibracao();
        return;
      }

      // O tempo só começa depois da calibração.
      this.estado = 'jogo';
      this.inicioSegmentoTempo = millis();
    }

    if (this.estado === 'jogo') {
      this.audioController.atualizar();
      this.mostrarJogo();
      return;
    }

    if (this.estado === 'nivelConcluido') {
      this.mostrarNivelConcluido();
      return;
    }

    if (this.estado === 'resultado') {
      this.mostrarResultado();
    }
  }

  // ---------- Ecrã inicial ----------

  mostrarEcraInicial() {
    background('#e8f4f2');

    // A onda fica mais abaixo para não atravessar o botão.
    noStroke();
    fill('#0b7285');
    rect(0, height * 0.77, width, height * 0.23);

    fill('#14919b');
    ellipse(width / 2, height * 0.78, width * 1.25, height * 0.14);

    textAlign(CENTER, CENTER);
    fill('#073b4c');
    textStyle(BOLD);
    textSize(44);
    text('Coast Guardians', width / 2, height * 0.23);

    textStyle(NORMAL);
    textSize(20);
    text('Coastal Zone Protection', width / 2, height * 0.33);

    textSize(15);
    text(
      'Recolhe resíduos e protege os animais marinhos.',
      width / 2,
      height * 0.42
    );

    text(
      'Move a rede com o rato e ativa-a com um som.',
      width / 2,
      height * 0.47
    );

    textStyle(BOLD);
    textSize(14);
    text(
      '3 níveis: fácil, intermédio e difícil',
      width / 2,
      height * 0.53
    );

    // Botão de início.
    rectMode(CENTER);
    noStroke();
    fill('#073b4c');
    rect(width / 2, height * 0.62, 220, 48, 8);

    fill('#ffffff');
    textStyle(BOLD);
    textSize(17);
    text('COMEÇAR JOGO', width / 2, height * 0.62);

    rectMode(CORNER);

    textStyle(NORMAL);
    fill('#073b4c');
    textSize(12);
    text(
      'O microfone será calibrado durante 3 segundos.',
      width / 2,
      height * 0.70
    );
  }

  // ---------- Calibração do microfone ----------

  mostrarEcraCalibracao() {
    background('#e8f4f2');

    textAlign(CENTER, CENTER);
    fill('#073b4c');
    textStyle(BOLD);
    textSize(30);
    text('Preparar o microfone', width / 2, height * 0.31);

    textStyle(NORMAL);
    textSize(15);

    // IMPORTANTE: a caixa de texto começa à esquerda da tela.
    // Se começasse em width / 2, a mensagem ficaria cortada.
    text(
      this.audioController.mensagem,
      30,
      height * 0.40,
      width - 60,
      65
    );

    const larguraBarra = Math.min(360, width - 80);
    const xBarra = (width - larguraBarra) / 2;
    const yBarra = height * 0.56;

    noStroke();
    fill('#c8d7d6');
    rect(xBarra, yBarra, larguraBarra, 18, 9);

    fill('#14919b');
    rect(
      xBarra,
      yBarra,
      larguraBarra * this.audioController.progressoCalibracao(),
      18,
      9
    );

    fill(this.audioController.erro ? '#a3332b' : '#52616b');
    textSize(13);

    let instrucoes = 'Mantém o ambiente silencioso durante 3 segundos.';
    if (this.audioController.erro) {
      instrucoes = 'Verifica a permissão do microfone e clica para tentar novamente.';
    } else if (this.audioController.pronto) {
      instrucoes = 'Calibração concluída.';
    }

    text(instrucoes, 30, height * 0.64, width - 60, 42);
  }

  // ---------- Temporizador ----------

  obterTempoRestante() {
    let tempoDecorrido = this.tempoUsadoMs;

    if (this.estado === 'jogo' && this.inicioSegmentoTempo > 0) {
      tempoDecorrido += millis() - this.inicioSegmentoTempo;
    }

    const tempoTotalMs = this.duracaoJogo * 1000;

    return Math.max(
      0,
      Math.ceil((tempoTotalMs - tempoDecorrido) / 1000)
    );
  }

  pausarTemporizador() {
    if (this.inicioSegmentoTempo > 0) {
      this.tempoUsadoMs += millis() - this.inicioSegmentoTempo;
      this.inicioSegmentoTempo = 0;
    }
  }

  // ---------- Interface do jogo ----------

  mostrarJogo() {
    const tempoRestante = this.obterTempoRestante();

    if (tempoRestante <= 0) {
      this.terminarJogo('tempo');
      return;
    }

    background('#d8f0f2');

    // Cabeçalho dividido em duas linhas para melhorar a leitura.
    noStroke();
    fill('#bde7ee');
    rect(0, 0, width, 112);

    fill('#073b4c');
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(17);
    text('Coast Guardians', 16, 23);

    textStyle(NORMAL);
    textSize(12);
    text(`Pontos: ${this.pontuacao}`, 205, 23);
    text(`Vidas: ${this.vidas}`, 285, 23);

    const minutos = floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    const tempoFormatado =
      `${String(minutos).padStart(2, '0')}:` +
      `${String(segundos).padStart(2, '0')}`;

    text(`Tempo: ${tempoFormatado}`, 365, 23);
    text(`Nível: ${this.nivel}/3`, 465, 23);

    // Segunda linha: saúde costeira.
    textStyle(BOLD);
    textSize(10);
    text('Saúde', 16, 65);

    textStyle(NORMAL);
    fill('#c8d7d6');
    rect(57, 59, 135, 12, 6);

    fill('#258a65');
    rect(
      57,
      59,
      135 * this.saudeCosteira / 100,
      12,
      6
    );

    fill('#073b4c');
    text(`${Math.round(this.saudeCosteira)}%`, 198, 65);

    // Estado do microfone.
    textSize(11);
    text(
      `MIC: ${this.audioController.autorizado ? 'DISPONÍVEL' : 'INDISPONÍVEL'}`,
      255,
      65
    );

    // Estado da rede e duração da ativação.
    const segundosRede = this.audioController.redeAtiva
      ? Math.max(
          0,
          Math.ceil(
            (this.audioController.ativacaoTerminaEm - millis()) / 1000
          )
        )
      : 0;

    text(
      `REDE: ${this.audioController.redeAtiva ? 'ATIVA' : 'INATIVA'}`,
      430,
      65
    );

    text(
      this.audioController.redeAtiva
        ? `${segundosRede}s restantes`
        : 'À espera de som',
      535,
      65
    );

    text(
      `Resíduos: ${this.residuosNoNivel}/${this.metasNivel[this.nivel - 1]}`,
      655,
      65
    );

    // Mensagem de estado na parte inferior do cabeçalho.
    fill('#073b4c');
    textSize(11);
    text(
      this.audioController.mensagem,
      16,
      94,
      width - 32,
      16
    );

    // Área principal de jogo.
    noStroke();
    fill('#c8ebef');
    rect(0, 112, width, height - 150);

    this.moverRede();
    this.atualizarAnimais();

    if (this.audioController.redeAtiva) {
      this.verificarColisoes();
    }

    // Se foi concluído o nível, mostrar apenas a transição.
    if (this.estado !== 'jogo') {
      return;
    }

    this.atualizarAparecimentoDeLixo();

    for (const objeto of this.lixo) {
      objeto.desenhar();
    }

    this.desenharAnimais();
    this.desenharRede();

    fill('#073b4c');
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);
    textSize(12);
    text(
      'Rato: mover a rede | Som: ativar durante 10 segundos',
      16,
      height - 20
    );

    if (this.vidas <= 0) {
      this.terminarJogo('vidas');
    } else if (this.saudeCosteira <= 0) {
      this.terminarJogo('saude');
    }
  }

  // ---------- Movimento da rede ----------

  moverRede() {
    this.rede.x = constrain(
      mouseX - this.rede.largura / 2,
      0,
      width - this.rede.largura
    );

    this.rede.y = constrain(
      mouseY - this.rede.altura / 2,
      115,
      height - this.rede.altura - 30
    );
  }

  // ---------- Movimento dos animais ----------

  atualizarAnimais() {
    for (const animal of this.animais) {
      if (this.nivel === 3) {
        // No nível 3, os animais aproximam-se da rede.
        const alvoX = this.rede.x + this.rede.largura / 2;
        const alvoY = this.rede.y + this.rede.altura / 2;

        const dx = alvoX - animal.x;
        const dy = alvoY - animal.y;
        const distancia = Math.max(1, Math.sqrt(dx * dx + dy * dy));

        animal.x += (dx / distancia) * animal.velocidade;
        animal.y += (dy / distancia) * animal.velocidade;
      } else {
        // No nível 1 ficam parados; no nível 2 deslocam-se
        // e mudam de direção ao chegar aos limites do cenário.
        animal.x += animal.vx;
        animal.y += animal.vy;

        const raio = animal.tamanho / 2;

        if (animal.x < raio || animal.x > width - raio) {
          animal.vx *= -1;
          animal.x = constrain(animal.x, raio, width - raio);
        }

        if (animal.y < 145 + raio || animal.y > height - 75 - raio) {
          animal.vy *= -1;
          animal.y = constrain(animal.y, 145 + raio, height - 75 - raio);
        }
      }

      // Manter todos os animais dentro da área de jogo.
      const raio = animal.tamanho / 2;
      animal.x = constrain(animal.x, raio, width - raio);
      animal.y = constrain(animal.y, 145 + raio, height - 75 - raio);
    }
  }

  
desenharAnimais() {
  for (let i = 0; i < this.animais.length; i++) {
    const animal = this.animais[i];

    // Animação suave para dar vida aos animais.
    const flutuacao = sin(frameCount * 0.05 + i) * 2;

    push();
    translate(animal.x, animal.y + flutuacao);
    strokeWeight(1.5);

    // PEIXE
    if (i % 3 === 0) {
      stroke('#9a6737');
      fill('#efb866');

      // Cauda
      triangle(-12, 0, -27, -10, -27, 10);

      // Corpo
      ellipse(0, 0, 36, 24);

      // Barbatana superior
      fill('#dfa04b');
      triangle(-5, -8, 2, -17, 9, -8);

      // Olho
      noStroke();
      fill('#ffffff');
      circle(10, -3, 7);

      fill('#073b4c');
      circle(11, -3, 3);

      // Brânquias
      stroke('#b47838');
      line(4, -5, 3, 5);
    }

    // TARTARUGA
    else if (i % 3 === 1) {
      // Patas
      stroke('#39755d');
      fill('#91c8a4');

      ellipse(-10, -12, 13, 9);
      ellipse(-10, 12, 13, 9);
      ellipse(7, -12, 13, 9);
      ellipse(7, 12, 13, 9);

      // Cabeça
      ellipse(21, 0, 14, 12);

      // Carapaça
      stroke('#39755d');
      fill('#4e9879');
      ellipse(-2, 0, 32, 26);

      // Padrão da carapaça
      stroke('#c5e5c8');
      noFill();
      ellipse(-2, 0, 19, 17);
      line(-2, -8, -2, 8);
      line(-10, 0, 6, 0);

      // Olho
      noStroke();
      fill('#073b4c');
      circle(23, -2, 2.5);
    }

    // MEDUSA
    else {
      // Tentáculos
      stroke('#8273b6');
      strokeWeight(2);

      line(-11, 5, -14, 17);
      line(-4, 7, -3, 20);
      line(4, 7, 7, 18);
      line(11, 5, 15, 15);

      // Corpo
      stroke('#8273b6');
      strokeWeight(1.5);
      fill('#c5b8ee');

      arc(0, 0, 38, 34, PI, TWO_PI, CHORD);

      // Parte inferior
      noStroke();
      fill('#a99add');
      ellipse(0, 0, 33, 9);

      // Reflexos
      fill('#ffffff');
      circle(-7, -5, 4);
      circle(2, -9, 3);
      circle(9, -4, 4);
    }

    pop();
  }

  // Restaurar o estilo normal do texto.
  textStyle(NORMAL);


  }

  // ---------- Desenho da rede ----------

  desenharRede() {
    const r = this.rede;

    rectMode(CORNER);
    stroke(this.audioController.redeAtiva ? '#e08d31' : '#073b4c');
    strokeWeight(2);

    if (this.audioController.redeAtiva) {
      fill(239, 164, 74, 105);
    } else {
      fill(255, 255, 255, 75);
    }

    rect(r.x, r.y, r.largura, r.altura);

    stroke('#14919b');
    strokeWeight(1);

    for (let i = 1; i < 4; i++) {
      const px = r.x + r.largura * i / 4;
      const py = r.y + r.altura * i / 4;

      line(px, r.y, px, r.y + r.altura);
      line(r.x, py, r.x + r.largura, py);
    }

    stroke('#073b4c');
    strokeWeight(5);
    line(
      r.x + r.largura,
      r.y + r.altura / 2,
      r.x + r.largura + 18,
      r.y + r.altura / 2
    );

    strokeWeight(1);
  }

  // ---------- Colisões ----------

  verificarColisoes() {
    if (!this.audioController.redeAtiva) {
      return;
    }

    // Resíduos.
    for (let i = this.lixo.length - 1; i >= 0; i--) {
      const objeto = this.lixo[i];

      if (this.colideComRede(objeto)) {
        this.lixo.splice(i, 1);

        this.pontuacao += 10;
        this.residuosTotal++;
        this.residuosNoNivel++;
        this.audioController.tocarSomRecolha();

        // A saúde melhora um pouco por cada resíduo recolhido.
        this.saudeCosteira = Math.min(
          100,
          this.saudeCosteira + (65 / 36)
        );
      }
    }

    const metaAtual = this.metasNivel[this.nivel - 1];

    if (this.residuosNoNivel >= metaAtual) {
      this.passarNivel();
      return;
    }

    // Evitar perder várias vidas em frames consecutivos.
    if (millis() >= this.proximaColisaoAnimal) {
      for (const animal of this.animais) {
        if (this.colideComRede(animal)) {
          this.vidas = Math.max(0, this.vidas - 1);
          this.audioController.tocarSomPerdaVida();
          this.saudeCosteira = Math.max(0, this.saudeCosteira - 12);

          this.proximaColisaoAnimal =
            millis() + this.duracaoProtecaoAnimal;

          this.reposicionarAnimalLongeDaRede(animal);
          break;
        }
      }
    }
  }

  colideComRede(objeto) {
    const largura = objeto.largura ?? objeto.tamanho;
    const altura = objeto.altura ?? objeto.tamanho;

    const esquerdaObjeto = objeto.x - largura / 2;
    const direitaObjeto = objeto.x + largura / 2;
    const topoObjeto = objeto.y - altura / 2;
    const fundoObjeto = objeto.y + altura / 2;

    const r = this.rede;

    return (
      r.x < direitaObjeto &&
      r.x + r.largura > esquerdaObjeto &&
      r.y < fundoObjeto &&
      r.y + r.altura > topoObjeto
    );
  }

  reposicionarAnimalLongeDaRede(animal) {
    const centroX = this.rede.x + this.rede.largura / 2;
    const centroY = this.rede.y + this.rede.altura / 2;

    for (let tentativa = 0; tentativa < 20; tentativa++) {
      const x = random(70, width - 70);
      const y = random(150, height - 90);

      if (dist(x, y, centroX, centroY) > 150) {
        animal.x = x;
        animal.y = y;
        return;
      }
    }

    animal.x = centroX < width / 2 ? width - 80 : 80;
    animal.y = random(150, height - 90);
  }

  // ---------- Reaparecimento do lixo ----------

  atualizarAparecimentoDeLixo() {
    const intervalos = {
      1: 1500,
      2: 1100,
      3: 750
    };

    if (this.lixo.length < 5 && millis() >= this.proximoLixo) {
      const tipos = ['GARRAFA', 'SACO', 'COPO', 'LIXO', 'EMBALAGEM'];
      const posicao = this.gerarPosicaoLivre(28, this.lixo, this.animais);

      this.lixo.push(
        new Collectible(posicao.x, posicao.y, random(tipos))
      );

      this.proximoLixo = millis() + intervalos[this.nivel];
    }
  }

  // ---------- Transições entre níveis ----------

  passarNivel() {
    if (this.nivel === 3) {
      this.terminarJogo('vitoria');
      return;
    }

    this.nivelConcluido = this.nivel;

    // Pausar o tempo e desativar a rede durante a transição.
    this.pausarTemporizador();
    this.audioController.redeAtiva = false;
    this.audioController.ativacaoTerminaEm = 0;

    this.estado = 'nivelConcluido';
  }

  mostrarNivelConcluido() {
    background('#e8f4f2');

    textAlign(CENTER, CENTER);
    fill('#073b4c');
    textStyle(BOLD);
    textSize(32);

    text(
      `Nível ${this.nivelConcluido} concluído!`,
      width / 2,
      height * 0.23
    );

    textStyle(NORMAL);
    textSize(18);

    text(
      `Recolheste ${this.metasNivel[this.nivelConcluido - 1]} resíduos nesta fase.`,
      width / 2,
      height * 0.34
    );

    text(
      `Pontuação: ${this.pontuacao}  |  Vidas: ${this.vidas}`,
      width / 2,
      height * 0.42
    );

    text(
      `Tempo restante: ${this.obterTempoRestante()} segundos`,
      width / 2,
      height * 0.49
    );

    let descricao = '';

    if (this.nivelConcluido === 1) {
      descricao = 'No próximo nível, os animais começam a mover-se.';
    } else {
      descricao = 'No próximo nível, os animais aproximam-se da rede.';
    }

    text(descricao, width / 2, height * 0.56);

    rectMode(CENTER);
    noStroke();
    fill('#073b4c');
    rect(width / 2, height * 0.68, 300, 48, 8);

    fill('#ffffff');
    textStyle(BOLD);
    textSize(15);

    text(
      `COMEÇAR NÍVEL ${this.nivelConcluido + 1}`,
      width / 2,
      height * 0.68
    );

    rectMode(CORNER);

    fill('#52616b');
    textStyle(NORMAL);
    textSize(12);

    text(
      'A fase seguinte só começa quando clicares no botão.',
      width / 2,
      height * 0.77
    );
  }

  iniciarProximoNivel() {
  this.nivel++;
  this.residuosNoNivel = 0;

  // Posicionar primeiro a rede.
  this.rede.x = width / 2 - this.rede.largura / 2;
  this.rede.y = height / 2 - this.rede.altura / 2;

  // Criar os objetos longe da posição inicial da rede.
  this.criarObjetosDoNivel();

  this.audioController.redeAtiva = false;
  this.audioController.ativacaoTerminaEm = 0;
this.audioController.mensagem =
  'Nível iniciado. Faz um som para ativar a rede.';
  if (
    this.audioController.volume <=
    this.audioController.limiarDesativar
  ) {
    this.audioController.somPronto = true;
  }

  this.inicioSegmentoTempo = millis();
  this.estado = 'jogo';
}

  // ---------- Fim de jogo ----------

  terminarJogo(tipo) {
    if (this.estado === 'resultado') {
      return;
    }

    this.pausarTemporizador();
    this.audioController.redeAtiva = false;

    this.resultadoTipo = tipo;
    this.estado = 'resultado';
  }

  mostrarResultado() {
    background('#e8f4f2');

    textAlign(CENTER, CENTER);
    fill('#073b4c');
    textStyle(BOLD);
    textSize(36);

    if (this.resultadoTipo === 'vitoria') {
      text('Missão concluída!', width / 2, height * 0.23);
    } else if (this.resultadoTipo === 'vidas') {
      text('Ficaste sem vidas!', width / 2, height * 0.23);
    } else if (this.resultadoTipo === 'saude') {
      text('A costa ficou em perigo!', width / 2, height * 0.23);
    } else {
      text('Tempo esgotado!', width / 2, height * 0.23);
    }

    textStyle(NORMAL);
    textSize(21);

    text(`Pontuação final: ${this.pontuacao}`, width / 2, height * 0.36);
    text(`Resíduos recolhidos: ${this.residuosTotal}`, width / 2, height * 0.43);
    text(`Nível alcançado: ${this.nivel}/3`, width / 2, height * 0.50);
    text(`Saúde costeira: ${Math.round(this.saudeCosteira)}%`, width / 2, height * 0.57);

    rectMode(CENTER);
    noStroke();
    fill('#073b4c');
    rect(width / 2, height * 0.70, 260, 46, 8);

    fill('#ffffff');
    textStyle(BOLD);
    textSize(15);
    text('VOLTAR AO MENU', width / 2, height * 0.70);

    rectMode(CORNER);
  }

  // ---------- Tratamento dos cliques ----------

  tratarClique() {
    if (this.estado === 'menu') {
      const dentroBotao =
        mouseX >= width / 2 - 110 &&
        mouseX <= width / 2 + 110 &&
        mouseY >= height * 0.62 - 24 &&
        mouseY <= height * 0.62 + 24;

      if (dentroBotao) {
        this.estado = 'calibracao';
        this.audioController.iniciar();
      }

      return;
    }

    if (this.estado === 'calibracao' && this.audioController.erro) {
      this.audioController.iniciar();
      return;
    }

    if (this.estado === 'nivelConcluido') {
      const dentroBotao =
        mouseX >= width / 2 - 150 &&
        mouseX <= width / 2 + 150 &&
        mouseY >= height * 0.68 - 24 &&
        mouseY <= height * 0.68 + 24;

      if (dentroBotao) {
        this.iniciarProximoNivel();
      }

      return;
    }

    if (this.estado === 'resultado') {
      const dentroBotao =
        mouseX >= width / 2 - 130 &&
        mouseX <= width / 2 + 130 &&
        mouseY >= height * 0.70 - 23 &&
        mouseY <= height * 0.70 + 23;

      if (dentroBotao) {
        this.reiniciarPartida();
      }
    }
  }

  reiniciarPartida() {
    this.audioController.parar();
    this.audioController = new AudioController();

    this.estado = 'menu';
    this.resultadoTipo = '';
    this.nivel = 1;
    this.nivelConcluido = 1;

    this.residuosNoNivel = 0;
    this.residuosTotal = 0;

    this.pontuacao = 0;
    this.vidas = 3;
    this.saudeCosteira = 35;

    this.tempoUsadoMs = 0;
    this.inicioSegmentoTempo = 0;

    this.proximaColisaoAnimal = 0;

    this.rede.x = width / 2 - this.rede.largura / 2;
    this.rede.y = height / 2 - this.rede.altura / 2;

    this.criarObjetosDoNivel();
  }
}
