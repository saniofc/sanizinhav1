const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const fs = require('fs-extra'); const P = require('pino'); const { Boom } = require('@hapi/boom'); const qrcode = require('qrcode-terminal');
const readline = require("readline"); const pairingCode = process.argv.includes("--code"); const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const qrcodePath = './session';
async function startBot() { const { state, saveCreds } = await useMultiFileAuthState(qrcodePath); const { version } = await fetchLatestBaileysVersion();
const sock = makeWASocket({ version, auth: state, logger: P({ level: 'silent' }), printQRInTerminal: !pairingCode, browser: ['Ubuntu', 'Chrome', '20.0'] });
if (pairingCode && !sock.authState.creds.registered) { let phoneNumber = await question("Digite o número com código do país (ex: 5599999999999): "); phoneNumber = phoneNumber.replace(/[^0-9]/g, ""); let code = await sock.requestPairingCode(phoneNumber); code = code?.match(/.{1,4}/g)?.join("-") || code; console.log("Código de pareamento:", code); rl.close(); }
sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => { if (qr) qrcode.generate(qr, { small: true });
if (connection === "close") {
  const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
  if (reason !== 401) startBot();
  else {
    console.log("Sessão encerrada. Excluindo e reiniciando...");
    fs.removeSync(qrcodePath);
    startBot();
  }
}
if (connection === "open") {
  console.log("Bot conectado com sucesso!");
}
});
sock.ev.on("creds.update", saveCreds);
startBot();