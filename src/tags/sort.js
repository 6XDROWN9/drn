/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:57:36
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-16 19:40:38
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.ArrayTag('sort')
        .withArgs(a => [a.require('array'), a.optional('descending')])
        .withDesc('Sorts the `array` in ascending order. ' +
            'If `descending` is provided, sorts in descending order. ' +
            'If `{get}` is used, will modify the original `array`.')
        .withExample(
            '{sort;[3, 2, 5, 1, 4]}',
            '[1,2,3,4,5]'
        )
        .whenArgs(0, Builder.errors.notEnoughArguments)
        .whenArgs('1-2', async function (subtag, context, args) {
            let arr = await bu.getArray(context, args[0]),
                descending = bu.parseBoolean(args[1]);

            if (!bu.isBoolean(descending))
                descending = !!args[1];

            if (arr == null || !Array.isArray(arr.v))
                return Builder.errors.notAnArray(subtag, context);

            arr.v = arr.v.sort(bu.compare);
            if (descending) arr.v.reverse();

            if (!arr.n)
                return bu.serializeTagArray(arr.v);
            await context.variables.set(arr.n, arr.v);
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();