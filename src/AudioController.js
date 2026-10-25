// Controla o microfone e reproduz efeitos sonoros a partir de ficheiros WAV.
// Os ficheiros de áudio do projeto estão em assets/audio/.
class AudioController {
  constructor() {
    this.microfone = null;

    this.iniciado = false;
    this.autorizado = false;
    this.calibrando = false;
    this.pronto = false;
    this.erro = false;

    // Estado da rede: mantém os 10 segundos escolhidos para o jogo.
    this.redeAtiva = false;
    this.duracaoAtivacao = 10000;
    this.ativacaoTerminaEm = 0;

    // Medição do som ambiente.
    this.volume = 0;
    this.ruidoAmbiente = 0;
    this.limiarAtivar = 0.055;
    this.limiarDesativar = 0.03;

    // Calibração do ruído de fundo durante 3 segundos.
    this.duracaoCalibracao = 3000;
    this.inicioCalibracao = 0;
    this.somaVolume = 0;
    this.totalAmostras = 0;

    // Histerese: só volta a aceitar um som quando o volume baixa.
    this.somPronto = false;

    // Ficheiros de som.
    this.somRecolha = null;
    this.somPerdaVida = null;
    this.somRecolhaCarregado = false;
    this.somPerdaVidaCarregado = false;
    this.ultimoSomRecolha = 0;
    this.erroCarregamentoAudio = false;

    this.mensagem = 'Clica em COMEÇAR JOGO para iniciar.';

    this.carregarEfeitosSonoros();
  }

  carregarEfeitosSonoros() {
    if (typeof loadSound !== 'function') {
      this.erroCarregamentoAudio = true;
      console.error(
        'p5.sound não está carregado. Confirma o script p5.sound no index.html.'
      );
      return;
    }

    this.somRecolha = loadSound(
      'assets/audio/recolha.wav',
      () => {
        this.somRecolhaCarregado = true;
        this.somRecolha.setVolume(0.5);
        this.somRecolha.playMode('restart');
        console.log('Som de recolha carregado.');
      },
      (erro) => {
        this.erroCarregamentoAudio = true;
        console.error('Não foi possível carregar assets/audio/recolha.wav', erro);
      }
    );

    this.somPerdaVida = loadSound(
      'assets/audio/perda_vida.wav',
      () => {
        this.somPerdaVidaCarregado = true;
        this.somPerdaVida.setVolume(0.6);
        this.somPerdaVida.playMode('restart');
        console.log('Som de perda de vida carregado.');
      },
      (erro) => {
        this.erroCarregamentoAudio = true;
        console.error('Não foi possível carregar assets/audio/perda_vida.wav', erro);
      }
    );
  }

  iniciar() {
    if (this.iniciado && !this.erro) {
      return;
    }

    if (
      typeof p5 === 'undefined' ||
      typeof p5.AudioIn === 'undefined'
    ) {
      this.erro = true;
      this.mensagem =
        'A biblioteca de áudio não carregou. Verifica a ligação à Internet.';
      return;
    }

    this.iniciado = true;
    this.erro = false;
    this.autorizado = false;
    this.calibrando = false;
    this.pronto = false;
    this.redeAtiva = false;
    this.somPronto = false;

    this.mensagem =
      'A pedir autorização para usar o microfone...';

    try {
      userStartAudio();
      this.microfone = new p5.AudioIn();

      this.microfone.start(
        () => {
          this.autorizado = true;
          this.calibrando = true;
          this.inicioCalibracao = millis();
          this.somaVolume = 0;
          this.totalAmostras = 0;
          this.volume = 0;

          this.mensagem =
            'Mantém o ambiente silencioso durante 3 segundos.';
        },
        () => {
          this.iniciado = false;
          this.autorizado = false;
          this.calibrando = false;
          this.pronto = false;
          this.erro = true;

          this.mensagem =
            'Não foi possível aceder ao microfone. Verifica as permissões.';
        }
      );
    } catch (erro) {
      this.iniciado = false;
      this.erro = true;
      this.mensagem =
        'Erro ao iniciar o microfone. Verifica a consola.';
      console.error('Erro ao iniciar o microfone:', erro);
    }
  }

