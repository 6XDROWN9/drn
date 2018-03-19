/*
 * @Author: stupid cat
 * @Date: 2017-05-07 19:05:37
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 19:05:37
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.AutoTag('throw')
        .withArgs(a => a.optional('error'))
        .withDesc('Throws `error`.')
        .withExample(
            '{throw;Custom Error}',
            '\u200B`Custom Error`\u200B'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1-2', async function (params) {
            let error = params.args[1];
            return await Builder.util.error(params, error || 'A custom error occured');
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();