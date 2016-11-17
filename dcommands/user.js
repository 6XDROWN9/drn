var e = module.exports = {};

var moment = require('moment');




e.init = () => {



    e.category = bu.CommandType.GENERAL;

};
e.requireCtx = require;

e.isCommand = true;
e.hidden = false;
e.usage = 'user [id/name/mention]';
e.info = 'Gets information about specified user';
e.longinfo = `<p>Gets information about the specified user.</p>`;

e.execute = async function(msg, words) {
        var userToGet;
        let isMember = true;
        if (!words[1]) {
            userToGet = msg.member;
        } else {
            userToGet = await bu.getUser(msg, words[1]);
            if (userToGet) {
                if (bot.guilds.get(msg.channel.guild.id).members.get(userToGet.id))
                    userToGet = bot.guilds.get(msg.channel.guild.id).members.get(userToGet.id);
                else isMember = false;
            } else return;
        }
        if (!userToGet) {
            //   sendMessageToDiscord(msg.channel.id, 'Unable to find that user on this guild!');
            return;
        }
        //  var avatarUrl = `https://cdn.discordapp.com/avatars/${userToGet.user.id}/${userToGet.user.avatar}.jpg`;
        var message;
        if (isMember) {
            message = `\`\`\`prolog
${bu.padLeft('User', 19)} : ${userToGet.user.username}#${userToGet.user.discriminator}
${bu.padLeft('Username', 19)} : ${userToGet.user.username}
${bu.padLeft('Nickname', 19)} : ${userToGet.nick}
${bu.padLeft('Discriminator', 19)} : ${userToGet.user.discriminator}
${!userToGet.user.bot ? `${bu.padLeft('Account Type', 19)} : User` : `${bu.padLeft('Account Type', 19)} : Bot`}
${bu.padLeft('ID', 19)} : ${userToGet.user.id}
${bu.padLeft('Allowed Permissions', 19)} : ${userToGet.permission.allow}
${bu.padLeft('Denied Permissions', 19)} : ${userToGet.permission.deny}
${bu.padLeft('Avatar URL', 19)} : ${userToGet.user.avatarURL}
Account created on ${moment(userToGet.user.createdAt).format('llll')}
Account joined guild '${msg.channel.guild.name}' on ${moment(userToGet.joinedAt).format('llll')}
${userToGet.game == null ? `Not playing anything` : `Currently ${userToGet.game.type != null && userToGet.game.type > 0 ? 'streaming' : 'playing'} ${userToGet.game.name}`}
\`\`\``;
        } else {
             message = `\`\`\`prolog
${bu.padLeft('User', 14)} : ${userToGet.username}#${userToGet.discriminator}
${bu.padLeft('Username', 14)} : ${userToGet.username}
${bu.padLeft('Discriminator', 14)} : ${userToGet.discriminator}
${!userToGet.bot ? `${bu.padLeft('Account Type', 14)} : User` : `${bu.padLeft('Account Type', 14)} : Bot`}
${bu.padLeft('ID', 14)} : ${userToGet.id}
${bu.padLeft('Avatar URL', 14)} : ${userToGet.avatarURL}
Account created on ${moment(userToGet.createdAt).format('llll')}
\`\`\``;
        }
    bu.sendFile(msg.channel.id, message, isMember ? userToGet.user.avatarURL : userToGet.avatarURL);
};