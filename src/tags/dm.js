/*
 * @Author: stupid cat
 * @Date: 2017-05-21 12:20:00
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-21 13:44:19
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder'),
    DMCache = {};

module.exports =
    Builder.CCommandTag('dm')
        .requireStaff()
        .withArgs(a => [a.require('user'), a.require([a.optional('message'), a.optional('embed')])])
        .withDesc('DMs `user` the given `message` and `embed`. Atleast one of `message` and `embed` must be provided. ' +
            'You may only send one DM per execution. Requires author to be staff, and the user to be on the current guild.\n' +
            'Please note that `embed` is the JSON for an embed object, dont put the `{embed}` subtag there, as nothing will show.'
        ).withExample(
            '{dm;stupid cat;Hello;{buildembed;title:Youre cool}}',
            'DM: Hello\nEmbed: Youre cool'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1-2', Builder.errors.notEnoughArguments)
        .whenArgs('3', async function (params) {
            if (params.dmsent)
                return await Builder.util.error(params, 'Already have DMed');

            let user = await bu.getUser(params.msg, params.args[1]),
                message = params.args[2],
                embed = bu.parseEmbed(params.args[2]);

            if (user == null)
                return await Builder.errors.noUserFound(params);
            if (!params.msg.guild.members.get(user.id))
                return await Builder.errors.userNotInGuild(params);

            if (embed != null && !embed.malformed)
                message = undefined;
            else
                embed = bu.parseEmbed(params.args[3]);

            try {
                const DMChannel = await user.getDMChannel();
                if (!DMCache[user.id] ||
                    DMCache[user.id].count > 5 ||
                    DMCache[user.id].user != params.msg.author.id ||
                    DMCache[user.id].guild != params.msg.guild.id) {
                    // Ew we're gonna send a message first? It was voted...
                    await bu.send(DMChannel.id, 'The following message was sent from ' +
                        `**__${params.msg.guild.name}__** (${params.msg.guild.id}), ` +
                        'and was sent by ' +
                        `**__${bu.getFullName(params.msg.author)}__** (${params.msg.author.id}):`
                    );
                    DMCache[user.id] = { user: params.msg.author.id, guild: params.msg.guild.id, count: 1 };
                }
                await bu.send(DMChannel.id, {
                    content: bu.processSpecial(message || '', true),
                    embed: embed,
                    nsfw: params.nsfw
                });
                DMCache[user.id].count++;
                return {
                    dmsent: true
                };
            } catch (e) {
                return await Builder.util.error(params, 'Could not send DM');
            }
        }).whenDefault(Builder.errors.tooManyArguments)
        .build();