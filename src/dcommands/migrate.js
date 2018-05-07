const BaseCommand = require('../structures/BaseCommand');

var confirmIrc = false;
var confirmDiscord = false;

class MigrateCommand extends BaseCommand {
    constructor() {
        super({
            name: 'migrate',
            category: bu.CommandType.CAT,
            usage: 'module <reload|unload|load> <name>',
            info: 'Loads, unloads, or reloads a command module'
        });
    }

    async execute(msg, words, text) {
        if (msg.author.id == bu.CAT_ID) {
            let tags = bu.vars.tags;
            for (let tag in tags) {
                await r.table('tag').get(tag).update({
                    vars: tags[tag]
                }).run();
            }

            let authors = bu.vars.authorTags;
            for (let author in authors) {
                await r.table('user').get(author).update({
                    vars: authors[author]
                }).run();
            }
            bu.send(msg, 'done');
        }
    }
}

module.exports = MigrateCommand;
