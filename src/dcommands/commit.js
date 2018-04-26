var e = module.exports = {};
const sf = require('snekfetch');

e.init = () => {
    e.category = bu.CommandType.IMAGE;
};

e.isCommand = true;

e.requireCtx = require;
e.hidden = false;
e.usage = 'commit [number]';
e.info = 'Gets a random or specified blargbot commit.';
e.longinfo = '<p>Gets a random or specified blargbot commit.</p>';

let total = 0;
e.execute = async function (msg, words) {
    if (total === 0) {
        let c = await sf.get('https://api.github.com/repos/ratismal/blargbot/contributors')
            .query({
                sha: '99c8220734c1b6ce391d828a5b5a8425ab7e766e'
            });
        for (const contrib of c.body) {
            total += contrib.contributions;
        }
    }
    let page;
    if (words[1]) {
        page = parseInt(words[1]);
        if (isNaN(page))
            return await bu.send(msg, 'Invalid number!');

        if (page < 0) page = 0;
        page -= 1;
    } else page = bu.getRandomInt(0, total - 1);
    console.log(total, page);
    let { body } = await sf.get('https://api.github.com/repos/ratismal/blargbot/commits')
        .query({
            sha: '99c8220734c1b6ce391d828a5b5a8425ab7e766e',
            per_page: 1,
            page: page
        });
    if (body.length === 0) {
        return await bu.send(msg, 'A commit was not found!');
    }
    body = body[0];
    let author = {};
    if (body.author) {
        author.name = body.author.login;
        author.icon_url = body.author.avatar_url;
        author.url = body.author.html_url;
    } else {
        author.name = body.commit.author.name;
    }
    await bu.send(msg, {
        embed: {
            author,
            title: body.sha.substring(0, 7) + ' - commit #' + (page + 1),
            url: body.html_url,
            description: body.commit.message,
            color: bu.getRandomInt(0x1, 0xffffff)
        }
    })
};