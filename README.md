Coast Guardians
Projeto individual da unidade curricular Sistemas Multimédia, do curso de Engenharia da Computação Gráfica e Multimédia (ECGM), IPVC, ano letivo 2026/2027.

Tema: Coastal Zone Protection.
Objetivo
Recolher resíduos do oceano com uma rede controlada pelo rato e ativada pelo volume captado pelo microfone, evitando atingir animais marinhos. A saúde costeira representa o impacto das ações do jogador.
Mecânica
- Três níveis com metas de 8, 12 e 16 resíduos.
- Cada resíduo recolhido atribui 10 pontos e melhora a saúde costeira.
- O contacto com um animal retira uma vida e reduz a saúde costeira.
- A calibração do microfone dura 3 segundos; a ativação da rede dura 10 segundos.
- A interface mostra pontuação, vidas, tempo, nível, saúde costeira e estado do microfone/rede.
- Os efeitos de recolha e perda de vida são ficheiros WAV em assets/audio/.
Estrutura
- index.html: página e carregamento de p5.js/p5.sound e dos módulos do jogo.
- src/sketch.js: ponto de entrada do p5.js e eventos de rato.
- src/Game.js: estados, interface, níveis, objetos, movimento, colisões e resultados.
- src/Collectible.js: desenho dos resíduos.
- src/AudioController.js: microfone, calibração, histerese e reprodução de efeitos sonoros.
- assets/audio/: recolha.wav e perda_vida.wav.
- assets/images/: fundo marinho e ícones da interface.
Executar
Abrir a pasta do projeto no VS Code e iniciar um servidor local, por exemplo Live Server, ou colocar a pasta em C:\xampp\htdocs\CoastGuardians, iniciar Apache no XAMPP e abrir http://localhost/CoastGuardians/. O acesso ao microfone exige autorização do navegador. As bibliotecas p5.js/p5.sound são carregadas a partir de CDN, pelo que é necessária ligação à Internet.
Créditos e IA
O ChatGPT foi utilizado como apoio à explicação de APIs, revisão e depuração de código e documentação. O fundo e os ícones foram gerados com apoio de IA para este projeto. Os WAV foram criados por síntese programática, sem samples externos. Registar a utilização no diário de desenvolvimento e rever a descrição para que corresponda às alterações efetivamente integradas.
Repositório
https://github.com/laurindogoncalo/CoastGuardians