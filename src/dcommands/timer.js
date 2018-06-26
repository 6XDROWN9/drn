const BaseCommand = require('../structures/BaseCommand');
const moment = require('moment-timezone');

class TimerCommand extends BaseCommand {
    constructor() {
        super({
            name: 'timer',
            aliases: ['stopwatch'],
            category: bu.CommandType.GENERAL,
            usage: 'timer <time>',
            info: 'Sets a timer for the provided amount of time, formatted as \'1 day 2 hours 3 minutes and 4 seconds\', \'1d2h3m4s\', or some other combination.'
        });
    }

    async execute(msg, words, text) {
        let duration = dep.moment.duration();
        if (words.length > 0) duration = bu.parseDuration(words.join(' '));
        if (duration.asMilliseconds() == 0) {
            await bu.send(msg, 'Hey, you didn\'t give me a period of time to set the timer to!\nExample: `timer 1 day, two hours`');
        } else {
            await r.table('events').insert({
                type: 'timer',
                source: msg.guild ? msg.guild.id : msg.author.id,
                user: msg.author.id,
                channel: msg.channel.id,
                starttime: r.epochTime(dep.moment().unix()),
                endtime: r.epochTime(dep.moment().add(duration).unix())
            });
            await bu.send(msg, `:alarm_clock: Ok! The timer will go off ${duration.humanize(true)}! :alarm_clock: `);
        }
    }

    async event(args) {
        let duration = dep.moment.duration(dep.moment() - dep.moment(args.starttime));
        duration.subtract(duration * 2);
        bu.send(args.channel, `:alarm_clock: *Bzzt!* <@${args.user}>, the timer you set ${duration.humanize(true)} has gone off! *Bzzt!* :alarm_clock:`);
    };
}

module.exports = TimerCommand;
