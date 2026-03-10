const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

// --- 1. ТВОЯ КОНФИГУРАЦИЯ ---
const SETTINGS = {
    hosts: ["mc.risemine.space", "104.167.24.81", "104.167.24.91"], 
    port: 25565,
    versions: ["1.16.5", "1.16.4"], 
    pass: "johnsinna1941_1488",
    botCount: 48,
    joinDelay: 1200 
};

const ONESHOT_NAMES = [
    "Niko", "Alula", "Calamus", "Silver", "Prototype", "Prophet", "Ling", 
    "Kelvin", "George", "Rue", "Cedric", "Magpie", "Maize", "Solstice",
    "WorldMachine", "Sun", "Pancake", "Lightbulb", "Refuge", "Glen"
];

const PREFIXES = ["little", "pancake", "nice", "love", "dr", "mr", "cool"];

let sharedBrowser;

// --- 2. ВСЕ ФУНКЦИИ (ОБЪЯВЛЯЕМ ЗАРАНЕЕ) ---

function generateNikoName() {
    const name = ONESHOT_NAMES[Math.floor(Math.random() * ONESHOT_NAMES.length)];
    const prefix = Math.random() > 0.5 ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)] : "";
    const suffix = Math.random() > 0.3 ? Math.floor(Math.random() * 9999) : "";
    return (prefix + name + suffix).substring(0, 16);
}

async function initBrowser() {
    sharedBrowser = await playwright.chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
}

async function passCaptcha(url) {
    if (!sharedBrowser) return;
    const context = await sharedBrowser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(Math.random() * 2000 + 1000);
        
        const checkbox = await page.$('.recaptcha-checkbox-border');
        if (checkbox) {
            const box = await checkbox.boundingBox();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
            await checkbox.click();
            console.log(`[Bypass] Captcha solved for a Niko!`);
        }
        await page.waitForTimeout(8000); 
    } catch (e) {
        // Ошибки браузера игнорируем
    } finally {
        await page.close();
        await context.close();
    }
}

function createBot(id) {
    const username = generateNikoName();
    const version = SETTINGS.versions[Math.floor(Math.random() * SETTINGS.versions.length)];
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

// --- 3. ЗАПУСК (В САМОМ КОНЦЕ) ---

initBrowser().then(() => {
    console.log("--- ONESHOT ARMY DEPLOYED ---");
    for (let i = 0; i < SETTINGS.botCount; i++) {
        setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
    }
}).catch(err => console.error("Critical error:", err));
