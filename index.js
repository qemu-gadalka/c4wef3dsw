const mineflayer = require('mineflayer');
const playwright = require('playwright-chromium');

const SETTINGS = {
    hosts: ["mc.risemine.space"],
    port: 25565,
    versions: ["1.16.5"],
    pass: "johnsinna1941_1488",
    botCount: 46,
    // Теперь это массив чисел, а не строк
    delays: [1343, 5834, 3041, 4520, 2500] 
};

const ONESHOT_NAMES = ["Niko", "Alula", "Calamus", "Silver", "Prototype", "Prophet", "Ling", "Kelvin", "George", "Rue", "Cedric", "Magpie", "Maize", "Solstice", "WorldMachine", "Sun", "Pancake", "Lightbulb", "Refuge", "Glen"];
const PREFIXES = ["little", "pancake", "nice", "love", "dr", "mr", "cool"];
const SPAM_MESSAGES = ["Niko looking for the Sun", "Pancakes are ready!", "Player, do you see the light?", "OneShot vibes only", "The World Machine is here"];

let sharedBrowser;

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
    console.log(`[CAPTCHA] ${username}: Пробую обойти...`);
    const context = await sharedBrowser.newContext();
    const page = await context.newPage();
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const checkbox = await page.$('.recaptcha-checkbox-border');
        if (checkbox) await checkbox.click();
        await page.waitForTimeout(7000);
        console.log(`[CAPTCHA] ${username}: Ок.`);
    } catch (e) {
    } finally {
        await page.close();
        await context.close();
    }
}

function createBot(id) {
    const username = generateNikoName();
    
    const bot = mineflayer.createBot({
        host: SETTINGS.hosts[0],
        port: SETTINGS.port,
        username: username,
        version: SETTINGS.version,
        hideErrors: true
    });

    let serverSelected = false;

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString();
        if (msg.includes('mineguard.pro/captcha/')) {
            const urlMatch = msg.match(/https:\/\/mineguard\.pro\/captcha\/[a-zA-Z0-9]+/);
            if (urlMatch) passCaptcha(urlMatch[0], username);
        }
    });

    // --- САМОЕ ВАЖНОЕ: ПОЧЕМУ КИКАЕТ ---
    bot.on('kicked', (reason) => {
        let kickReason = reason;
        try { kickReason = JSON.parse(reason).text || reason; } catch(e) {}
        console.log(`[KICK] ${username}: Выгнали! Причина: ${kickReason}`);
    });

    bot.on('spawn', () => {
        console.log(`[LOG] ${username}: В лобби.`);
        setTimeout(() => {
            bot.chat(`${SETTINGS.pass} ${SETTINGS.pass}`);
            setTimeout(() => {
                bot.setQuickBarSlot(4); 
                bot.activateItem(); 
                bot.once('windowOpen', (window) => {
                    if (serverSelected) return;
                    const slots = [12, 14];
                    const slotToClick = slots[id % slots.length];
                    bot.clickWindow(slotToClick, 0, 0);
                    serverSelected = true;
                    setTimeout(() => {
                        if (slotToClick === 12) bot.chat("#baritone");
                        setInterval(() => {
                            bot.chat(SPAM_MESSAGES[Math.floor(Math.random() * SPAM_MESSAGES.length)]);
                        }, 15000 + Math.random() * 10000);
                    }, 5000);
                });
            }, 6000);
        }, 3000);
    });

    bot.on('error', (err) => console.log(`[ERR] ${username}: ${err.message}`));
    bot.on('end', () => setTimeout(() => createBot(id), 10000));
}

initBrowser().then(() => {
    console.log("--- WORLD MACHINE 2.2: FIX DEPLOYED ---");
    let currentDelay = 0;
    for (let i = 0; i < SETTINGS.botCount; i++) {
        // Берем рандомную задержку из списка и суммируем
        const nextDelay = SETTINGS.delays[Math.floor(Math.random() * SETTINGS.delays.length)];
        currentDelay += nextDelay;
        setTimeout(() => createBot(i), currentDelay);
    }
});
