var Directives = require('./directives'),
    Filters = require('./filters')

var KEY_RE = /^[^\|]+/,
    FILTERS_RE = /\|[^\|]+/g;

function Directive(def, attr, arg, key) {

    if (typeof def === 'function') {
        this._update = def;
    } else {
        this._update = function() {
            // console.log(arguments)
        }
    }

    this.attr = attr;
    this.arg = arg;
    this.key = key;

    var filters = attr.value.match(FILTERS_RE);
    if (filters) {
        this.filters = filters.map(function (filter) {
            var tokens = filter.replace('|', '').trim().split(/\s+/)
            return {
                apply: Filters[tokens[0]],
                args: tokens.length > 1 ? tokens.slice(1) : null
            }
        })
    }
}

Directive.prototype.update = function (value) {
    if(this.filters) {
        value = this.applyFilter(value);
    }
    this._update(value);
}

Directive.prototype.applyFilter = function (value) {
    var filtered = value
    this.filters.forEach(function (filter) {
        filtered = filter.apply(filtered, filter.args)
    })
    return filtered
}

module.exports = {
    parse: function (attr, prefix) {
        if (attr.name.indexOf(prefix) === -1) return null // dont't begin with 'mv-' prefix.

        var noprefix = attr.name.slice(prefix.length + 1),
            argIndex = noprefix.indexOf('-'),
            name = argIndex === -1
                ? noprefix
                : noprefix.slice(0, argIndex), // 指令可能还有-
            directive = Directives[name],
            arg = argIndex === -1
                ? null
                : noprefix.slice(argIndex + 1)

        var key = attr.value.match(KEY_RE);
        return directive ? new Directive(directive, attr, arg, key[0].trim()) : null;
    }
}