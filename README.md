# Coast Guardians

Projeto académico para a disciplina de **Sistemas Multimédia**. O tema atribuído é **Coastal Zone Protection**. O jogo será desenvolvido com p5.js.

## Objetivo do jogo

Sensibilizar para a proteção das zonas costeiras através de uma experiência interativa. O jogador deverá recolher resíduos marinhos e evitar animais marinhos.

## Mecânica prevista

O jogador movimenta uma rede com o rato. A rede será ativada quando o volume captado pelo microfone ultrapassar um limiar definido. Ao entrar em contacto com os objetos do cenário, a rede deverá recolher resíduos e evitar os animais marinhos. A partida deverá incluir pontuação, vidas e um temporizador.

## Controlos previstos

- **Rato:** movimentar a rede pelo cenário.
- **Microfone:** ativar a rede através do volume da voz ou de outro som captado.
- **Calibração:** ajustar o limiar do microfone ao ambiente antes de jogar.

A interação por microfone deverá usar **histerese**, com limiares distintos para ativar e desativar a rede, para reduzir ativações instáveis perto do limiar.

## Funcionalidades planeadas

- Objetos do jogo apresentados em posições aleatórias.
- Deteção de colisões entre a rede e os objetos.
- Recolha de resíduos e penalização por contacto com animais marinhos.
- Sistema de pontuação, vidas e temporizador.
- Efeitos sonoros para eventos do jogo.
- Calibração do microfone e ativação da rede com histerese.
- Três estados de jogo: ecrã inicial, partida em curso e resultado/fim de jogo.
- Indicador original de **saúde costeira**, que representa o impacto das ações do jogador no ambiente.

Estas funcionalidades são objetivos de desenvolvimento e ainda não estão implementadas.

## Estado atual do projeto

Nesta fase foi criada apenas a estrutura inicial de pastas e este documento. O jogo em p5.js ainda não foi implementado.

## Estrutura de pastas

```text
CoastGuardians/
├── assets/
│   ├── audio/
│   └── images/
├── report/
├── src/
└── README.md
```
