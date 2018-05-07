const BaseCommand = require('../structures/BaseCommand'),
    bbEngine = require('../structures/BBTagEngine'),
    bbtag = require('../core/bbtag');

function filterTitle(title) {
    return title.replace(/[^\d\w .,\/#!$%\^&\*;:{}[\]=\-_~()]/gi, '');
}

class CcommandCommand extends BaseCommand {
    constructor() {
        super({
            name: 'ccommand',
            category: bu.CommandType.ADMIN,
            usage: 'ccommand <command name> <command content>',
            info: 'Creates a custom command, using the BBTag language.\n\nCustom commands take precedent over all other commands. As such, you can use it to overwrite commands, or disable them entirely. If the command content is "null" (without the quotations), blargbot will have no output whatsoever, allowing you to disable any built-in command you wish. You cannot overwrite the \'ccommand\' command. For more in-depth command customization, see the `editcommand` command.\n\n__**Usage:**__\n  **cc create <name> <content>** - creates a ccommand with given name and content\n  **cc edit <name> <content>** - edits an existing ccommand with given content\n  **cc set <name> <content>** - provides the functionality of `create` and `edit` in a single command\n  **cc delete <name>** - deletes the ccommand with given name, provided that you own it\n  **cc rename <tag1> <tag2>** - renames the ccommand by the name of `ccommand1` to `ccommand2`\n  **cc raw <name>** - displays the raw code of a ccommand\n  **cc setrole <name> [role names...]** - sets the roles required to execute the ccommand\n  **cc help** - shows this message\n  **cc sethelp** <name> [help text] - set the help message for a custom command\n  **cc docs** [topic] - view help docuentation for BBTag, specific to ccommands\n  \nFor more information about BBTag, visit https://blargbot.xyz/tags'
        });
    }

    async execute(msg, words, text) {
        console.debug('Text:', text);
        if (words[1]) {
            let storedTag;
            let content;
            let title;
            switch (words[1].toLowerCase()) {
                case 'setrole':
                    if (words.length > 2) {
                        title = filterTitle(words[2]);
                        storedTag = await bu.ccommand.get(msg.guild.id, title);
                        if (!storedTag) {
                            bu.send(msg, 'That ccommand doesn\'t exist!');
                            return;
                        }
                        let roles = [];
                        if (words[3]) roles = words.slice(3);
                        await bu.ccommand.set(msg.guild.id, title, {
                            content: storedTag.content || storedTag,
                            roles: roles
                        });
                        if (roles.length === 0) {
                            bu.send(msg, `Removed the custom role requirement of '${title}'.`);
                        } else
                            bu.send(msg, `Set the custom role requirements of '${title}' to \`\`\`fix\n${words.slice(3).join(', ')}\n\`\`\` `);
                    } else {
                        bu.send(msg, 'Not enough arguments! Do `help ccommand` for more information.');
                    }
                    break;
                case 'add':
                case 'create':
                    if (words.length > 3) {
                        title = filterTitle(words[2]);
                        if (title == 'cc' || title == 'ccommand') {
                            bu.send(msg, 'You cannot overwrite the `ccommand` command!');
                            break;
                        }
                        storedTag = await bu.ccommand.get(msg.channel.guild.id, title);
                        if (storedTag) {
                            bu.send(msg, 'That ccommand already exists!');
                            break;
                        }
                        content = bu.splitInput(text, true).slice(3).join(' ');
                        await bu.ccommand.set(msg.channel.guild.id, title, {
                            content,
                            author: msg.author.id
                        });
                        bu.send(msg, `✅ Custom command \`${title}\` created. ✅`);
                    } else {
                        bu.send(msg, 'Not enough arguments! Do `help ccommand` for more information.');
                    }
                    break;
                case 'edit':
                    if (words.length > 3) {
                        title = filterTitle(words[2]);
                        storedTag = await bu.ccommand.get(msg.channel.guild.id, title);
                        if (!storedTag) {
                            bu.send(msg, 'That ccommand doesn\'t exist!');
                            break;
                        }
                        content = bu.splitInput(text, true).slice(3).join(' ');
                        await bu.ccommand.set(msg.channel.guild.id, title, {
                            content,
                            author: msg.author.id
                        });
                        bu.send(msg, `✅ Custom command \`${title}\` edited. ✅`);
                    } else {
                        bu.send(msg, 'Not enough arguments! Do `help ccommand` for more information.');
                    }
                    break;
                case 'set':
                    if (words.length > 3) {
                        title = filterTitle(words[2]);
                        if (title == 'cc' || title == 'ccommand') {
                            bu.send(msg, 'You cannot overwrite the `ccommand` command!');
                            break;
                        }
                        content = bu.splitInput(text, true).slice(3).join(' ');
                        await bu.ccommand.set(msg.channel.guild.id, title, {
                            content,
                            author: msg.author.id
                        });
                        bu.send(msg, `✅ Custom command \`${title}\` set. ✅`);
                    } else {
                        bu.send(msg, 'Not enough arguments! Do `help ccommand` for more information.');
                    }
                    break;
                case 'remove':
                case 'delete':
                    if (words.length > 2) {
                        title = filterTitle(words[2]);
                        storedTag = await bu.ccommand.get(msg.channel.guild.id, title);
                        if (!storedTag) {
                            bu.send(msg, 'That ccommand doesn\'t exist!');
                            break;
                        }
                        await bu.ccommand.remove(msg.channel.guild.id, title);
                        bu.send(msg, `✅ Custom command \`${title}\` deleted. ✅`);
                    } else {
                        bu.send(msg, 'Not enough arguments! Do `help ccommand` for more information.');
                    }
                    break;
                case 'rename':
                    if (words.length > 3) {
                        title = words[2];
                        storedTag = await bu.ccommand.get(msg.channel.guild.id, title);
                        if (!storedTag) {
                            title = filterTitle(words[2]);
                            storedTag = await bu.ccommand.get(msg.channel.guild.id, title);
                            if (!storedTag) {
                                bu.send(msg, `The ccommand ${title} doesn\'t exist!`);
                                break;
                            }
                        }
                        let newTitle = filterTitle(words[3]);
                        let newTag = await bu.ccommand.get(msg.channel.guild.id, newTitle);
                        if (newTag) {
                            bu.send(msg, `The ccommand ${newTitle} already exists!`);
                        }
                        await bu.ccommand.rename(msg.channel.guild.id, title, newTitle);
                        bu.send(msg, `✅ Custom command \`${title}\` renamed. ✅`);
                    } else {
                        bu.send(msg, 'Not enough arguments! Do `help ccommand` for more information.');
                    }
                    break;
                case 'raw':
                    if (words.length > 2) {
                        title = filterTitle(words[2]);
                        storedTag = await bu.ccommand.get(msg.channel.guild.id, title);
                        if (!storedTag) {
                            bu.send(msg, 'That ccommand doesn\'t exist!');
                            break;
                        }
                        let lang = '';
                        if (storedTag.content) storedTag = storedTag.content;
                        if (/\{lang;.*?}/i.test(storedTag)) {
                            lang = storedTag.match(/\{lang;(.*?)}/i)[1];
                        }
                        content = storedTag.replace(/`/g, '`\u200B');

                        bu.send(msg, `The raw code for ${title} is\`\`\`${lang}\n${content}\n\`\`\``);
                    } else {
                        bu.send(msg, 'Not enough arguments! Do `help ccommand` for more information.');
                    }
                    break;
                case 'list':
                    let storedGuild = await bu.getGuild(msg.guild.id);
                    bu.send(msg, `Here are a list of the custom commands on this guild:\`\`\`${Object.keys(storedGuild.ccommands).join(', ')}\`\`\` `);
                    break;
                case 'sethelp':
                    if (words.length > 3) {
                        title = filterTitle(words[2]);
                        storedTag = await bu.ccommand.get(msg.channel.guild.id, title);
                        if (!storedTag) {
                            bu.send(msg, 'That ccommand doesn\'t exist!');
                            break;
                        }
                        content = bu.splitInput(text, true).slice(3).join(' ');
                        var message = "";
                        if (await bu.ccommand.sethelp(msg.channel.guild.id, title, content)) {
                            message = `✅ Help for custom command \`${title}\` set. ✅`;
                        } else {
                            message = `Custom command \`${title}\` not found. Do \`help\` for a list of all commands, including ccommands`;
                        }

                        bu.send(msg, message);
                    } else if (words.length == 2) {
                        title = filterTitle(words[2]);
                        await bu.ccommand.sethelp(msg.channel.guild.id, title, undefined);
                        bu.send(msg, `✅ Help text for \`${title}\` removed. ✅`);
                    } else {
                        bu.send(msg, `You have to tell me the name of the ccommand!`);
                    }
                    break;
                case 'help':
                    bu.send(msg, e.info);
                    break;
                case 'docs':
                    bbtag.docs(msg, words[0], words.slice(2).join(' '));
                    break;
                case 'exec':
                case 'eval':
                case 'test':
                    let args = words.slice(2), debug = false;
                    if (args.length == 0) break;
                    if (args[0].toLowerCase() == 'debug') {
                        debug = true;
                        args.shift();
                    }
                    if (args.length > 0) {
                        await bbEngine.runTag({
                            msg,
                            tagContent: args.join(' '),
                            input: '',
                            tagName: 'test',
                            isCC: true,
                            author: msg.author.id,
                            modResult(context, text) {
                                function formatDuration(duration) {
                                    return duration.asSeconds() >= 5 ?
                                        duration.asSeconds() + 's' : duration.asMilliseconds() + 'ms';
                                }
                                let lines = [
                                    '```js',
                                    `         Execution Time: ${formatDuration(context.execTimer.duration)}`,
                                    `    Variables Committed: ${context.dbObjectsCommitted}`,
                                    `Database Execution Time: ${formatDuration(context.dbTimer.duration)}`,
                                    `   Total Execution Time: ${formatDuration(context.totalDuration)}`,
                                    '```',
                                    `${text}`
                                ];
                                return lines.join('\n');
                            },
                            attach: debug ? bbtag.generateDebug(args.join(' ')) : null
                        });
                    }
                    break;
                case 'debug':
                    let result = await bbtag.executeCC(msg, filterTitle(words[2]), words.slice(3));
                    await bu.send(result.context.msg, null, bbtag.generateDebug(result.code, result.context, result.result));

                    break;
                default:
                    bu.send(msg, 'Improper usage. Do \`help ccommand\` for more details.');
                    break;
            }
        } else {
            bu.send(msg, 'Improper usage. Do \`help ccommand\` for more details.');
        }
    }
}

module.exports = CcommandCommand;
