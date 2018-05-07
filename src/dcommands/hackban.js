const BaseCommand = require('../structures/BaseCommand');

class HackbanCommand extends BaseCommand {
    constructor() {
        super({
            name: 'hackban',
            category: bu.CommandType.ADMIN,
            usage: 'hackban <user...> [days]',
            info: 'Bans a user who isn\'t currently on your guild, where `<user...>` is a list of user IDs or mentions (separated by spaces) and `days` is the number of days to delete messages for (defaults to 1).\nIf mod-logging is enabled, the ban will be logged.',
            flags: [ { flag: 'r', word: 'reason', desc: 'The reason for the ban.' } ]
        });
    }

    async execute(msg, words, text) {
    if (!msg.channel.guild.members.get(bot.user.id).permission.json.banMembers) {
        bu.send(msg, `I don't have permission to ban users!`);
        return;
    }
    let banPerms = (await bu.guildSettings.get(msg.guild.id, 'banoverride')) || 0;
    if (!bu.comparePerms(msg.member, banPerms) && !msg.member.permission.json.banMembers) {
        bu.send(msg, `You don't have permission to ban users!`);
        return;
    }
    let input = bu.parseInput(this.flags, words);
    let userList = [];
    let days = 1;
    for (let i = 0; i < input.undefined.length; i++) {
        if (input.undefined[i]) {
            if (/[0-9]{17,21}/.test(input.undefined[i])) {
                userList.push(input.undefined[i].match(/([0-9]{17,21})/)[1]);
            } else if (i == input.undefined.length - 1) {
                days = parseInt(input.undefined[i]);
                if (isNaN(days)) {
                    days = 1;
                }
            }
        }
    }

    if (!bu.bans[msg.channel.guild.id])
        bu.bans[msg.channel.guild.id] = {};
    console.verbose(userList);
    if (userList.length == 1)
        bu.bans[msg.channel.guild.id][userList[0]] = {
            mod: msg.author,
            type: 'Hack-Ban',
            reason: input.r
        };
    else
        bu.bans[msg.channel.guild.id].mass = {
            mod: msg.author,
            type: 'Mass Hack-Ban',
            users: userList,
            newUsers: [],
            reason: input.r
        };
    console.dir(bu.bans[msg.channel.guild.id]);
    userList.forEach(m => {
        bot.banGuildMember(msg.channel.guild.id, m, days, 'Banned by ' + bu.getFullName(msg.author) + (input.r ? ' with reason: ' + input.r.join(' ') : '')).then(() => {
            return;
        }).catch(console.error);
    });

    bu.send(msg, ':ok_hand:');


    //bot.ban
    }
}

module.exports = HackbanCommand;
