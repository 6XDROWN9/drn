/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:23:02
 * @Last Modified by: stupid cat
<<<<<<< HEAD:events/ready.js
 * @Last Modified time: 2017-12-05 11:42:18
=======
 * @Last Modified time: 2017-12-06 11:25:59
>>>>>>> 955ab76943c20c761c7bf1bb6d97947f055262e4:src/events/ready.js
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

bot.on('ready', async function () {
    bot.sender.send('ready', bot.guilds.map(g => g.id));
<<<<<<< HEAD:events/ready.js
    logger.init('Ready! Logged in as ' + bot.user.username + '#' + bot.user.discriminator);
=======
    console.init('Ready! Logged in as ' + bot.user.username + '#' + bot.user.discriminator);
>>>>>>> 955ab76943c20c761c7bf1bb6d97947f055262e4:src/events/ready.js

    if (process.env.SHARD_ID == 0) {
        let restart = await r.table('vars').get('restart').run();
        if (restart && restart.varvalue) {
            bu.send(restart.varvalue.channel, 'Ok I\'m back. It took me ' + bu.createTimeDiffString(dep.moment(), dep.moment(restart.varvalue.time)) + '.');
            r.table('vars').get('restart').delete().run();
        }
    }

    let guilds = (await r.table('guild').withFields('guildid').run()).map(g => g.guildid);
    //console.dir(guilds);
    bot.guilds.forEach(async function (g) {
        if (guilds.indexOf(g.id) == -1) {
            let guild = bot.guilds.get(g.id);
            let members = guild.memberCount;
            let users = guild.members.filter(m => !m.user.bot).length;
            let bots = guild.members.filter(m => m.user.bot).length;
            let percent = Math.floor(bots / members * 10000) / 100;
            var message = `:ballot_box_with_check: Guild: \`${guild.name}\`` +
                ` (\`${guild.id}\`)! ${percent >= 80 ? '- ***BOT GUILD***' : ''}\n   Total: **${members}** | Users: **${users}** | Bots: **${bots}** | Percent: **${percent}**`;
            bu.send(`205153826162868225`, message);

            console.log('Inserting a missing guild ' + g.id);
            await r.table('guild').insert({
                guildid: g.id,
                active: true,
                name: g.name,
                settings: {},
                channels: {},
                commandperms: {},
                ccommands: {},
                modlog: []
            }).run();
        }
        bu.guildCache[g.id] = await r.table('guild').get(g.id);
    });

    gameId = bu.getRandomInt(0, 4);
    if (config.general.isbeta)
        bu.avatarId = 4;
    else
        bu.avatarId = 0;
    switchGame();
    if (process.env.SHARD_ID == 0)
        switchAvatar();
    bu.postStats();
    if (eventTimer == undefined) {
        initEvents();
    }
});

/**
 * Switches the avatar
 * @param forced - if true, will not set a timeout (Boolean)
 */
function switchAvatar(forced) {
    if (config.general.isbeta) return;
    bot.editSelf({
        avatar: bu.avatars[bu.avatarId]
    });
    bu.avatarId++;
    if (bu.avatarId == 8)
        bu.avatarId = 0;
    if (!forced)
        setTimeout(function () {
            switchAvatar();
        }, 600000);
}

var gameId;
/**
 * Switches the game the bot is playing
 * @param forced - if true, will not set a timeout (Boolean)
 */
async function switchGame(forced) {
    for (const shard of bot.shards) {
        var name = '';
        var oldId = gameId;
        while (oldId == gameId) {
            gameId = bu.getRandomInt(0, 11);
        }
        switch (dep.moment().format('MM-DD')) {
            case '04-16':
                name = 'Happy age++, stupid cat!';
                break;
            case '12-25':
                name = 'Merry Christmas!';
                break;
            case '03-17':
                name = 'Happy St. Patrick\'s day!';
                break;
            case '01-01':
                name = 'Happy New Year\'s!';
                break;
            case '07-01':
                name = 'Happy Canada Day!';
                break;
            case '07-04':
                name = 'Happy Independence Day!';
                break;
            case '10-31':
                name = 'Happy Halloween!';
                break;
            case '03-08':
                name = 'Happy Women\'s Day!';
                break;
            case '11-19':
                name = 'Happy Men\'s Day!';
                break;
            case '09-21':
                name = 'Happy Peace Day!';
                break;
            case '05-01':
                name = 'Happy Labour Day!';
                break;
            case '03-14':
                name = 'Happy Pi Day!';
                break;
            case '04-01':
                name = '👀';
                break;
            case '01-25':
                name = '!yaD etisoppO yppaH';
                break;
            case '05-29':
                name = 'Happy Put-A-Pillow-On-Your-Fridge Day!';
                break;
            case '07-27':
                name = 'Happy Take-Your-Houseplants-For-A-Walk Day!';
                break;
            case '05-04':
                name = 'May the Fourth be with you.';
                break;
            case '12-23':
                name = 'Happy Festivus!';
                break;
            default:
                switch (gameId) {
                    case 0:
                        name = `with ${bot.users.size} users!`;
                        break;
                    case 1:
                        name = `in ${bot.guilds.size} guilds!`;
                        break;
                    case 2:
                        name = `in ${Object.keys(bot.channelGuildMap).length} channels!`;
                        break;
                    case 3:
                        name = `with tiny bits of string!`;
                        break;
                    case 4:
                        name = `with a laser pointer!`;
                        break;
                    case 5:
                        name = `on version ${await bu.getVersion()}!`;
                        break;
                    case 6:
                        name = `type 'b!help'!`;
                        break;
                    case 7:
                        name = `with a laser pointer!`;
                        break;
                    case 8:
                        name = `with ${bot.shards.size} shards!`;
                        break;
                    case 9:
                        name = `with a mouse!`;
                        break;
                    case 10:
                        name = `with a ball of yarn!`;
                        break;
                    case 11:
                        name = `in a box!`;
                        break;
                    case 12:
                        name = `on shard ${shard[1].id}!`;
                        break;
                }
        }

        shard[1].editStatus(null, {
            name: name
        });
    }
    if (!forced)
        setTimeout(function () {
            switchGame();
        }, 60000);
}

var eventTimer;

function initEvents() {
    console.init('Starting event interval!');
    eventTimer = setInterval(async function () {
        let events = await r.table('events').between(r.epochTime(0), r.now(), {
            index: 'endtime'
        });
        for (let event of events) {
<<<<<<< HEAD:events/ready.js
            if (event.channel && !bot.getChannel(event.channel))
                return;
            else if (event.guild && !bot.guilds.get(event.guild))
                return;
            else if (event.user && process.env.SHARD_ID != 0)
                return;
=======
            if (event.channel && !bot.getChannel(event.channel)) continue;
            else if (event.guild && !bot.guilds.get(event.guild)) continue;
            else if (!event.channel && !event.guilds && event.user && process.env.SHARD_ID != 0) continue;
>>>>>>> 955ab76943c20c761c7bf1bb6d97947f055262e4:src/events/ready.js
            let type = event.type;
            CommandManager.list[type].event(event);
            r.table('events').get(event.id).delete().run();
        }
    }, 10000);
}