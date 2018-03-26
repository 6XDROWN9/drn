const BigNumber = require('big-number');

class SubTagArg {
  constructor(columnIndex, rowIndex) {
    this.columnIndex = columnIndex;
    this.rowIndex = rowIndex;
    this.name = [];
    this.value = [];
    this.separated = false;
  }

  addArgument(arg) {
    if (this.separated)
      this.value.push(arg);
    else this.name.push(arg);
  }

  serialize() {
    return `{*${this.name.map(v => v.toString()).join('')};${this.value.map(v => v.toString()).join('')}}`;
  }

  toString() {
    return this.serialize();
  }

  get parsedValue() {
    const TagArray = require('./TagArray');
    let arr = new TagArray(this.value);
    arr = arr.toArray();
    let val = arr[0];
    let num = BigNumber(val);
    if (num.number !== 'Invalid Number' && num.lte(Number.MAX_SAFE_INTEGER))
      val = parseInt(val);
    else if (val === "true") val = true;
    else if (val === "false") val = false;
    return val;
  }
}

module.exports = SubTagArg;