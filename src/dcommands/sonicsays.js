const BaseCommand = require('../structures/BaseCommand');

class SonicsaysCommand extends BaseCommand {
    constructor() {
        super({
            name: 'sonicsays',
            category: bu.CommandType.IMAGE,
            usage: 'sonicsays <text>',
            info: 'Sonic wants to share some words of wisdom.'
        });
    }

    async execute(msg, words, text) {
        if (words.length === 1) {
            return bu.send(msg, 'You didn\'t provide any text!');
        }

        bot.sendChannelTyping(msg.channel.id);

        let code = bu.genEventCode();

        let buffer = await bu.awaitEvent({
            cmd: 'img',
            command: 'sonicsays',
            code: code,
            text: words.slice(1).join(' ')
        });

        bu.send(msg, undefined, {
            file: buffer,
            name: 'sonicsays.png'
        });
    }
}

module.exports = SonicsaysCommand;
