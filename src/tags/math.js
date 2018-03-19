/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:49:55
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:49:55
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

const operators = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    'x': (a, b) => a * b,
    '/': (a, b) => a / b,
    ':': (a, b) => a / b,
    '%': (a, b) => a % b,
    '^': (a, b) => Math.pow(a, b)
};

module.exports =
    Builder.AutoTag('math')
        .acceptsArrays()
        .withArgs(a => [a.require('operator'), a.require('values', true)])
        .withDesc('Accepts multiple `values` and returns the result of `operator` on them. ' +
            'Valid operators are `' + Object.keys(operators).join('`, `') + '`')
        .withExample(
            '2 + 3 + 6 - 2 = {math;-;{math;+;2;3;6};2}',
            '2 + 3 + 6 - 2 = 9'
        ).beforeExecute(Builder.util.processAllSubtags)
        .whenArgs('1-2', Builder.errors.notEnoughArguments)
        .whenDefault(async function (params) {
            if (!operators.hasOwnProperty(params.args[1]))
                return await Builder.errors.invalidOperator(params);

            let operator = operators[params.args[1]];
            let values = Builder.util.flattenArgArrays(params.args.slice(2));
            values = values.map(bu.parseFloat);

            if (values.filter(isNaN).length > 0)
                return await Builder.errors.notANumber(params);

            return values.reduce(operator);
        })
        .build();