const TagError = require('./TagError');
const SubTagArg = require('./SubTagArg');
const BigNumber = require('big-number');

class TagArray extends Array {

  constructor(...vals) {
    let values = [];
    for (const val of vals) {
      if (Array.isArray(val) && !val instanceof TagArray)
        values.push(...val);
      else values.push(val);
    }
    super(...values);
  }

  static get [Symbol.species]() { return Array; }

  get rawArgs() {
    return this;
  }

  async load(ctx, name) {
    this.ctx = ctx;
    this.name = name;

    let variable = await ctx.client.TagVariableManager.executeGet(ctx, name) || '';
    if (Array.isArray(variable)) {
      this.splice(0, this.length, ...variable);
    } else {
      throw new TagError(ctx.client.Constants.TagError.NOT_AN_ARRAY, { name, value: variable });
    }

    for (let elem of this) {
      for (let subElem of elem) {
        if (Array.isArray(subElem)) subElem = new TagArray(subElem);
      }
    }

    return this;
  }

  async save(ctx, name) {
    if (ctx) this.ctx = ctx;
    if (name) this.name = name;
    await this.ctx.client.TagVariableManager.executeSet(this.ctx, this.name, this);
  }

  get last() {
    return this[this.length - 1];
  }

  set last(value) {
    return this[this.length - 1] = value;
  }

  addArgument(token) {
    let num = BigNumber(token);
    if (typeof token === 'string' && num.number !== 'Invalid Number' && num.lte(Number.MAX_SAFE_INTEGER))
      token = parseInt(token);
    else if (token === "true") token = true;
    else if (token === "false") token = false;

    if (this.length === 0) this.push([]);
    if (!Array.isArray(this.last)) {
      this.last = [this.last];
    }
    this.last.push(token);
  }

  setPosition(column, row) {
    this.column = column;
    this.row = row;
    return this;
  }

  map(...args) {
    let newArr = super.map(...args).map(a => [a]);
    this.splice(0, this.length, ...newArr);
    return this;
  }

  toString() {
    return `[${this.map(a => Array.isArray(a) ? a.join('') : a).join(';')}]`;
  }

  toJSON() {
    return JSON.stringify(this.toArray());
  }

  toArray(arr1 = this) {
    let arr = [];
    for (let el of arr1) {
      if (!Array.isArray(el)) el = [el];
      if (el.length === 1) {
        if (el[0] instanceof TagArray) {
          console.log(el[0]);
          arr.push(el[0].toArray());
        } else if (el[0] instanceof SubTagArg) {

          arr.push({ [el[0].name.join('')]: el[0].parsedValue });
        } else {
          arr.push(el[0]);
        }
      } else {
        try {
          if (el.filter(a => !(a instanceof SubTagArg)).length === 0) {
            let obj = {};
            for (let i = 0; i < el.length; i++) {
              obj[el[i].name.join('')] = el[i].parsedValue;
            }
            arr.push(obj);
          } else
            arr.push(el.join(''));
        } catch (err) {
          console.log(el);
          console.error(err);
          arr.push('');
        }
      }
    }
    return arr;
  }
}

module.exports = TagArray;