const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

// --- 1. КОНФИГУРАЦИЯ ---
const SETTINGS = {
    hosts: ["mc.risemine.space"],
    port: 25565,
    versions: ["1.16.5", "1.16.4"],
    pass: "johnsinna1941_1488",
    botCount: 46,
    joinDelay: ["1343", "5834", "3041", "452"] 
};

const ONESHOT_NAMES = ["Niko", "Alula", "Calamus", "Silver", "Prototype", "Prophet", "Ling", "Kelvin", "George", "Rue", "Cedric", "Magpie", "Maize", "Solstice", "WorldMachine", "Sun", "Pancake", "Lightbulb", "Refuge", "Glen"];
const PREFIXES = ["little", "pancake", "nice", "love", "dr", "mr", "cool"];
const SPAM_MESSAGES = ["Niko looking for the Sun", "Pancakes are ready!", "Player, do you see the light?", "OneShot vibes only", "The World Machine is here"];

let sharedBrowser;

// --- 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function generateNikoName() {
    const name = ONESHOT_NAMES[Math.floor(Math.random() * ONESHOT_NAMES.length)];
    const prefix = Math.random() > 0.5 ? PREFIXES[Math.floor(Math.random() * PREFIXES.length)] : "";
    const suffix = Math.random() > 0.3 ? Math.floor(Math.random() * 999) : "";
    return (prefix + name + suffix).substring(0, 16);
}

async function initBrowser() {
    sharedBrowser = await playwright.chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
}

async function passCaptcha(url, username) {
    if (!sharedBrowser) return;
    console.log(`[CAPTCHA] ${username}: Нашел капчу, пробую обойти...`);
    const context = await sharedBrowser.newContext();
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(2000);
        const checkbox = await page.$('.recaptcha-checkbox-border');
        if (checkbox) await checkbox.click();
        await page.waitForTimeout(7000);
        console.log(`[CAPTCHA] ${username}: Попытка решения отправлена.`);
    } catch (e) {
        console.log(`[CAPTCHA-ERR] ${username}: Ошибка в браузере.`);
    } finally {
        await page.close();
        await context.close();
    }
}

// --- 3. ЛОГИКА БОТА ---

function createBot(id) {
    const username = generateNikoName();
    const targetHost = SETTINGS.hosts[Math.floor(Math.random() * SETTINGS.hosts.length)];
    
    const bot = mineflayer.createBot({
        host: targetHost,
        port: SETTINGS.port,
        username: username,
        version: SETTINGS.versions[Math.floor(Math.random() * SETTINGS.versions.length)],
        hideErrors: true
    });

    let serverSelected = false;

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString();
        // Скипаем, если ссылки на капчу нет
        if (msg.includes('mineguard.pro/captcha/')) {
            const urlMatch = msg.match(/https:\/\/mineguard\.pro\/captcha\/[a-zA-Z0-9]+/);
            if (urlMatch) passCaptcha(urlMatch[0], username);
        }
    });

    bot.on('spawn', () => {
        console.log(`[LOG] ${username}: Зашел в лобби.`);
        
        setTimeout(() => {
            bot.chat(`${SETTINGS.pass} ${SETTINGS.pass}`);
            console.log(`[LOG] ${username}: Логин отправлен.`);
            
            // Ждем прогрузки и жмем выбор сервера
            setTimeout(() => {
                console.log(`[LOG] ${username}: Открываю меню выбора (4-й слот + ПКМ)...`);
                bot.setQuickBarSlot(4); 
                bot.activateItem(); 

                bot.once('windowOpen', (window) => {
                    if (serverSelected) return;
                    
                    // Только 12 (13 в игре) и 14 (15 в игре). Никаких 13!
                    const slots = [12, 14];
                    const slotToClick = slots[id % slots.length];
                    
                    console.log(`[LOG] ${username}: Кликаю в слот ${slotToClick} (игровой ${slotToClick + 1})...`);
                    bot.clickWindow(slotToClick, 0, 0);
                    serverSelected = true;

                    setTimeout(() => {
                        console.log(`[LOG] ${username}: Перешел на подсервер.`);
                        
                        // Если зашли на 12-й слот (игровой 13)
                        if (slotToClick === 12) {
                            bot.chat("#baritone");
                            console.log(`[LOG] ${username}: Баритон активирован.`);
                        }

                        // Цикл спама
                        setInterval(() => {
                            const spam = SPAM_MESSAGES[Math.floor(Math.random() * SPAM_MESSAGES.length)];
                            bot.chat(spam);
                            console.log(`[LOG] ${username}: Пишу в чат: ${spam}`);
                        }, 15000 + Math.random() * 10000);

                    }, 5000);
                });
            }, 6000);
        }, 3000);
    });

    bot.on('error', (err) => {
        if (!err.message.includes('ECONNRESET')) {
            console.log(`[ERR] ${username}: ${err.message}`);
        }
    });

    bot.on('end', () => {
        console.log(`[LOG] ${username}: Отключен. Перезаход...`);
        setTimeout(() => createBot(id), 5000);
    });
}

// --- 4. ЗАПУСК ВСЕЙ СИСТЕМЫ ---

initBrowser().then(() => {
    console.log("--- WORLD MACHINE 2.2: DEPLOYED IN KREMENCHUK ---");
    console.log("Slots: 12 (Baritone+Spam) and 14 (Spam only).");
    for (let i = 0; i < SETTINGS.botCount; i++) {
        setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
    }
});
