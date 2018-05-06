/*
 * @Author: stupid cat
 * @Date: 2017-05-07 18:53:27
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 18:54:01
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

const Builder = require('../structures/TagBuilder');

module.exports =
    Builder.CCommandTag('roleremove')
        .requireStaff()
        .withAlias('removerole')
        .withArgs(a => [a.require('role'), a.optional('user'), a.optional('quiet')])
        .withDesc('Removes `role` from `user`, where `role` is a role ID or mention. ' +
            'You can find a list of roles and their ids by doing \`b!roles\`. ' +
            'Returns true if `role` was removed, and false otherwise.' +
            'If `quiet` is specified, if a user can\'t be found it will simply return `false`'
        ).withExample(
            'No more role! {roleremove;11111111111111111}',
            'No more role! true'
        )
        .whenArgs(0, Builder.errors.notEnoughArguments)
        .whenArgs('1-3', async function (subtag, context, args) {
            let quiet = bu.isBoolean(context.scope.quiet) ? context.scope.quiet : !!args[2],
                result = await TagManager.list['userhasrole'].checkRoles(context, args[0], args[1], quiet);

            if (result.user == null) {
                if (quiet)
                    return false;
                return Builder.errors.noUserFound(subtag, context);
            }

            if (result.roles.length == 0)
                return Builder.errors.noRoleFound(subtag, context);

            let roles = result.roles.filter((e, i) => result.hasRole[i]);
            if (roles.length == 0)
                return 'false';

            try {
                for (const role of roles)
                    await result.user.removeRole(role.id);
                return 'true';
            } catch (err) {
                console.error(err);
                return 'false';
            }
        })
        .whenDefault(Builder.errors.tooManyArguments)
        .build();