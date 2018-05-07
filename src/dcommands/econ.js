const BaseCommand = require('../structures/BaseCommand');

class EconCommand extends BaseCommand {
    constructor() {
        super({
            name: 'econ',
            category: bu.CommandType.GENERAL,
            usage: 'econ <from> <to> <amount>',
            info: 'Converts currency using recent rates.'
        });
    }

    async execute(msg, words, text) {
    if (words.length < 4) {
        bu.send(msg, 'Incorrect usage!\n`econ \<from> \<to> \<amount>`');
        return;
    }
    var to = words[2].toUpperCase();
    var from = words[1].toUpperCase();
    var convert = words[3];

    var url = `http://api.fixer.io/latest?symbols=${to}&base=${from}`;

    let res = await bu.request(url);
    var rates = JSON.parse(res.body);
    if (rates.error != null && rates.error === 'Invalid base') {
        bu.send(msg, `Invalid currency ${from}\n\`econ \<from\> \<to\> \<amount\>\``);
        return;
    }
    if (rates.rates[to] == null) {
        bu.send(msg, `Invalid currency ${to}\n\`econ \<from\> \<to\> \<amount\>\``);
        return;
    }
    var converted = Math.round((convert * rates.rates[to]) * 100.0) / 100;
    var message = `${convert} ${from} is equivalent to ${converted} ${to}`;
    bu.send(msg, message);
    }
}

module.exports = EconCommand;
