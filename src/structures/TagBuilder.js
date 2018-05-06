const ArgFactory = require('./ArgumentFactory'),
    bbEngine = require('../structures/BBTagEngine');

class TagBuilder {
    static SimpleTag(name) { return new TagBuilder().withCategory(bu.TagType.SIMPLE).withName(name); }
    static ComplexTag(name) { return new TagBuilder().withCategory(bu.TagType.COMPLEX).withName(name); }
    static ArrayTag(name) { return new TagBuilder().withCategory(bu.TagType.ARRAY).withName(name).acceptsArrays(true); }
    static CCommandTag(name) { return new TagBuilder().withCategory(bu.TagType.CCOMMAND).withName(name); }
    static AutoTag(name) { return new TagBuilder().withCategory(0).withName(name); }

    constructor(init) {
        this.properties = {};
        this.execute = {
            /** @type {number[]} */
            resolveArgs: null,
            /** @type {{ contition: subtagCondition, action: subtagAction }} */
            conditional: [],
            /** @type {subtagAction} */
            default: null
        };

        this.withProp('init', init);
        this.withProp('isTag', true);
        this.withProp('requireCtx', false);
        this.withProp('source', 'TagBuilder');
    }

    build() {
        let tag = Object.assign({}, this.properties);

        if (tag.category === 0) {
            if (tag.args != null && tag.args.length !== 0)
                tag.category = bu.TagType.COMPLEX;
            else
                tag.category = bu.TagType.SIMPLE;
        }

        tag.execute = function (definition, resolveArgs, execConditional, execDefault) {
            return async function (subtag, context) {
                try {
                    if (definition.category === bu.TagType.CCOMMAND && !context.isCC)
                        return TagBuilder.util.error(subtag, context, 'Can only use {' + definition.name + '} in CCommands');

                    if (definition.staff && !await context.isStaff)
                        return TagBuilder.util.error(subtag, context, 'Author must be staff');

                    let subtagArgs = subtag.children.slice(1);

                    let execArgs = resolveArgs != null
                        ? resolveArgs
                        : [...new Array(subtagArgs.length).keys()];

                    for (const index of new Set(execArgs))
                        if (subtagArgs[index] !== undefined)
                            subtagArgs[index] = await bbEngine.execute(subtagArgs[index], context);

                    let callback = execConditional.find(c => c.condition.apply(definition, [subtag, context, subtagArgs]));

                    for (const c of execConditional) {
                        if (c.condition.apply(definition, [subtag, context, subtagArgs])) {
                            callback = c.action;
                            break;
                        }
                    }
                    callback = callback || execDefault;

                    if (callback == null)
                        throw new Error('Missing default execution on subtag ' + definition.name + '\nParams:' + JSON.stringify(context));

                    let result = callback.apply(definition, [subtag, context, subtagArgs]);
                    if (typeof result != 'string')
                        result = await result;
                    return '' + (result == null ? '' : result);
                }
                catch (e) {
                    console.error(e);
                    throw e;
                }
            };
        }(tag,
            this.execute.resolveArgs,
            this.execute.conditional.slice(0),
            this.execute.default);
        return tag;
    }

    withProp(key, value) {
        this.properties[key] = value;
        return this;
    }

    requireStaff(staff = true) {
        return this.withProp('staff', true);
    }

    acceptsArrays(array = true) {
        return this.withProp('array', array);
    }

    isDeprecated(replacement) {
        return this.withProp('deprecated', replacement || true);
    }

    withCategory(category) {
        return this.withProp('category', category);
    }

    withName(name) {
        return this.withProp('name', name);
    }

    withAlias(...aliases) {
        return this.withProp('aliases', aliases);
    }

    withArgs(args) {
        if (typeof args === 'function')
            args = args(ArgFactory);
        return this.withProp('args', args);
    }

    withUsage(usage) {
        return this.withProp('usage', usage);
    }

    withDesc(desc) {
        return this.withProp('desc', desc);
    }

    //Either code and output or code, input and output
    withExample(code, input, output) {
        if (output == null) {
            output = input;
            input = null;
        }
        this.withProp('exampleCode', code);
        this.withProp('exampleIn', input);
        this.withProp('exampleOut', output);
        return this;
    }

    /**
     * @param {...number[]} indexes The indexes to auto-resolve. -1 = none, `null` = all
     */
    resolveArgs(...indexes) {
        this.execute.resolveArgs = indexes;
        return this;
    }

