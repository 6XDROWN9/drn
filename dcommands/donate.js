var e = module.exports = {};
var bu = require('./../util.js');

var bot;
e.init = (Tbot) => {
    bot = Tbot;
};

e.requireCtx = require;

e.isCommand = true;
e.hidden = false;
e.usage = 'donate';
e.info = 'Gets you my donation information';
e.category = bu.CommandType.GENERAL;

e.execute = (msg) => {
    bot.getDMChannel(msg.author.id).then(channel => {
        bu.sendMessageToDiscord(channel.id, `Hi! This is stupid cat, creator of blargbot. I hope you're enjoying it!

I don't like to beg, but right now I'm a student. Tuition is expensive, and maintaining this project isn't exactly free. I have to pay for services such as web servers and domains, not to mention invest time into developing code to make this bot as good as it can be. I don't expect to be paid for what I'm doing; the most important thing to me is that people enjoy what I make, that my product is making people happy. But still, money doesn't grow on trees. If you want to support me and what I'm doing, I have a patreon available for donations. Prefer something with less commitment? I also have a paypal available.

Thank you for your time. I really appreciate all of my users! :3

---------------------------------------------
Paypal: <http://goo.gl/Cv4M7P>
Patreon: <https://www.patreon.com/stupidcat>
---------------------------------------------
`);
    });

};