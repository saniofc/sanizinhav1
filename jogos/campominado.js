// campominado.js
const jogos = {}; // Armazena os jogos ativos

const letras = 'abcdefgh';
const numeros = '12345678';

function gerarTabuleiro() {
  const minas = new Set();
  while (minas.size < 10) {
    const linha = Math.floor(Math.random() * 8);
    const coluna = Math.floor(Math.random() * 8);
    minas.add(`${linha},${coluna}`);
  }

  const tabuleiro = Array.from({ length: 8 }, () => Array(8).fill('⬜'));
  return { minas, revelado: new Set(), tabuleiro };
}

function mostrarTabuleiro(jogo) {
  let visual = '   1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣\n';
  for (let i = 0; i < 8; i++) {
    visual += `${letras[i]} `;
    for (let j = 0; j < 8; j++) {
      const key = `${i},${j}`;
      visual += jogo.revelado.has(key) ? jogo.tabuleiro[i][j] : '⬛';
    }
    visual += '\n';
  }
  return visual;
}

function contarMinasAoRedor(minas, i, j) {
  let count = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const ni = i + dx, nj = j + dy;
      if (ni >= 0 && ni < 8 && nj >= 0 && nj < 8 && minas.has(`${ni},${nj}`)) {
        count++;
      }
    }
  }
  return count;
}

function revelar(jogo, i, j) {
  const key = `${i},${j}`;
  if (jogo.revelado.has(key)) return;

  const minas = jogo.minas;
  const tabuleiro = jogo.tabuleiro;

  if (minas.has(key)) {
    tabuleiro[i][j] = '💣';
    jogo.revelado.add(key);
    jogo.status = 'perdeu';
    return;
  }

  const count = contarMinasAoRedor(minas, i, j);
  tabuleiro[i][j] = count === 0 ? '⬜' : `${count}️⃣`;
  jogo.revelado.add(key);

  if (count === 0) {
    // Expansão recursiva
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx !== 0 || dy !== 0) {
          const ni = i + dx, nj = j + dy;
          if (ni >= 0 && ni < 8 && nj >= 0 && nj < 8) {
            revelar(jogo, ni, nj);
          }
        }
      }
    }
  }
}

function iniciarJogo(chatId, jogador) {
  jogos[chatId] = {
    ...gerarTabuleiro(),
    jogador,
    status: 'jogando',
  };
}

function jogar(chatId, jogador, jogada) {
  const jogo = jogos[chatId];
  if (!jogo || jogo.status !== 'jogando') return '⚠️ Nenhum jogo ativo. Use *.cm* para iniciar.';

  if (jogador !== jogo.jogador) return '⏳ Aguarde sua vez ou inicie um novo jogo.';

  const letra = jogada[0].toLowerCase();
  const numero = jogada[1];
  const i = letras.indexOf(letra);
  const j = parseInt(numero) - 1;

  if (i < 0 || j < 0 || i > 7 || j > 7) return '❌ Posição inválida. Ex: b3, g7';

  revelar(jogo, i, j);

  if (jogo.status === 'perdeu') {
    const minas = jogo.minas;
    minas.forEach(m => {
      const [x, y] = m.split(',').map(Number);
      jogo.tabuleiro[x][y] = '💣';
      jogo.revelado.add(`${x},${y}`);
    });
    const fim = mostrarTabuleiro(jogo);
    delete jogos[chatId];
    return `💥 *BOOM! Você perdeu!*\n\n${fim}`;
  }

  if (jogo.revelado.size === 64 - 10) {
    jogo.status = 'ganhou';
    const fim = mostrarTabuleiro(jogo);
    delete jogos[chatId];
    return `🎉 *Parabéns! Você venceu o Campo Minado!*\n\n${fim}`;
  }

  return `🧩 *Campo Minado - Jogando...*\n\n${mostrarTabuleiro(jogo)}`;
}

module.exports = {
  iniciarJogo,
  jogar,
  jogos
};