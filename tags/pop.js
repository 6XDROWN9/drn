var e = module.exports = {};

e.init = () => {
    e.category = bu.TagType.COMPLEX;
};

e.requireCtx = require;

e.isTag = true;
e.name = `pop`;
e.args = `&lt;pop&gt;`;
e.usage = `{pop;array}`;
e.desc = `Returns the last element in an array. If used with {get} or {aget}, this will remove the last element from the array as well.`;
e.exampleIn = `{shift;["this", "is", "an", "array"]}`;
e.exampleOut = `this`;

e.execute = async function(params) {
    for (let i = 1; i < params.args.length; i++) {
        params.args[i] = await bu.processTagInner(params, i);
    }
    let replaceContent = false;
    let replaceString;
    if (params.args.length >= 2) {
        params.args[1] = await bu.processTagInner(params, 1);
        let args1 = params.args[1];
        let deserialized = bu.deserializeTagArray(args1);
        
        if (deserialized && Array.isArray(deserialized.v)) {
            replaceString = deserialized.v.pop();
            if (deserialized.n) {
                await bu.setArray(deserialized, params);
            }
        } else {
            replaceString = await bu.tagProcessError(params, params.fallback, '`Not an array`');
        }
    } else {
        replaceString = await bu.tagProcessError(params, params.fallback, '`Not enough arguments`');
    }

    return {
        replaceString: replaceString,
        replaceContent: replaceContent
    };
};