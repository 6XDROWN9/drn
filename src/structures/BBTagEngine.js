'use strict';

/**
 * This represents a block of text within the BBTag language.
 */
class BaseTag {

    /** The whole text from which this tag and its relatives can be derived */
    get source() { return this._protected.source; }
    /** The position in `source` where this tag starts */
    get start() { return this._protected.start; }
    /** The position in `source` where this tag ends */
    get end() { return this._protected.end; }
    /** The text that is contained in this tag */
    get content() { return this.source.slice(this.start, this.end); }
    /** The tag which this tag is contained within */
    get parent() { return this._protected.parent; }
    /** All the tags contained withinin this tag */
    get children() { return this._protected.children; }

    /** @param {string|BaseTag} parent The parent of this tag */
    constructor(parent) {
        /**
         * The protected properties of this tag
         * @type {BaseTagProtected}
         * @protected
         */
        this._protected = {
            children: []
        };
        if (typeof parent == 'string')
            this._protected.source = parent;
        else {
            this._protected.parent = parent;
            this._protected.source = parent.source;
        }
    }
}

/**
 * This represents both the top level text, and the contents of each argument in a subtag.
 * A subtag is a block of text between and including a {} pair, with arguments delimited by ;
 */
class BBTag extends BaseTag {
    /**
     * Attempts to create a BBTag object from the given values.
     * @param {string|SubTag} parent The parent to use for creation of this BBTag instance
     * @param {StringIterator} iterator The start position of this BBTag instance
     */
    static parse(parent, iterator = null) {
        if (typeof parent != 'string' && iterator == null)
            throw ('Must supply an iterator when parent is not a string');
        iterator = iterator || new StringIterator(parent);
        let result = new BBTag(parent);
        result._protected.start = iterator.current;

        do {
            if (iterator.nextChar == '}') break;
            if (iterator.nextChar == ';' && typeof parent != 'string') break;
            if (iterator.nextChar == '{') {
                result._protected.children.push(SubTag.parse(result, iterator));
                iterator.moveBack();
            }
        } while (iterator.moveNext());

        result._protected.end = iterator.current;
        return result;
    }

    /** @param {string|SubTag} parent */
    constructor(parent) { super(parent); }
}


/**
 * This represents a recognized subtag structure. Subtags are strings starting and ending with {}
 * And contain sections of BBTag delimited by ;
 */
class SubTag extends BaseTag {
    /**
     * Attempts to create a SubTag object from the given values.
     * @param {BBTag} parent The parent to use for creation of this SubTag instance
     * @param {StringIterator} iterator The start position of this SubTag instance
     */
    static parse(parent, iterator) {
        let result = new SubTag(parent);
        result._protected.start = iterator.current;

        while (iterator.moveNext()) {
            if (iterator.prevChar == '}') break;
            result._protected.children.push(BBTag.parse(result, iterator));
        }

        result._protected.end = iterator.current;
        return result;
    }


    /** @param {string|SubTag} parent */
    constructor(parent) {
        super(parent);
        /** @type {BaseTag|string} */
        this.name = this.children[0];
    }
}

class Context {
    static async deserialize(obj) {
        let msg;
        try {
            msg = await bot.getMessage(obj.msg.channel.id, obj.msg.id);
        } catch (err) {
            let channel = (await bot.getChannel(obj.msg.channel.id));
            let member;
            if (channel == null) {
                channel = JSON.parse(obj.msg.channel.serialized);
                member = JSON.parse(obj.msg.member.serialized);
            }
            else
                member = channel.guild.members.get(obj.msg.member.id) || JSON.parse(obj.msg.member.serialized);
            msg = {
                id: obj.msg.id,
                timestamp: obj.msg.timestamp,
                content: obj.msg.content,
                channel,
                member,
                guild: channel.guild,
                author: member.user,
                attachments: obj.msg.attachments,
                embeds: obj.msg.embeds
            };
        }
        let result = new Context({ msg, isCC: obj.isCC, tagName: obj.tagName, author: obj.author });
        result.scopes._scopes = [obj.scope];
        result.state = obj.state;
        result.input = obj.input;

        for (const key of Object.keys(obj.tempVars || {}))
            result.variables.cache[key] = new CacheEntry(result, key, obj.tempVars[key]);
        return result;
    }

