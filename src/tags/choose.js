/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:30:33
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:30:33
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder'),
    bbEngine = require('../structures/BBTagEngine');

module.exports =
    Builder.AutoTag('choose')
        .withArgs(a => [a.require('choice'), a.require('options', true)])
        .withDesc('Chooses from the given `options`, where `choice` is the index of the option to select.')
        .withExample(
            'I feel like eating {choose;1;cake;pie;pudding} today.',
            'I feel like eating pie today.'
        ).resolveArgs(0)
        .whenArgs('0-1', Builder.errors.notEnoughArguments)
        .whenDefault(async function (subtag, context, args) {
            let index = bu.parseInt(args[0]);

            if (isNaN(index))
                return Builder.errors.notANumber(subtag, context);

            if (index < 0)
                return Builder.util.error(subtag, context, 'Choice cannot be negative');

            return await bbEngine.execute(args[index], context);
        })
        .build();