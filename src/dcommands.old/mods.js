var e = module.exports = {};

e.init = () => {
    e.category = bu.CommandType.GENERAL;
};

e.requireCtx = require;

e.isCommand = true;

e.hidden = false;
e.usage = 'mods [online | o | away | a | dnd | d | offline]';
e.info = `Gets a list of mods.`;
e.longinfo = `<p>Gets a list of mods on the guild.</p>`;

e.execute = (msg, words) => {
    console.debug('a');
    try {
        bu.guildSettings.get(msg.channel.guild.id, 'staffperms').then(val => {
            console.debug('aa');
            var allow = val || bu.defaultStaff;
            let status = 0;
            if (words[1])
                switch (words[1].toLowerCase()) {
                    case 'o':
                    case 'online':
                        status = 1;
                        break;
                    case 'a':
                    case 'away':
                        status = 2;
                        break;
                    case 'd':
                    case 'dnd':
                        status = 3;
                        break;
                    case 'offline':
                        status = 4;
                        break;
                }
            var includeOffline = true;
            if (words[1] && words[1].toLowerCase() == 'online') {
                includeOffline = false;
            }
            var mods = msg.channel.guild.members.filter(m => {
                return !m.user.bot && bu.comparePerms(m, allow) &&
                    (includeOffline || m.status == 'online');
            });
            var maxLength = 0;
            mods.forEach(m => {
                if (getName(m).length > maxLength) {
                    maxLength = getName(m).length;
                }
            });
            let online = [];
            if (status == 0 || status == 1)
                mods.filter(m => m.status == 'online').forEach(m => {
                    online.push(`<:online:313956277808005120> **${getName(m)}** (${m.user.id})`);
                });
            let away = [];
            if (status == 0 || status == 2)
                mods.filter(m => m.status == 'idle').forEach(m => {
                    away.push(`<:away:313956277220802560> **${getName(m)}** (${m.user.id})`);
                });
            let dnd = [];
            if (status == 0 || status == 3)
                mods.filter(m => m.status == 'dnd').forEach(m => {
                    dnd.push(`<:dnd:313956276893646850> **${getName(m)}** (${m.user.id})`);
                });
            let offline = [];
            if (status == 0 || status == 4)
                mods.filter(m => m.status == 'offline').forEach(m => {
                    offline.push(`<:offline:313956277237710868> **${getName(m)}** (${m.user.id})`);
                });
            let message = `Mods on **${msg.guild.name}**`;

            let subMessage = '';
            if (online.length > 0) subMessage += `\n${online.join('\n')}`;
            if (away.length > 0) subMessage += `\n${away.join('\n')}`;
            if (dnd.length > 0) subMessage += `\n${dnd.join('\n')}`;
            if (offline.length > 0) subMessage += `\n${offline.join('\n')}`;
            if (subMessage.length == 0) {
                message = 'Whoops! There are no mods with that status!';
            }
            bu.send(msg, message + subMessage);
        });

    } catch (err) {
        console.error(err);
    }
};

function getName(member) {
    return member.user.username + '#' + member.user.discriminator;
}

function pad(value, length) {
    return (value.toString().length < length) ? pad(value + ' ', length) : value;
}