  atualizar() {
    if (!this.autorizado || !this.microfone) {
      return;
    }

    const agora = millis();
    this.volume = this.microfone.getLevel();

    if (this.calibrando) {
      this.somaVolume += this.volume;
      this.totalAmostras++;

      if (agora - this.inicioCalibracao >= this.duracaoCalibracao) {
        this.ruidoAmbiente =
          this.somaVolume / Math.max(1, this.totalAmostras);

        this.limiarAtivar = Math.max(
          0.055,
          this.ruidoAmbiente * 2,
          this.ruidoAmbiente + 0.025
        );

        this.limiarDesativar = Math.max(
          this.ruidoAmbiente * 1.2,
          this.ruidoAmbiente + 0.008,
          this.limiarAtivar * 0.55
        );

        if (this.limiarDesativar >= this.limiarAtivar) {
          this.limiarDesativar = this.limiarAtivar * 0.7;
        }

        this.calibrando = false;
        this.pronto = true;
        this.somPronto =
          this.volume <= this.limiarDesativar;

        this.mensagem =
          'Calibrado. Faz um som para ativar a rede.';
      }

      return;
    }

    if (!this.pronto) {
      return;
    }

    if (
      this.redeAtiva &&
      agora >= this.ativacaoTerminaEm
    ) {
      this.redeAtiva = false;
      this.mensagem =
        'Tempo terminado. Faz um novo som para reativar a rede.';
    }

    if (this.volume <= this.limiarDesativar) {
      this.somPronto = true;
    }

    if (
      this.somPronto &&
      this.volume >= this.limiarAtivar
    ) {
      this.somPronto = false;

      if (!this.redeAtiva) {
        this.redeAtiva = true;
        this.ativacaoTerminaEm = agora + this.duracaoAtivacao;
      }
    }

    if (this.redeAtiva) {
      const segundosRestantes = Math.max(
        0,
        Math.ceil((this.ativacaoTerminaEm - agora) / 1000)
      );

      this.mensagem =
        `Rede ativa! ${segundosRestantes} segundos restantes.`;
    }
  }

  // Reproduz o ficheiro WAV de recolha.
  tocarSomRecolha() {
    const agora = millis();

    // Evita um som repetido em vários frames muito próximos.
    if (agora - this.ultimoSomRecolha < 100) {
      return;
    }

    this.ultimoSomRecolha = agora;
    this.reproduzirFicheiro(this.somRecolha, 0.5, 'recolha');
  }

  // Reproduz o ficheiro WAV de perda de vida.
  tocarSomPerdaVida() {
    this.reproduzirFicheiro(this.somPerdaVida, 0.6, 'perda de vida');
  }

  reproduzirFicheiro(som, volume, nome) {
    try {
      if (!som || !som.isLoaded()) {
        console.warn(`O som de ${nome} ainda não está carregado.`);
        return;
      }

      // O áudio já foi desbloqueado pelo clique em COMEÇAR JOGO.
      if (typeof userStartAudio === 'function') {
        userStartAudio();
      }

      if (som.isPlaying()) {
        som.stop();
      }

      som.setVolume(volume);
      som.play();
    } catch (erro) {
      console.error(`Erro ao reproduzir som de ${nome}:`, erro);
    }
  }

  progressoCalibracao() {
    if (!this.calibrando) {
      return this.pronto ? 1 : 0;
    }

    return constrain(
      (millis() - this.inicioCalibracao) / this.duracaoCalibracao,
      0,
      1
    );
  }

  parar() {
    if (this.microfone) {
      this.microfone.stop();
      this.microfone = null;
    }

    if (this.somRecolha && this.somRecolha.isLoaded()) {
      this.somRecolha.stop();
    }

    if (this.somPerdaVida && this.somPerdaVida.isLoaded()) {
      this.somPerdaVida.stop();
    }

    this.iniciado = false;
    this.autorizado = false;
    this.calibrando = false;
    this.pronto = false;
    this.redeAtiva = false;
    this.somPronto = false;
  }
}
