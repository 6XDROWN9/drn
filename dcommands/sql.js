var e = module.exports = {};

var util = require('util');
var Table = require('cli-table');
var moment = require('moment');


e.init = () => {
    
    

    e.category = bu.CommandType.CAT;
};
e.requireCtx = require;

e.isCommand = true;

e.hidden = false;
e.usage = '';
e.info = '';

e.execute = (msg, words) => {
    if (msg.author.id === bu.CAT_ID) {
        bu.send(msg.channel.id, 'no');
        /*
        let query = words.slice(1).join(' ');
        logger.debug(query);
        bu.db.quer//y(query, (err, rows, fields) => {
            if (err) {
                bu.send(msg.channel.id, `Error!\n\`\`\`js\n${err.stack}\n\`\`\``);
                return;
            } else {
                if (rows && rows[0]) {
                    logger.debug(fields);
                    let columns = Object.keys(rows[0]);
             //       for (let i = 0; i < columns.length; i++) {
             //           columns[i] = columns[i].toUpperCase();
             //       }
                    let table = new Table({
                        head: columns.map(m => m.toUpperCase()),
                        chars: {
                            'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
                            , 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
                            , 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
                            , 'right': '', 'right-mid': '', 'middle': ' '
                        },
                        style: { 'padding-left': 0, 'padding-right': 0 }
                    });
                    for (let i = 0; i < rows.length; i++) {
                        let data = [];
                        for (let key in columns) {
                            if (fields[key].type == 12) {
                                data.push(moment(rows[i][columns[key]]).format('YY/MM HH:mm:ss'));
                            } else
                                data.push(rows[i][columns[key]]);
                        }
                        logger.debug(data);
                        table.push(data);
                    }
                    let output = `\`\`\`prolog\n${table.toString()}\n\`\`\``.replace(/\[\d\dm/g, '');
                    if (output.length > 2000) {
                        output = output.substring(0, 1992) + '\n...\n```';
                    }
                    bu.send(msg.channel.id, output);
                } else {
                    bu.send(msg.channel.id, `No results found!`);
                }
            }
        });
        */
    }
};