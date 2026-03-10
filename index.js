const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');
const ONESHOT_NAMES = [
    "Niko", "Alula", "Calamus", "Silver", "Prototype", "Prophet", "Ling", 
    "Kelvin", "George", "Rue", "Cedric", "Magpie", "Maize", "Solstice",
    "WorldMachine", "Sun", "Pancake", "Lightbulb", "Refuge", "Glen"
];
const PREFIXES = ["little", "pancake", "nice", "love", "dr", "mr", "cool"];
function generateNikoName() {
    const name = ONESHOT_NAMES[Math.floor(Math.random() * ONESHOT_NAMES.length)];
    const prefix = Math.random() > 0.5 ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)] : "";
    const suffix = Math.random() > 0.3 ? Math.floor(Math.random() * 9999) : "";
    
    // Срезаем длину, если ник больше 16 символов (лимит Майна)
    return (prefix + name + suffix).substring(0, 16);
}
// --- КОНФИГУРАЦИЯ ГЕРЦОГА ---
function createBot(id) {
    const username = generateNikoName();
    const version = SETTINGS.versions[Math.floor(Math.random() * SETTINGS.versions.length)];
    // Рандомно выбираем один из трех хостов
    const targetHost = SETTINGS.hosts[Math.floor(Math.random() * SETTINGS.hosts.length)];
    
    const bot = mineflayer.createBot({
        host: targetHost,
        port: SETTINGS.port,
        username: username,
        version: version,
        hideErrors: true
    });

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString();
        if (msg.includes('mineguard.pro/captcha/')) {
            const urlMatch = msg.match(/https:\/\/mineguard\.pro\/captcha\/[a-zA-Z0-9]+/);
            if (urlMatch) passCaptcha(urlMatch[0]);
        }
    });

    bot.on('spawn', () => {
        setTimeout(() => {
            bot.chat(`${SETTINGS.pass} ${SETTINGS.pass}`);
            setInterval(() => {
                if (bot.entity) {
                    bot._client.write('settings', { locale: 'en_US', viewDistance: 15, skinParts: 127 });
                    bot._client.write('tab_complete', { transactionId: Math.floor(Math.random() * 500), text: '/' });
                    const pos = bot.entity.position.floored();
                    bot._client.write('block_dig', { status: 0, location: pos.offset(0, -1, 0), face: 1 });
                    bot.entity.position.x += (Math.random() - 0.5) * 0.1;
                }
            }, 150);
        }, 2500);
    });

    bot.on('error', (err) => {
        if (err.code === 'ECONNRESET') console.log("[Status] Server kicking Nikos...");
    });

    bot.on('end', () => {
        setTimeout(() => createBot(id), 2000);
    });
}

initBrowser().then(() => {
    console.log("--- ONESHOT ARMY DEPLOYED ---");
    for (let i = 0; i < SETTINGS.botCount; i++) {
        setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
    }
});
