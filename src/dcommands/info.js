const BaseCommand = require('../structures/BaseCommand');

const { patrons, donators } = dep.reload('../../res/donators.json');
const startDate = 1444708800000;
var patronStr, donatorStr;
async function reload() {
    patronStr = (await Promise.map(patrons, async p => {
        if (/^[0-9]{17,23}$/.test(p)) {
            return bu.getFullName(bot.users.get(p) || (await bu.getCachedUser(p)) || { username: p });
        } else return p;
    })).join('\n - ');
    donatorStr = (await Promise.map(donators, async p => {
        if (/^[0-9]{17,23}$/.test(p)) {
            return bu.getFullName(bot.users.get(p) || (await bu.getCachedUser(p)) || { username: p });
        } else return p;
    })).join('\n - ');
    console.log('reloaded');
}
let titan;
setInterval(reload, 60 * 60 * 1000);
reload();

class InfoCommand extends BaseCommand {
    constructor() {
        super({
            name: 'info',
            category: bu.CommandType.GENERAL,
            usage: 'info',
            info: 'Returns some info about me.'
        });
    }

    async execute(msg, words, text) {
        if (!titan) {
            let t = await bot.getRESTUser('135556895086870528');
            titan = bu.getFullName(t);
        }
        let age = dep.moment.duration(dep.moment() - dep.moment(startDate));
        let dateStr = `${age.years()} year${age.years() != 1 ? 's' : ''}, ${age.months()} month${age.months() != 1 ? 's' : ''}, ${age.days()} day${age.days() != 1 ? 's' : ''}, ${age.hours()} hour${age.hours() != 1 ? 's' : ''}, ${age.minutes()} minute${age.minutes() != 1 ? 's' : ''}, and ${age.seconds()} second${age.seconds() != 1 ? 's' : ''}`;
        try {
            bu.send(msg, `blargbot is a multipurpose bot with new features implemented regularly, written in javascript using Eris.

:birthday: I am currently ${dateStr} old!

:heart: __**Special thanks to my patrons!**__ :heart:
** - ${patronStr}**

:heart: __**Special thanks to all my other donators!**__ :heart:
** - ${donatorStr}**

Special huge thanks to the awesome **${titan}** for massive contributions to the BBTag system! :tada:

Additional credits to Aurieh#0258! :thumbsup:

For commands, do \`help\`. For information about supporting me, do \`donate\`. For any additional information, such as command documentation, please visit my website: <https://blargbot.xyz>`);
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = InfoCommand;
