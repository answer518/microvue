var Config = require('./config'),
    Mv = require('./mv'),
    Directives = require('./directives'),
    filters = require('./filters')

Mv.config = Config;

Mv.extends = function (opts) {
    var Spore = function () {
        Mv.apply(this, arguments)
        for (var prop in this.extensions) {
            var ext = this.extensions[prop]
            this.scope[prop] = (typeof ext === 'function')
                ? ext.bind(this)
                : ext
        }
    }
    Spore.prototype = Object.create(Mv.prototype)
    Spore.prototype.extensions = {}
    for (var prop in opts) {
        Spore.prototype.extensions[prop] = opts[prop]
    }
    return Spore
}

Mv.directive = function (name, fn) {
    directives[name] = fn
}

Mv.filter = function (name, fn) {
    filters[name] = fn
}

module.exports = Mv;