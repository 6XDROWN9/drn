const { General } = require.main.require('./Tag/Classes');
const TagArray = require.main.require('./Tag/TagArray');
const SubTagArg = require.main.require('./Tag/SubTagArg');

class JSONTag extends General {
  constructor(client) {
    super(client, {
      name: 'json',
      args: [
        {
          name: 'namedArgs'
        }
      ],
      minArgs: 1, maxArgs: 1
    });
  }

  processEach(arg) {
    if (arg instanceof TagArray) {
      return arg.toArray();
    } else if (arg instanceof SubTagArg) {
      let arr = new TagArray([arg]);
      console.log(arr);
      arr = arr.toArray();
      console.log(arr);
      return arr[0];
    } else return arg;
  }

  async execute(ctx, args) {
    const res = await super.execute(ctx, args);
    args = args.parsedArgs.namedArgs;
    let obj;
    if (args.length === 1 && args[0] instanceof TagArray) {
      obj = args[0].toArray();
    } else if (args.filter(e => !(e instanceof SubTagArg)).length === 0) {
      obj = {};
      for (const arg of args) {
        obj[arg.name.join('')] = arg.parsedValue;
      }
    } else obj = args.length > 0 ? args.join('') : args[0];
    // for (const key in args) {
    //   if (args[key].length === 1) {
    //     args[key] = this.processEach(args[key][0]);
    //   } else {
    //     for (let i = 0; i < args[key].length; i++) {
    //       args[key][i] = this.processEach(args[key][i]);
    //     }
    //     args[key] = args[key].join('');
    //   }
    // }
    return res.setContent(JSON.stringify(obj));
    //return res;
  }
}

module.exports = JSONTag;