/*
 * @Author: stupid cat
 * @Date: 2017-05-21 00:22:32
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-11-01 09:52:35
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.CCommandTag('roledelete')
        .requireStaff()
        .withArgs(a => [a.require('role'), a.optional('quiet')])
        .withDesc('Deletes `role`. If `quiet` is specified, if `role` can\'t be found it will return nothing')
        .withExample(
            '{roledelete;Super Cool Role!}',
            '(rip no more super cool roles for anyone)'
        )
        .whenArgs(0, Builder.errors.notEnoughArguments)
        .whenArgs('1-2', async function (subtag, context, args) {
            let quiet = bu.isBoolean(context.scope.quiet) ? context.scope.quiet : !!args[1],
                role = await bu.getRole(context.msg, args[0], quiet);
            if (role) {
                try {
                    await role.delete(`Deleted with the '${context.tagName}' command, executed by ${context.user.username}#${context.user.discrim} (${context.user.id})`);
                } catch (err) {
                    console.error(err.stack);
                    return Builder.util.error(subtag, context, 'Failed to delete role: no perms');
                }
            }
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();