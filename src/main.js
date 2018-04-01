var config = require('./config'),
    Mv = require('./mv'),
    directives = require('./directives'),
    filters = require('./filters'),
    controllers = require('./controllers')

Mv.config = config;

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

Mv.controller = function(id, extensions) {
    if (controllers[id]) {
        console.warn('controller "' + id + '" was already registered and has been overwritten.')
    }
    controllers[id] = extensions
}

Mv.bootstrap = function (seeds) {
    if (!Array.isArray(seeds)) seeds = [seeds]
    var instances = []
    seeds.forEach(function (seed) {
        var el = seed.el
        if (typeof el === 'string') {
            el = document.querySelector(el)
        }
        if (!el) console.warn('invalid element or selector: ' + seed.el)
        instances.push(new Mv(el, seed.data, seed.options))
    })
    return instances.length > 1
        ? instances
        : instances[0]
}

Mv.directive = function (name, fn) {
    directives[name] = fn
}

Mv.filter = function (name, fn) {
    filters[name] = fn
}

module.exports = Mv;