/*
 * @Author: stupid cat
 * @Date: 2017-05-07 19:19:31
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 19:19:31
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

var e = module.exports = {};

e.init = () => {
    e.category = bu.TagType.COMPLEX;
};

e.requireCtx = require;

e.isTag = true;
e.name = 'uriencode';
e.args = '&lt;text&gt;';
e.usage = '{uriencode;text}';
e.desc = 'Encodes a chunk of text in URI format. Useful for constructing links.';
e.exampleIn = '​{uriencode;Hello world!}';
e.exampleOut = 'Hello%20world!';

e.execute = async function (params) {
    for (let i = 1; i < params.args.length; i++) {
        params.args[i] = await bu.processTagInner(params, i);
    }
    var replaceString = '';
    var replaceContent = false;
    if (params.args[1]) {
        replaceString = encodeURIComponent(params.args[1]);
    } else {
        replaceString = await bu.tagProcessError(params, '`Not enough arguments`');
    }

    return {
        terminate: params.terminate,
        replaceString: replaceString,
        replaceContent: replaceContent
    };
};