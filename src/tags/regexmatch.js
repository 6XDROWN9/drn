/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:49:46
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:49:46
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.ArrayTag('regexmatch')
        .withArgs(a => [a.require('text'), a.require('regex')])
        .withDesc('Returns an array of everything in `text` that matches `regex`.')
        .withExample(
            '{regexmatch;I have $1 and 25 cents;/\\d+/g}',
            '["1", "25"]'
        ).resolveArgs(0)
        .whenArgs('0-1', Builder.errors.notEnoughArguments)
        .whenArgs(2, async function (subtag, context, args) {
            let text = args[0],
                regex;

            try {
                regex = bu.createRegExp(args[1].content);
            }
            catch (e) {
                return Builder.errors.unsafeRegex(subtag, context);
            }

            return bu.serializeTagArray(text.match(regex) || []);
        }).whenDefault(Builder.errors.tooManyArguments)
        .build();