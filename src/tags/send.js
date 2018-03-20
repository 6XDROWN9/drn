/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:57:04
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:57:04
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.CCommandTag('send')
        .requireStaff()
        .withArgs(a => [a.require('channel'), a.require([a.optional('message'), a.optional('embed')])])
        .withDesc('Sends `message` and `embed` to `channel`, and returns the message ID. `channel` is either an ID or channel mention. ' +
            'At least one out of `message` and `embed` must be supplied.\n' +
            'Please note that `embed` is the JSON for an embed object, dont put the `{embed}` subtag there, as nothing will show')
        .withExample(
            '{send;#channel;Hello!;{buildembed;title:Youre cool}}',
            '1111111111111111111\nIn #channel: Hello!\nEmbed: Youre cool'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1-2', Builder.errors.notEnoughArguments)
        .whenArgs('3-4', async function (params) {
            let channel = bu.parseChannel(params.args[1], true),
                message = params.args[2],
                embed = bu.parseEmbed(params.args[2]);

            if (embed != null && !embed.malformed)
                message = undefined;
            else
                embed = bu.parseEmbed(params.args[3]);

            if (channel == null) return await Builder.errors.noChannelFound(params);
            if (channel.guild.id != params.msg.guild.id) return await Builder.errors.channelNotInGuild(params);

            try {
                let sent = await bu.send(channel.id, {
                    content: bu.processSpecial(message || '', true),
                    embed: embed,
                    nsfw: params.nsfw,
                    disableEveryone: false
                });
                return sent.id;
            } catch (err) {
                return await Builder.util.error(params, 'Failed to send');
            }
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();