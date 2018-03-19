/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:48:52
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:48:52
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.ArrayTag('isarray')
        .withArgs(a => a.require('text'))
        .withDesc('Determines whether `text` is a valid array.')
        .withExample(
            '{isarray;["array?"]} {isarray;array?}',
            'true false'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1', Builder.errors.notEnoughArguments)
        .whenArgs('2', async function (params) {
            let input = await bu.deserializeTagArray(params.args[1]);
            return (input != null && Array.isArray(input.v)) === true;
        }).whenDefault(Builder.errors.tooManyArguments)
        .build();