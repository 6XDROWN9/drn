/*
 * @Author: stupid cat
 * @Date: 2017-05-07 19:30:02
 * @Last Modified by: stupid cat
 * @Last Modified time: 2017-05-07 19:30:02
 *
 * This project uses the AGPLv3 license. Please read the license file before using/adapting any of the code.
 */

var e = module.exports = {
    moment: require('moment-timezone'),
    util: require('util'),
    path: require('path'),
    request: require('request'),
    fs: require('fs'),
    hbs: require('hbs'),
    'child_process': require('child_process'),
    exec: require('child_process').exec,
    Jimp: require('jimp'),
    express: require('express'),
    passport: require('passport'),
    session: require('express-session'),
    Strategy: require('passport-discord').Strategy,
    ws: require('ws'),
    cluster: require('cluster'),
    reload: require('require-reload'),
    os: require('os'),
    Eris: require('eris'),
    xml2js: require('xml2js'),
    https: require('https'),
    gm: require('gm'),
    http: require('http'),
    safe: require('safe-regex'),
    twemoji: require('twemoji'),
    svg2png: require('svg2png'),
    Table: require('cli-table'),
    youtubeStream: require('youtube-audio-stream'),
    google: require('googleapis'),
    SC: require('node-soundcloud'),
    emoji: require('node-emoji'),
    wordsearch: require('wordsearch'),
    cleverbot: require('cleverbot'),
    cleverbotIo: require('better-cleverbot-io'),
    bodyParser: require('body-parser'),
    mkdirp: require('mkdirp'),
    winston: require('winston'),
    wconfig: require('winston/lib/winston/config'),
    Trello: require('node-trello'),
    babel: require('babel-core'),
    brainfuck: new (require('brainfuck-node'))(),
    BigNumber: require('big-number')
};

Object.defineProperty(e.Eris.Message.prototype, "guild", {
    get: function guild() {
        return this.channel.guild;
    }
});