    /**
     * @param {(string|number|subtagCondition)} condition Used to determine if this is the correct action to use.
     * Numbers and strings will be parsed to a function that checks args.length
     * @param {subtagAction} action The action to be run if `condition` is successful
     */
    whenArgs(condition, action) {

        if (typeof condition === 'number')
            this.whenArgs((_, __, args) => args.length === condition, action);
        else if (typeof condition === 'string') {
            condition = condition.replace(/\s*/g, '');
            if (/^[><=!]\d+$/.test(condition)) { //<, >, = or ! a single count
                let value = parseInt(condition.substr(1));
                switch (condition[0]) {
                    case '<':
                        this.whenArgs((_, __, args) => args.length < value, action);
                        break;
                    case '>':
                        this.whenArgs((_, __, args) => args.length > value, action);
                        break;
                    case '!':
                        this.whenArgs((_, __, args) => args.length !== value, action);
                        break;
                    case '=':
                        this.whenArgs(value, action);
                        break;
                }
            } else if (/^(>=|<=)\d+$/.test(condition)) { //<= or >= a single count
                let value = parseInt(condition.substr(2));
                switch (condition.substr(0, 2)) {
                    case '>=':
                        this.whenArgs((_, __, args) => args.length >= value, action);
                        break;
                    case '<=':
                        this.whenArgs((_, __, args) => args.length <= value, action);
                        break;
                }
            } else if (/^\d+-\d+$/.test(condition)) { //inclusive range of values ex 2-5
                let split = condition.split('-'),
                    from = parseInt(split[0]),
                    to = parseInt(split[1]);

                if (from > to)
                    from = (to, to = from)[0];
                this.whenArgs((_, __, args) => args.length >= from && args.length <= to, action);
            } else if (/^\d+(,\d+)+$/.test(condition)) { //list of values ex 1, 2, 6
                let values = condition.split(',').map(v => parseInt(v));
                this.whenArgs((_, __, args) => values.indexOf(args.length) != -1, action);
            } else if (/^\d+$/.test(condition)) {//single value, no operator
                this.whenArgs(parseInt(condition), action);
            } else
                throw new Error('Failed to determine conditions for ' + condition + ' for tag ' + this.name);
        } else if (typeof condition === 'function') {
            this.execute.conditional.push({
                condition: condition,
                action: action
            });
        }
        return this;
    }

    /**
     * @param {subtagAction} execute
     */
    whenDefault(execute) {
        this.execute.default = execute;
        return this;
    }
}

TagBuilder.util = {
    async processAllSubtags(subtag, context) {
        return await Promise.all(subtag.children.slice(1)
            .map(async bb => await bbEngine.execute(bb, context)));
    },
    /**
     * If params is an array rather than actually a params object then it will be used as an indexes array and this function will return another function.
     * Basically TagBuilder.util.processSubTags([1])(params) === TagBuilder.util.processSubTags(params, [1])
     */
    async processSubtags(subtag, context, indexes) {
        return await Promise.all(subtag.children.slice(1)
            .map(async (bb, i) => {
                if (indexes.indexOf(i) != -1)
                    return await bbEngine.execute(bb, context);
                return new Promise(resolve => resolve());
            }));
    },
    flattenArgArrays(args) {
        let result = [];
        for (const arg of args) {
            let arr = bu.deserializeTagArray(arg);
            if (arr != null && Array.isArray(arr.v))
                result.push(...arr.v);
            else
                result.push(arg);
        }
        return result;
    },
    error(subtag, context, message) {
        return bbEngine.addError(subtag, context, message);
    },
    parseChannel(context, channelId) {
        let channel = context.channel;
        if (channel.id !== channelId) {
            if (!/([0-9]{17,23})/.test(channelId))
                return TagBuilder.errors.noChannelFound;
            channelId = channelId.match(/([0-9]{17,23})/)[0];
            channel = bot.getChannel(channelId);

            if (channel == null)
                return TagBuilder.errors.noChannelFound;
            if (channel.guild.id !== context.guild.id)
                return TagBuilder.errors.channelNotInGuild;
        }
        return channel;
    }
};

TagBuilder.errors = {
    notEnoughArguments(subtag, context) { return TagBuilder.util.error(subtag, context, 'Not enough arguments'); },
    tooManyArguments(subtag, context) { return TagBuilder.util.error(subtag, context, 'Too many arguments'); },
    noUserFound(subtag, context) { return TagBuilder.util.error(subtag, context, 'No user found'); },
    noRoleFound(subtag, context) { return TagBuilder.util.error(subtag, context, 'No role found'); },
    noChannelFound(subtag, context) { return TagBuilder.util.error(subtag, context, 'No channel found'); },
    noMessageFound(subtag, context) { return TagBuilder.util.error(subtag, context, 'No message found'); },
    notANumber(subtag, context) { return TagBuilder.util.error(subtag, context, 'Not a number'); },
    notAnArray(subtag, context) { return TagBuilder.util.error(subtag, context, 'Not an array'); },
    notABoolean(subtag, context) { return TagBuilder.util.error(subtag, context, 'Not a boolean'); },
    invalidOperator(subtag, context) { return TagBuilder.util.error(subtag, context, 'Invalid operator'); },
    userNotInGuild(subtag, context) { return TagBuilder.util.error(subtag, context, 'User not in guild'); },
    channelNotInGuild(subtag, context) { return TagBuilder.util.error(subtag, context, 'Channel not in guild'); },
    tooManyLoops(subtag, context) { return TagBuilder.util.error(subtag, context, 'Too many loops'); },
    unsafeRegex(subtag, context) { return TagBuilder.util.error(subtag, context, 'Unsafe regex detected'); },
    invalidEmbed(subtag, context, issue) { return TagBuilder.util.error(subtag, context, 'Inavlid embed: ' + issue); }
};

module.exports = TagBuilder;

console.info('TagBuilder loaded');

/**
 * @param {SubTag} subtag The subtag content to be executed
 * @param {Context} context The context within which execution will take place
 * @param {(string|BBTag)[]} args The arguments given to the subtag. If `resolveArgs` is null, this will all be string
 */
function subtagAction(subtag, context, args) {
    //Dummy function, purely for JSDoc
    return '';
}

/**
 * @param {SubTag} subtag The subtag content to be executed
 * @param {Context} context The context within which execution will take place
 * @param {(string|BBTag)[]} args The arguments given to the subtag. If `resolveArgs` is null, this will all be string
 */
function subtagCondition(subtag, context, args) {
    //Dummy function, purely for JSDoc
    return false;
}