    get channel() { return this.message.channel; }
    get member() { return this.message.member; }
    get guild() { return this.message.channel.guild; }
    get user() { return this.message.author; }
    get scope() { return this.scopes.local; }
    /** @type {Promise<boolean>} */
    get isStaff() { return this['_isStaff'] || (this['_isStaff'] = bu.isUserStaff(this.author, this.guild.id)); }
    get author() { return this._author || this.guild.id; }

    /**
     * Creates a new BBTagExecContext instance
     * @param {runArgs} options The message that this context is regarding
     * @param {Context} parent The parent scope to initialize this one from
     */
    constructor(options) {
        this.message = this.msg = options.msg;
        this.input = bu.splitInput(options.input || '');
        if (this.input.length == 1 && this.input[0] == '')
            this.input = [];
        this.isCC = options.isCC;
        this._author = options.author;
        this.tagName = options.tagName;

        /** @type {bbError[]} */
        this.errors = [];
        this.scopes = new StateScopes();
        this.variables = new VariableCache(this);
        this.state = {
            return: 0,
            stackSize: 0,
            repeats: 0,
            embed: null,
            reactions: [],
            nsfw: null,
            dmCount: 0,
            timerCount: 0,
            /** @type {{regex: RegExp|string, with: string}} */
            replace: null,
            break: 0,
            continue: 0
        };
    }

    /**
     * @param {runArgs} options The option overrides to give to the new context
     */
    makeChild(options = {}) {
        let context = new Context(options, this);
        context.state = this.state;
        context.scopes = this.scopes;
        context.variables = this.variables;

        if (options.msg === undefined) context.msg = context.message = this.msg;
        if (options.input === undefined) context.input = this.input;
        if (options.isCC === undefined) context.isCC = this.isCC;
        if (options.tagName === undefined) context.tagName = this.tagName;
        if (options.author === undefined) context.author = this.author;

        return context;
    }

    serialize() {
        return {
            msg: {
                id: this.message.id,
                timestamp: this.message.timestamp,
                content: this.message.content,
                channel: serializeEntity(this.channel),
                member: serializeEntity(this.member),
                attachments: this.message.attachments,
                embeds: this.message.embeds
            },
            isCC: this.isCC,
            state: Object.assign({}, this.state),
            scope: Object.assign({}, this.scope),
            input: this.input,
            tagName: this.tagName,
            author: this.author,
            tempVars: this.variables.list
                .filter(v => v.key.startsWith('~'))
                .reduce((p, v) => {
                    p[v.key] = v.value;
                    return p;
                }, {})
        };
    }
}

function serializeEntity(entity) {
    return { id: entity.id, serialized: JSON.stringify(entity) };
}

class StateScopes {
    constructor() {
        /** @type {StateScope[]} */
        this._scopes = [{}];
    }

    get local() { return this._scopes[this._scopes.length - 1]; };
    get(offset) { return this._scopes[this._scopes.length - 1 - offset]; }

    beginScope() {
        this._scopes.push(Object.assign({}, this.local));
    }

    finishScope() {
        this._scopes.pop();
    }
}

class CacheEntry {
    get updated() { return JSON.stringify(this.original) != JSON.stringify(this.value); }

    constructor(context, key, original) {
        this.context = context;
        this.key = key;
        this.original = original;
        this.value = original;
    }

    async persist() {
        if (this.original != this.value) {
            let scope = bu.tagVariableScopes.find(s => this.key.startsWith(s.prefix));
            if (scope == null) throw new Error('Missing default variable scope!');
            await scope.setter(this.context, this.key.substring(scope.prefix.length), this.value || undefined);
            this.original = this.value;
        }
    }
}

class VariableCache {
    get list() { return Object.keys(this.cache).map(k => this.cache[k]); }

    constructor(parent) {
        this.parent = parent;
        /** @type {Object.<string, CacheEntry>} */
        this.cache = {};
    }

