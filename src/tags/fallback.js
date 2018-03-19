/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:37:28
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:37:28
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.AutoTag('fallback')
        .withArgs(a => [a.require('message')])
        .withDesc('Should any tag fail to parse, it will be replaced with `message` instead of an error.')
        .withExample(
            '{fallback;This tag failed} {randint}',
            'This tag failed'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1', Builder.errors.notEnoughArguments)
        .whenArgs('2', async function (params) {
            return {
                fallback: params.fallback = params.args[1]
            };
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();