var e = module.exports = {};





e.init = () => {




    e.category = bu.CommandType.ADMIN;
};

e.requireCtx = require;

e.isCommand = true;
e.hidden = false;
e.usage = 'modlog [disable | clear [number to clear]]';
e.info = 'Enables the modlog and sets it to the current channel. Doing \`modlog disable\` will disable it. Doing \`modlog clear [number]\` will clear the specified number of cases from the modlog. Leaving \`number\` blank will clear all cases.' +
    'When an admin does a moderation command (ban, unban, mute, unmute, and kick), the incident will be logged. ' +
    'The admin will then be encouraged to do \`reason <case number> <reason>\` to specify why ' +
    'the action took place.' +
    '\nBans and unbans are logged regardless of whether the \`ban\` or \`unban\` commands are used.';
e.longinfo = `<p>Enables the modlog and sets it to the current channel. Doing <code>modlog disable</code> will disable it. Doing <code>modlog clear [number]</code> will clear the specified number of cases from the modlog. Leaving <code>number</code> blank will clear all cases.
        When an admin does a moderation command (ban, unban, mute, unmute, and kick), the incident will be logged.
        The admin will then be encouraged to do <code>reason &lt;case number&gt; &lt;reason&gt;</code> to specify why
        the action took place.</p>
    <p>Bans and unbans are logged regardless of whether the <code>ban</code> or <code>unban</code> commands are used.
    </p>`;

e.execute = async function(msg, words) {
    if (words[1]) {
        switch (words[1].toLowerCase()) {
            case 'disable':
                await bu.guildSettings.remove(msg.channel.guild.id, 'modlog');
                bu.send(msg, 'Modlog disabled!');
                break;
            case 'clear':
                var limit = 0;
                if (words[2]) {
                    limit = parseInt(words[2]);
                    if (isNaN(limit)) {
                        bu.send(msg, 'Invalid number of cases to clear');
                        return;
                    }
                }
                bu.dirtyCache[msg.guild.id] = true;

                let storedGuild = await bu.getGuild(msg.guild.id);
                if (storedGuild && storedGuild.modlog.length > 0) {
                    let index = storedGuild.modlog.length - limit;
                    if (index < 0) {
                        index = 0;
                    }
                    let cases = storedGuild.modlog.splice(index);
                    let messages = cases.map(m => m.msgid);
                    let modlogChannel = await bu.guildSettings.get(msg.channel.guild.id, 'modlog');
                    bot.deleteMessages(modlogChannel, messages);
                    await r.table('guild').get(msg.channel.guild.id).update({
                        modlog: storedGuild.modlog
                    }).run();
                    bu.send(msg, 'Cleared ' + (limit > 0 ? limit : 'all') + ' cases from the modlog.');
                }
                break;
        }
    } else {
        await bu.guildSettings.set(msg.channel.guild.id, 'modlog', msg.channel.id);
        bu.send(msg, 'Modlog channel set!');
    }
};