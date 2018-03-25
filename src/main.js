var prefix = 'mv',
    Filters = require('./filters'),
    Directives = require('./directives'),
    selector = Object.keys(Directives).map(function(d) {
        return '[' + prefix + '-' + d + ']'
    }).join()

function MVVM(opts) {
    var _self = this,
        root = this.el = document.getElementById(opts.id),
        els = root.querySelectorAll(selector),
        bindings = {} // 接受外部传递的数据

    _self.scope = {};
    // 遍历元素，并解析指令
    [].forEach.call(els, processNode)
        processNode(root)

    for (var key in bindings) {
        _self.scope[key] = opts.data[key]
    }

    function processNode(el) {
        cloneAttributes(el.attributes).forEach(function(attr) {
            var directive = parseDirective(attr)
            if (directive) {
                bindDirective(_self, el, bindings, directive)
            }
        })
    }
}

// clone attributes so they don't change
function cloneAttributes(attributes) {
    return [].map.call(attributes, function(attr) {
        return {
            name: attr.name,
            value: attr.value
        }
    })
}

function parseDirective(attr) {
    if (attr.name.indexOf(prefix) === -1) return

    var noprefix = attr.name.slice(prefix.length + 1),
        argIndex = noprefix.indexOf('-'),
        dirname  = argIndex === -1
                ? noprefix
                : noprefix.slice(0, argIndex),
        def = Directives[dirname],
        arg = argIndex === -1
        ? null
        : noprefix.slice(argIndex + 1)
    
    var exp = attr.value,
        pipeIndex = exp.indexOf('|'),
        key = pipeIndex === -1 ? exp.trim() : exp.slice(0, pipeIndex).trim(),
        filters = pipeIndex === -1 ? null : exp.slice(pipeIndex + 1).split('|').map(function(filter){
            return filter.trim();
        });

    return def ? {
        attr: attr,
        key: key,
        render: typeof def === 'function' ? def : def.update,
        argument: arg,
        filters: filters
    } : null;
}

function bindDirective(seed, el, bindings, directive) {
	el.removeAttribute(directive.attr.name)
    var key = directive.key, // key of data
        bingding = bindings[key];

    if (!bingding) {
        bindings[key] = bingding = {
            value: undefined,
            directives: []
        }
    }

    directive.el = el;
    bingding.directives.push(directive);
	// invoke bind hook if exists
    if (directive.bind) { // 没懂
        directive.bind(el, binding.value)
    }

    if(!seed.scope.hasOwnProperty(key)) {
    	bindAccessors(seed, key, bingding);
    }
}

function bindAccessors (seed, key, binding) {
    Object.defineProperty(seed.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.directives.forEach(function (directive) {

                var filteredValue = value && directive.filters 
                    ? applyFilters(value, directive) 
                    : value;
                
                directive.render(
                    directive.el,
                    filteredValue,
                    directive.argument, // on-click等
                    directive,
                    seed
                )
            })
        }
    })
}

function applyFilters(value, directive) {
    
    directive.filters.forEach(function(filter) {
        value = Filters[filter](value);
    })

    return value;
}

MVVM.prototype.dump = function () {
    var data = {}
    for (var key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}
    
MVVM.prototype.destroy = function () {
    for (var key in this._bindings) {
        this._bindings[key].directives.forEach(function (directive) {
            if (directive.definition.unbind) {
                directive.definition.unbind(
                    directive.el,
                    directive.argument,
                    directive
                )
            }
        })
    }
    this.el.parentNode.remove(this.el)
}

module.exports = MVVM;