    /** @param {string} variable The name of the variable to retrieve @returns {string}*/
    async get(variable) {
        let forced = variable.startsWith('!');
        if (forced) variable = variable.substr(1);
        if (this.cache[variable] == null) {
            let scope = bu.tagVariableScopes.find(s => variable.startsWith(s.prefix));
            if (scope == null) throw new Error('Missing default variable scope!');
            try {
                this.cache[variable] = new CacheEntry(this.parent, variable,
                    await scope.getter(this.parent, variable.substring(scope.prefix.length)) || '');
            } catch (err) {
                console.error(err, this.parent.isCC, this.parent.tagName);
            }
        }
        return this.cache[variable].value;
    }

    /**
     * @param {string} variable The variable to store
     * @param {string} value The value to set the variable to
     */
    async set(variable, value) {
        let forced = variable.startsWith('!');
        if (forced) variable = variable.substr(1);
        if (this.cache[variable] == null)
            await this.get(variable);
        this.cache[variable].value = value;
        if (forced)
            await this.cache[variable].persist();
    }

    async reset(variable) {
        if (this.cache[variable] == null)
            await this.get(variable);
        this.cache[variable].value = this.cache[variable].original;
    }

    async persist(variables = null) {
        await Promise.all((variables || Object.keys(this.cache))
            .map(async key => this.cache[key]
                ? await this.cache[key].persist()
                : null));
    }
}

/**
 * A tool to navigate a string. Used to communicate between scopes
 * @prop {number} current The current cursor position. This is always between characters, or at the start/end of the string
 * @prop {string} content The text that this iterator is for
 */
class StringIterator {
    /** Gets the character after the current cursor position */
    get nextChar() { return this.content.slice(this.current, this.current + 1); }
    /** Gets the character before the current cursor position */
    get prevChar() { return this.content.slice(Math.max(0, this.current - 1), this.current); }

    constructor(text) {
        this.content = text;
        this.current = 0;
    }

    /** Attempts to move the cursor 1 place forwards. If successful, it returns `true`, otherwise `false` */
    moveNext() {
        if (this.current != this.content.length) {
            this.current += 1;
            return true;
        }
        return false;
    }

    /** Attempts to move the cursor 1 place backwards. If successful, it returns `true`, otherwise `false` */
    moveBack() {
        if (this.current != 0) {
            this.current -= 1;
            return true;
        }
        return false;
    }
}

/**
 * Parses the given text as BBTag
 * @param {string} content The text to parse
 * @returns {{success: boolean, bbtag?: BBTag, error?: string}}
 */
function parse(content) {
    let bbtag = BBTag.parse(content);
    if (bbtag.content.length != bbtag.source.length)
        return { success: false, error: 'Unexpected \'}\' at ' + (bbtag.content.length) };
    let error = bbtag.children.find(c => !c.content.endsWith('}'));
    if (error != null)
        return { success: false, error: 'Unmatched \'{\' at ' + error.start };
    return { success: true, bbtag };
}

/**
 * This will execute all SubTags contained within a given BBTag element,
 * and then return the string to replace the BBTag element with
 * @param {BBTag} bbtag The BBTag node to begin execution at
 * @param {Context} context The context to be used for execution
 * @returns {string}
 */
async function execute(bbtag, context) {
    if (!context.guild) return;
    if (!(bbtag instanceof BBTag))
        throw new Error('Execute can only accept BBTag as its first parameter');
    let result = [],
        startOffset = (bbtag.content.match(/^[\s\n\r]*/) || [''])[0].length,
        endOffset = (bbtag.content.match(/[\s\n\r]*$/) || [''])[0].length,
        prevIndex = bbtag.start + startOffset,
        content = bbtag.source;

    context.scopes.beginScope();
    for (const subtag of bbtag.children) {
        result.push(content.slice(prevIndex, subtag.start));
        prevIndex = subtag.end;

        if (subtag.children.length == 0) {
            result.push(addError(subtag, context, 'Missing SubTag declaration'));
            continue;
        }
        let name = await execute(subtag.children[0], context);
        let definition = TagManager.list[name.toLowerCase()];
        if (definition == null) {
            result.push(addError(subtag, context, 'Unknown subtag ' + name));
            continue;
        }

        subtag.name = name;
        try {
            result.push(await definition.execute(subtag, context));
        } catch (err) {
            result.push(addError(subtag, context, 'An internal server error has occurred'));
            bu.send('250859956989853696', {
                content: 'A tag error occurred.',
                embed: {
                    title: err.message,
                    description: err.stack,
                    fields: [
                        { name: 'Tag Name', value: context.tagName, inline: true },
                        { name: 'Location', value: `${subtag.start} - ${subtag.end}`, inline: true },
                        { name: 'Channel | Guild', value: `${context.channel.id} | ${context.guild.id}`, inline: true },
                        { name: 'CCommand', value: context.isCC ? 'Yes' : 'No', inline: true }
                    ]
                }
            });
        }
        if (context.state.return != 0)
            break;
    }
    if (context.state.return == 0)
        result.push(content.slice(prevIndex, Math.max(prevIndex, bbtag.end - endOffset)));
    context.scopes.finishScope();
    return result.join('');
}

