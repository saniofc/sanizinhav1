const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const P = require('pino');
const readline = require("readline");
const colors = require("colors");
const { Boom } = require('@hapi/boom');
const exec = require('child_process').exec;
const fs = require('fs');
const chalk = require("chalk");
const gradient = require("gradient-string");
const { upsert, onGroupParticipantsUpdate, setSock } = require('./index');
const number = process.env.WHATSAPP_NUMBER || 'default';
const qrcodePath = `./dados/sessoes/session-${number}`;
const pairingCode = process.argv.includes("--code");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise(resolve => rl.question(text, resolve));
async function STBLK() {
  const { state, saveCreds } = await useMultiFileAuthState(qrcodePath);
  const { version } = await fetchLatestBaileysVersion();  
  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['Ubuntu', 'Edge', '110.0.1587.56'],
  });  
  setSock(sock);
  sock.ev.on('messages.upsert', async (m) => {
    try {
      await upsert(m, sock);
    } catch (e) {
      console.error('Erro no messages.upsert:', e);
    }
  });
  sock.ev.on('group-participants.update', async (update) => {
    try {
      await onGroupParticipantsUpdate(update, sock);
      const { id: groupId, participants, action } = update;
      if (action === 'remove') {
        const contadorPath = './dados/contador.json';
        if (!fs.existsSync(contadorPath)) return;
        let contador = JSON.parse(fs.readFileSync(contadorPath, 'utf-8'));
        if (typeof contador !== 'object') return;
        for (const user of participants) {
          if (contador[groupId] && contador[groupId][user]) {
            delete contador[groupId][user];
          }
          if (contador[groupId] && Object.keys(contador[groupId]).length === 0) {
            delete contador[groupId];
          }
        }
        fs.writeFileSync(contadorPath, JSON.stringify(contador, null, 2));
      }
    } catch (e) {
      console.error('Erro em group-participants.update:', e);
    }
  });
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr && !pairingCode) {
      console.log('\n📷 Escaneie o QR code abaixo:\n');
      require('qrcode-terminal').generate(qr, { small: true });
    }
    if (lastDisconnect?.error?.output?.payload?.message?.includes('Closing stale open session')) {
      console.log(colors.yellow('⚠️ Sessão antiga detectada. Removendo...'));
      exec(`rm -rf ${qrcodePath}`, (err) => {
        if (err) console.error('Erro ao remover a sessão:', err);
        else console.log('Sessão removida com sucesso!');
      });
    }
   const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
    if (connection === 'close') {
      if (code !== DisconnectReason.loggedOut) {
        console.log(colors.yellow('Conexão fechada, tentando reconectar...'));
        STBLK();
      } else {
        console.log(colors.red("Sessão encerrada pelo logout. Excluindo diretório de sessão..."));
        exec(`rm -rf ${qrcodePath}`);
        process.exit(0);
      }
    } else if (connection === 'open') {
      const texto = `
░██████╗░█████╗░███╗░░██╗██╗███████╗██╗███╗░░██╗██╗░░██╗░█████╗░
██╔════╝██╔══██╗████╗░██║██║╚════██║██║████╗░██║██║░░██║██╔══██╗
╚█████╗░███████║██╔██╗██║██║░░███╔═╝██║██╔██╗██║███████║███████║
░╚═══██╗██╔══██║██║╚████║██║██╔══╝░░██║██║╚████║██╔══██║██╔══██║
██████╔╝██║░░██║██║░╚███║██║███████╗██║██║░╚███║██║░░██║██║░░██║
╚═════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚══════╝╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚═╝░░╚═╝
██╗░░░██╗░░░███╗░░
██║░░░██║░░█████║░
╚██╗░██╔╝░╚██╔██║░
░╚████╔╝░░░╚═╝██║░
░░╚██╔╝░░░███████║
░░░╚═╝░░░░╚══════╝`;
      const usernameBot = process.env.BOT_NAME || "SanizinhaBot";
      console.log(gradient.pastel.multiline(texto));
      console.log(chalk.yellow(`*ੈ🌸‧₊˚Sistema conectado com sucesso°❀⋆.ೃ࿔*･!`));
      console.log(chalk.magenta(`💻 Desenvolvido por ${chalk.bold('@saniofc°❀⋆.ೃ࿔*:･')}`));
      console.log('');
    }
  });
  if (pairingCode && !sock.authState.creds.registered) {
    let phoneNumber = await question("Digite o número do bot (sem + e sem espaços): ");
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    let code = await sock.requestPairingCode(phoneNumber);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log("🔗 Código de pareamento:", code);
    rl.close();
  }
  sock.ev.on('creds.update', saveCreds);
}
STBLK().catch(e => console.log("Erro ao iniciar o bot:", e));