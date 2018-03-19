/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:50:14
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:50:14
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.AutoTag('newline')
        .withArgs(a => a.optional('count'))
        .withDesc('Will be replaced by `count` newline characters (\\n).')
        .withExample(
            'Hello,{newline}world!',
            'Hello,\nworld!'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1-2', async function (params) {
            let count = bu.parseInt(params.args[1] || '1'),
                fallback = bu.parseInt(params.fallback);

            if (isNaN(count)) count = fallback;
            if (isNaN(count)) return await Builder.errors.notANumber(params);

            if (count < 0) count = 0;

            return new Array(count + 1).join('\n');
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();