
class AudioController {
  constructor() {
    this.microfone = null;

    this.iniciado = false;
    this.autorizado = false;
    this.calibrando = false;
    this.pronto = false;
    this.erro = false;

    // Estado da rede.
    this.redeAtiva = false;
    this.duracaoAtivacao = 10000;
    this.ativacaoTerminaEm = 0;

    // Medição do som ambiente.
    this.volume = 0;
    this.ruidoAmbiente = 0;

    this.limiarAtivar = 0.055;
    this.limiarDesativar = 0.03;

    this.duracaoCalibracao = 3000;
    this.inicioCalibracao = 0;
    this.somaVolume = 0;
    this.totalAmostras = 0;

    this.somPronto = false;

    // Evita tocar muitos sons de recolha ao mesmo tempo.
    this.ultimoSomRecolha = 0;

    this.mensagem = 'Clica em COMEÇAR JOGO para iniciar.';
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
        'A biblioteca de áudio não carregou. Verifica a Internet.';
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

    // Calibração do ruído ambiente durante 3 segundos.
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

        // Garantir que o limiar de desligar é inferior.
        if (this.limiarDesativar >= this.limiarAtivar) {
          this.limiarDesativar =
            this.limiarAtivar * 0.7;
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

    // A ativação termina quando acabam os 30 segundos.
    if (
      this.redeAtiva &&
      agora >= this.ativacaoTerminaEm
    ) {
      this.redeAtiva = false;
      this.mensagem =
        'Tempo terminado. Faz um novo som para reativar a rede.';
    }

    // O sistema fica preparado para outro som quando
    // o volume regressa ao limiar inferior.
    if (this.volume <= this.limiarDesativar) {
      this.somPronto = true;
    }

    // Histerese: o som precisa de ultrapassar o limiar superior.
    if (
      this.somPronto &&
      this.volume >= this.limiarAtivar
    ) {
      this.somPronto = false;

      if (!this.redeAtiva) {
        this.redeAtiva = true;
        this.ativacaoTerminaEm =
          agora + this.duracaoAtivacao;
      }
    }

    if (this.redeAtiva) {
      const segundosRestantes = Math.max(
        0,
        Math.ceil(
          (this.ativacaoTerminaEm - agora) / 1000
        )
      );

      this.mensagem =
        `Rede ativa! ${segundosRestantes} segundos restantes.`;
    }
  }

  // Som curto e ascendente quando recolhemos resíduos.
  tocarSomRecolha() {
    const agora = millis();

    // Evitar uma sobreposição de sons se dois objetos
    // forem recolhidos praticamente ao mesmo tempo.
    if (agora - this.ultimoSomRecolha < 100) {
      return;
    }

    this.ultimoSomRecolha = agora;

    this.tocarEfeito(520, 880, 0.16, 'sine', 0.075);
  }

  // Som grave e descendente quando perdemos uma vida.
  tocarSomPerdaVida() {
    this.tocarEfeito(260, 85, 0.38, 'triangle', 0.11);
  }

  // Gera um efeito sonoro sem precisar de ficheiros externos.
  tocarEfeito(frequenciaInicial, frequenciaFinal,
              duracao, tipo, volume) {
    try {
      const contexto = getAudioContext();

      // O jogo já deve ter sido iniciado por um clique.
      if (contexto.state === 'suspended') {
        userStartAudio();
      }

      const agora = contexto.currentTime;
      const oscilador = contexto.createOscillator();
      const ganho = contexto.createGain();

      oscilador.type = tipo;

      oscilador.frequency.setValueAtTime(
        frequenciaInicial,
        agora
      );

      oscilador.frequency.exponentialRampToValueAtTime(
        frequenciaFinal,
        agora + duracao * 0.8
      );

      // Entrada e saída suaves para evitar estalidos.
      ganho.gain.setValueAtTime(0.0001, agora);

      ganho.gain.exponentialRampToValueAtTime(
        volume,
        agora + 0.02
      );

      ganho.gain.exponentialRampToValueAtTime(
        0.0001,
        agora + duracao
      );

      oscilador.connect(ganho);
      ganho.connect(contexto.destination);

      oscilador.start(agora);
      oscilador.stop(agora + duracao + 0.02);

      oscilador.onended = () => {
        oscilador.disconnect();
        ganho.disconnect();
      };
    } catch (erro) {
      console.warn('Não foi possível reproduzir o som:', erro);
    }
  }

  progressoCalibracao() {
    if (!this.calibrando) {
      return this.pronto ? 1 : 0;
    }

    return constrain(
      (millis() - this.inicioCalibracao) /
        this.duracaoCalibracao,
      0,
      1
    );
  }

  parar() {
    if (this.microfone) {
      this.microfone.stop();
      this.microfone = null;
    }

    this.iniciado = false;
    this.autorizado = false;
    this.calibrando = false;
    this.pronto = false;
    this.redeAtiva = false;
    this.somPronto = false;
  }
}
