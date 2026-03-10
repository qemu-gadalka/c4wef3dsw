const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

const SETTINGS = {
    host: "mc.risemine.space",
    port: 25565,
    version: "1.16.5",
    pass: "johnsinna1941_1488",
    botCount: 40, // 40 ботов на процесс - это золотая середина
    joinDelay: 1000
};

let sharedBrowser;

// Запускаем браузер один раз при старте
async function initBrowser() {
    sharedBrowser = await playwright.chromium.launch({ headless: true });
}

async function passCaptcha(url) {
    if (!sharedBrowser) return;
    const context = await sharedBrowser.newContext();
    const page = await context.newPage();
    try {
        console.log(`[MineGuard] Чекаю: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const checkbox = await page.$('.recaptcha-checkbox-border');
        if (checkbox) await checkbox.click();
        await page.waitForTimeout(5000); 
    } catch (e) {
        console.log("[Error] Капча не поддалась.");
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
        version: SETTINGS.version,
        checkTimeoutInterval: 60000 // Чтобы не кикало раньше времени
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
                bot._client.write('block_dig', { status: 0, location: pos.offset(0, -1, 0), face: 1 });
                bot._client.write('block_place', { hand: 0, location: pos.offset(0, -1, 0), direction: 1, cursorX: 0.5, cursorY: 0.5, cursorZ: 0.5, insideBlock: false });
                bot._client.write('settings', { locale: 'en_US', viewDistance: Math.random() > 0.5 ? 16 : 1, chatFlags: 0, chatColors: true, skinParts: 127, mainHand: 0 });
            }
        }, 100); // 10 раз в секунду хватит, чтобы сервер вспотел
    });

    bot.on('error', () => {});
    bot.on('end', () => setTimeout(() => createBot(id), 2000));
}

// Погнали
initBrowser().then(() => {
    for (let i = 0; i < SETTINGS.botCount; i++) {
        setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
    }
});
