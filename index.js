process.env.NODE_NO_WARNINGS = '1';
const mineflayer = require('mineflayer');

function createBot() {
    const username = `podarochek_${Math.random().toString(36).substring(2, 8)}`;
    
    const bot = mineflayer.createBot({
        host: 'ne_sifon.aternos.me',
        port: false,
        username: username,
        version: false,
        checkTimeoutInterval: 30000
    });

    bot.once('spawn', () => {
        
        setTimeout(() => {
            setInterval(() => {
                bot.chat(`подарочек на новый от либари, пхази, сисхекс !!! ${Math.random().toString(36).substring(2, 5)}`);
            }, 50); 
        }, 1000);
    });

    const reconnect = () => {
        bot.removeAllListeners();
        setTimeout(createBot, 1500);
    };

    bot.on('error', reconnect);
    bot.on('kicked', reconnect);
    bot.on('end', reconnect);
}

for (let i = 0; i < 10; i++) {
    setTimeout(createBot, i * 1000);
}
