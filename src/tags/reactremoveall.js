/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:51:35
 * @Last Modified by: stupid cat
 * @Last Modified time: 2018-08-22 17:09:03
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.APITag('reactremoveall')
        .withAlias('removereactall')
        .withArgs(a => [
            a.optional('channelId'),
            a.require('messageId')
        ])
        .withDesc('Removes all reactions from `messageId`.\n`channelId` defaults to the current channel.')
        .withExample(
            '{reactremoveall;12345678901234;:thinking:}',
            '(removed all the reactions)'
        ).whenDefault(async function (subtag, context, args) {
            let channel = null,
                message = null;

            // Check if the first "emote" is actually a valid channel
            channel = bu.parseChannel(args[0], true);
            if (channel == null)
                channel = context.channel;
            else
                args.shift();

            if (!channel.guild || !context.guild || channel.guild.id != context.guild.id)
                return Builder.errors.channelNotInGuild(subtag, context);

            // Check that the current first "emote" is a message id
            try {
                message = await bot.getMessage(channel.id, args[0]);
            } catch (e) { } finally {
                if (message == null)
                    return Builder.errors.noMessageFound(subtag, context);
            }

            await message.removeReactions();
        })
        .build();