var e = module.exports = {};

e.init = () => {
    e.category = bu.CommandType.CAT;
};

e.requireCtx = require;

e.isCommand = true;
e.hidden = false;
e.usage = 'patch [features] [flags]';
e.info = 'Makes a patch note';
var changeChannel = '222199986123833344';
const roleId = '239399475263700992';
const betaRoleId = '268577839639560192'; // temp role for testing

e.flags = [{
    flag: 'f',
    word: 'fixes',
    desc: 'The bug fixes of the patch.'
}, {
    flag: 'n',
    word: 'notes',
    desc: 'Other notes.'
}];


e.execute = async function (msg, words) {
    if (msg.author.id != bu.CAT_ID) {
        return;
    }
    let input = bu.parseInput(e.flags, words, true);
    let channel = await bot.getChannel(changeChannel);
    let role = channel.guild.roles.get(config.general.isbeta ? betaRoleId : roleId);
    let content = role.mention;
    let embed = {
        author: {
            name: `Version ${bu.VERSION}`
        },
        fields: [],
        color: bu.avatarColours[bu.avatarId]
    };
    if (input.undefined.length > 0) {
        embed.title = 'New Features and Changes';
        embed.description = input.undefined.join(' ');
    };
    if (input.f && input.f.length > 0) {
        embed.fields.push({
            name: 'Bug Fixes',
            value: input.f.join(' ')
        });
    };
    if (input.n && input.n.length > 0) {
        embed.fields.push({
            name: 'Other Notes',
            value: input.n.join(' ')
        });
    };

    await role.edit({
        mentionable: true
    });
    console.info(embed);
    await bu.send(changeChannel, {
        content,
        embed
    });
    await role.edit({
        mentionable: false
    });

    let changelogs = await r.table('vars').get('changelog');
    if (changelogs) {
        for (const channelId of Object.values(changelogs.guilds)) {
            const channel = bot.getChannel(channelId);
            if (channel != undefined && channel.permissionsOf(bot.user.id).has('sendMessages')
                && channel.permissionsOf(bot.user.id).has('readMessages')) {
                try {
                    if (channel.permissionsOf(bot.user.id).has('embedLinks')) {
                        await bu.send(channelId, {
                            embed
                        });
                    } else {
                        await bu.send(channelId, `There was a changelog update, but I need to be able to embed links to post it! Please give me the 'embed links' permission for next time.`);
                    }
                } catch (err) {
                    console.error('Changelog Patch:', err.message);
                }
            } else {
                console.warn('Skipping channel ' + channelId);
            }
        }
    }
};