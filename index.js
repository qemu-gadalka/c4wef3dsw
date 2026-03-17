process.env.NODE_NO_WARNINGS = '1';
const mineflayer = require('mineflayer');

function createBot() {
    const username = `y_${Math.random().toString(36).substring(2, 8)}`;
    
    const bot = mineflayer.createBot({
        host: 'sasick228.aternos.me',
        port: false,
        username: username,
        version: false,
        checkTimeoutInterval: 30000
    });

    bot.once('spawn', () => {
        
        setTimeout(() => {
            setInterval(() => {
                bot.chat(`либари незаметно принял участие в игре ${Math.random().toString(36).substring(2, 5)}`);
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