/**
 * Parses a string as BBTag and executes it
 * @param {string} string The string content of BBTag to execute
 * @param {Context} context The context to perform execution in
 * @returns {string} The string result from executing the string
 */
async function execString(string, context) {
    let parsed = parse(string);
    if (!parsed.success)
        return addError({}, context, parsed.error);
    return await execute(parsed.bbtag, context);
}

/**
 * Adds an error in the place of the tag
 * @param {BaseTag} tag The tag which contained the error
 * @param {Context} context The context in which the error will be places
 * @param {string} message The error message to show
 * @returns {string} The formatted error message
 */
function addError(tag, context, message) {
    if (typeof message == 'string')
        message = '`' + message + '`';
    context.errors.push({ tag: tag, error: tag.name + ': ' + message });
    if (context.scope.fallback == null)
        return message;
    return context.scope.fallback;
}

/**
 * @typedef {Object} runArgs
 * @property {Object} runArgs.msg The message that triggered this tag.
 * @property {string} runArgs.tagContent The content of the tag to be run
 * @property {string} runArgs.input The input provided to the tag
 * @property {boolean} runArgs.isCC Is the context a custom command context
 * @property {function(string):(Promise<string>|string)} runArgs.modResult Modifies the result before it is sent
 * @property {string} [runArgs.tagName] The name of the tag being run
 * @property {string} [runArgs.author] The ID of the author of the tag being run
 * @property {function(Context,string):{name:string,file:string}} [runArgs.attach] A function to generate an attachment
 */

/**
 * Either provide a string and Context, or runArgs and Context is optional
 * @param {runArgs|string} content
 * @param {Context} [context]
 */
async function runTag(content, context) {
    let config = {};
    if (typeof content == 'string') {
        if (!(context instanceof Context))
            throw new Error('Unable to build a context with the given args');
    }
    else {
        if (context == null)
            context = new Context(content);
        config = content;
        content = content.tagContent;
    }

    let result = await execString(content.trim(), context);
    result = result.trim();

    await context.variables.persist();

    if (result != null && context.state.replace != null)
        result.replace(context.state.replace.regex, context.state.replace.with);

    result = (config.modResult || (c => c))(result);

    if (typeof result == 'object')
        result = await result;

    if (context.state.embed == null && (result == null || result.trim() == '')) {
        console.debug('End run tag - No output');
        return { context, result, response: null };
    }

    let attachment = (config.attach || (c => null))(context, result);

    let response = await bu.send(context.msg,
        {
            content: result,
            embed: context.state.embed,
            nsfw: context.state.nsfw
        }, attachment);
    if (response != null && response.channel != null)
        await bu.addReactions(response.channel.id, response.id, [...new Set(context.state.reactions)]);
    return { context, result, response };
};

module.exports = {
    BBTag,
    SubTag,
    Context,
    parse,
    execute,
    execString,
    addError,
    runTag
};

/**
 * @typedef {Object} BaseTagProtected
 * @property {string} BaseTagPrivate.source
 * @property {BaseTag} [BaseTagPrivate.parent]
 * @property {BaseTag[]} BaseTagPrivate.children
 * @property {number} start
 * @property {number} end
 */

/**
 * @typedef {Object} StateScope
 * @property {boolean} StateScope.quiet
 * @property {string} StateScope.fallback
 */

 /**
 * @typedef {Object} bbError An error that ocurred while executing BBTag
 * @property {BaseTag} bbError.tag The loacation that the error ocurred
 * @property {string|bbError[]} bbError.error The error that happened
 */
