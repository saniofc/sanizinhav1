// jogodavelha.js
const jogos = {}; // Armazena os jogos ativos

function criarTabuleiro(tabuleiro) {
  return `
  ${tabuleiro[0]} | ${tabuleiro[1]} | ${tabuleiro[2]}
  ---------
  ${tabuleiro[3]} | ${tabuleiro[4]} | ${tabuleiro[5]}
  ---------
  ${tabuleiro[6]} | ${tabuleiro[7]} | ${tabuleiro[8]}
`.replace(/1|2|3|4|5|6|7|8|9/g, m => `*${m}*`);
}

function verificarVitoria(tab, jogador) {
  const vitorias = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return vitorias.some(([a,b,c]) => tab[a] === jogador && tab[b] === jogador && tab[c] === jogador);
}

function criarNovoJogo(id, playerX, playerO, contraBot = false) {
  jogos[id] = {
    tabuleiro: ['1','2','3','4','5','6','7','8','9'],
    jogadorAtual: 'X',
    playerX,
    playerO,
    contraBot,
    jogando: true
  };
}

function jogar(id, jogador, posicao) {
  const jogo = jogos[id];
  if (!jogo || !jogo.jogando) return '❌ Nenhum jogo em andamento.';
  const idx = parseInt(posicao) - 1;
  if (isNaN(idx) || idx < 0 || idx > 8) return '❌ Jogada inválida.';
  if (jogo.tabuleiro[idx] === 'X' || jogo.tabuleiro[idx] === 'O') return '❌ Essa posição já foi jogada.';

  const simbolo = jogo.playerX === jogador ? 'X' : 'O';
  if (jogo.jogadorAtual !== simbolo) return '⏳ Aguarde sua vez.';

  jogo.tabuleiro[idx] = simbolo;

  // Verifica vitória
  if (verificarVitoria(jogo.tabuleiro, simbolo)) {
    jogo.jogando = false;
    return `🎉 *${simbolo} venceu!*\n${criarTabuleiro(jogo.tabuleiro)}`;
  }

  // Verifica empate
  if (!jogo.tabuleiro.some(c => !isNaN(c))) {
    jogo.jogando = false;
    return `🤝 *Empate!*\n${criarTabuleiro(jogo.tabuleiro)}`;
  }

  // Alterna jogador
  jogo.jogadorAtual = simbolo === 'X' ? 'O' : 'X';

  // Jogada do bot se for modo contra bot
  if (jogo.contraBot && jogo.jogadorAtual === 'O') {
    const livres = jogo.tabuleiro.map((v, i) => (!isNaN(v) ? i : -1)).filter(v => v >= 0);
    const jogadaBot = livres[Math.floor(Math.random() * livres.length)];
    jogo.tabuleiro[jogadaBot] = 'O';

    if (verificarVitoria(jogo.tabuleiro, 'O')) {
      jogo.jogando = false;
      return `🤖 *Bot venceu!*\n${criarTabuleiro(jogo.tabuleiro)}`;
    }

    if (!jogo.tabuleiro.some(c => !isNaN(c))) {
      jogo.jogando = false;
      return `🤝 *Empate!*\n${criarTabuleiro(jogo.tabuleiro)}`;
    }

    jogo.jogadorAtual = 'X';
  }

  return `🎮 *Jogo da Velha*\n${criarTabuleiro(jogo.tabuleiro)}\n\n🔁 Vez de: *${jogo.jogadorAtual}*`;
}

module.exports = { criarNovoJogo, jogar, jogos };