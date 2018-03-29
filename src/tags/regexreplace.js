/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:51:46
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-10-17 12:12:28
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder'),
    bbEngine = require('../structures/BBTagEngine');

module.exports =
    Builder.AutoTag('regexreplace')
        .withArgs(a => [a.optional('text'), a.require('regex'), a.require('replaceWith')])
        .withDesc('Replaces the `regex` phrase with `replacewith`. ' +
            'If `text` is specified, the tag is replaced with the new `toreplace`. ' +
            'If not, it is run on the output from the containing tag.')
        .withExample(
            'I like {regexreplace;to consume;/o/gi;a} cheese. {regexreplace;/e/gi;n}',
            'I likn ta cansumn chnnsn.'
        ).resolveArgs(-1)
        .whenArgs('0-1', Builder.errors.notEnoughArguments)
        .whenArgs('2-3', async function (subtag, context, args) {
            let rWith = await bbEngine.execute(args[2]),
                regex;
            try {
                regex = bu.createRegExp(args[args.length - 2].content);
            } catch (e) {
                return Builder.util.error(subtag, context, e);
            }

            if (args.length == 3)
                return (await bbEngine.execute(args[0])).replace(regex, rWith);

            context.state.replace = { regex, with: rWith };

        }).whenDefault(Builder.errors.tooManyArguments)
        .build();