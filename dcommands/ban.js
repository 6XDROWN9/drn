var e = module.exports = {};



e.init = () => {
    e.category = bu.CommandType.ADMIN;
};

e.isCommand = true;
e.requireCtx = require;
e.hidden = false;
e.usage = 'ban <user> [days] [flags]';
e.info = 'Bans a user, where `days` is the number of days to delete messages for (defaults to 1).\nIf mod-logging is enabled, the ban will be logged.';
e.longinfo = `<p>Bans a user, where <code>days</code> is the number of days to delete messages for. Defaults to 1.</p>
<p>If mod-logging is enabled, the ban will be logged.</p>`;

e.flags = [{
    flag: 'r',
    word: 'reason',
    desc: 'The reason for the ban.'
}, {
    flag: 't',
    word: 'time',
    desc: 'If provided, the user will be unbanned after the period of time. (softban)'
}];


e.execute = async function (msg, words) {
    if (words[1]) {
        let input = bu.parseInput(e.flags, words);

        var user = await bu.getUser(msg, input.undefined[0]);
        if (!user) {
            bu.send(msg, `I couldn't find that user. Try using \`hackban\` with their ID or a mention instead.`);
            return;
        }
        let member = msg.guild.members.get(user.id);
        if (!member) {
            bu.send(msg, `That user isn't on this guild. Try using \`hackban\` with their ID or a mention instead.`);
            return;
        }
        let duration;
        if (input.t && input.t.length > 0) {
            duration = bu.parseDuration(input.t.join(' '));
        }
        bu.send(msg, (await e.ban(msg, user, parseInt(input.undefined.length > 1 ? input.undefined[input.undefined.length - 1] : 0), input.r, duration))[0]);
    }
};

e.ban = async function (msg, user, deleteDays = 1, reason, duration, tag = false, noPerms = false) {
    if (!msg.channel.guild.members.get(bot.user.id).permission.json.banMembers) {
        return [`I don't have permission to ban users!`, '`Bot has no permissions`'];
    }
    let banPerms = await bu.guildSettings.get(msg.guild.id, 'banoverride') || 0;
    if (!noPerms && (!bu.comparePerms(msg.member, banPerms) && !msg.member.permission.json.banMembers)) {
        return [`You don't have permission to ban users!`, '`User has no permissions`'];
    }

    let member = msg.guild.members.get(user.id);

    if (member) {
        var botPos = bu.getPosition(msg.channel.guild.members.get(bot.user.id));
        var userPos = bu.getPosition(msg.member);
        var targetPos = bu.getPosition(msg.channel.guild.members.get(user.id));
        if (targetPos >= botPos) {
            return [`I don't have permission to ban ${user.username}!`, '`Bot has no permissions`'];
        }
        if (!noPerms && targetPos >= userPos && msg.author.id != msg.guild.ownerID) {
            return [`You don't have permission to ban ${user.username}!`, '`User has no permissions`'];
        }
    }
    if (!bu.bans[msg.channel.guild.id])
        bu.bans[msg.channel.guild.id] = {};
    bu.bans[msg.channel.guild.id][user.id] = {
        mod: noPerms ? bot.user : msg.author,
        type: tag ? 'Tag Ban' : 'Ban',
        reason: reason
    };
    try {
        await bot.banGuildMember(msg.channel.guild.id, user.id, deleteDays, 'Banned by ' + bu.getFullName(msg.author) + (reason ? ' with reason: ' + reason.join(' ') : ''));
        let suffix = '';
        if (duration) {
            await r.table('events').insert({
                type: 'unban',
                user: user.id,
                guild: msg.guild.id,
                duration: duration.toJSON(),
                endtime: r.epochTime(dep.moment().add(duration).unix())
            });
            return [`:ok_hand: The user will be unbanned ${duration.humanize(true)}.`, duration.asMilliseconds()];
        } else {
            return [`:ok_hand:`, 'Success'];
        }
    } catch (err) {
        return [`Failed to ban the user! Please check your permission settings and command and retry. \nIf you still can't get it to work, please report it to me by doing \`b!report <your issue>\` with the following:\`\`\`\n${err.message}\n${err.response}\`\`\``, '`Couldn\'t ban user`'];
    }
};