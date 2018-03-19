/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:37:16
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:37:16
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.AutoTag('exec')
        .withArgs(a => [a.require('tag'), a.optional('args')])
        .withDesc('Executes another `tag`, giving it `args` as the input. Useful for modules.')
        .withExample(
            'Let me do a tag for you. {exec;f}',
            'Let me do a tag for you. User#1111 has paid their respects. Total respects given: 5'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1', Builder.errors.notEnoughArguments)
        .whenArgs('2-3', async function (params) {
            let tag = await r.table('tag').get(params.args[1]).run();
            return await this.execTag(params, tag, params.args[1], 'Tag');
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .withProp('execTag', async function (params, tag, tagName, kind) {
            if (params.msg.iterations >= 200) {
                bu.send(params.msg, 'Terminated recursive tag after 200 execs.');
                throw ('Too Much Exec');
            }
            params.msg.iterations = (params.msg.iterations + 1) || 1;

            if (tag == null)
                return await Builder.util.error(params, kind + ' not found: ' + tagName);

            if (typeof tag == 'string')
                tag = { content: tag };

            params.words = bu.splitInput(params.args[2] || '');
            params.content = tag.content;
            let result = await bu.processTag(params);
            if (result.terminate) result.terminate--;
            return result;
        }).build();