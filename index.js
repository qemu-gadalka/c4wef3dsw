process.env.NODE_NO_WARNINGS = '1';
const mineflayer = require('mineflayer');

function createBot() {
    const username = `dobriydyadyka_${Math.random().toString(36).substring(2, 10)}`;
    
    const bot = mineflayer.createBot({
        host: 'shinasmp.aternos.me',
        port: 11048,
        username: username,
        version: '1.21.11',
        checkTimeoutInterval: 5000,
        viewDistance: 'far'
    });

    bot.once('spawn', () => {
        bot.chat('/register lol999111 lol999111');
        
        setTimeout(() => {
            // Настройка движения для прогрузки чанков
            const yaw = Math.random() * Math.PI * 2;
            bot.look(yaw, 0, true);
            bot.setControlState('forward', true);
            bot.setControlState('sprint', true);
            bot.setControlState('jump', true);

            // Основной цикл нагрузки
            setInterval(() => {
                // 1. Чат-спам с длинным хвостом (обход фильтров)
                bot.chat(`щтоб вы падохли пидары придурки бляд: ${Math.random().toString(36).repeat(3)}`);

                // 2. Взмахи руками (пакеты анимации для всех игроков)
                bot.swingArm('right');
                bot.swingArm('left');

                // 3. Бросание предметов (если что-то подобрал - создает энтити)
                const item = bot.inventory.items()[0];
                if (item) bot.tossStack(item);

                // 4. Быстрая смена слотов (пакеты обновления инвентаря)
                bot.setQuickBarSlot(Math.floor(Math.random() * 9));

                // 5. Поиск и активация блоков (двери, рычаги, сундуки)
                const block = bot.findBlock({
                    matching: (b) => b && b.name.includes('door') || b.name.includes('chest') || b.name.includes('lever'),
                    maxDistance: 5
                });
                if (block) bot.activateBlock(block).catch(() => {});

            }, 40);

            // Рандомные повороты головы (нагрузка на синхронизацию)
            setInterval(() => {
                bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 1, false);
            }, 150);

        }, 1200);
    });

    const reconnect = () => {
        bot.removeAllListeners();
        setTimeout(createBot, 1000);
    };

    bot.on('error', reconnect);
    bot.on('kicked', reconnect);
    bot.on('end', reconnect);
}

// Запуск пачки ботов
let currentBots = 0;
const targetBots = 4000; // Оптимально для Атерноса, чтобы не забанили IP сразу

const starter = setInterval(() => {
    if (currentBots < targetBots) {
        createBot();
        currentBots++;
    } else {
        clearInterval(starter);
    }
}, 350);
