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

    self.scope = {}
    // 遍历元素，并解析指令
    ;
    [].forEach.call(els, processNode)
        // processNode(root)

    for (var key in bindings) {
        self.scope[key] = opts.data[key]
    }

    function processNode(el) {
        cloneAttributes(el.attributes).forEach(function(attr) {
            var directive = parseDirective(attr)
            if (directive) {
                bindDirective(self, el, bindings, directive)
            }
        })
    }
}

// clone attributes so they don't change
function cloneAttributes(attributes) {
    return [].map.call(attributes, function(attr) {
        // console.log(attr.name + '   ' + attr.value)
        return {
            name: attr.name,
            value: attr.value
        }
    })
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
    if (directive.bind) {
        // directive.bind(el, binding.value)
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
                if (value && directive.filters) {
                    value = applyFilters(value, directive)
                }
                directive.render(
                    directive.el,
                    value,
                    directive.argument,
                    directive,
                    seed
                )
            })
        }
    })
}

function parseDirective(attr) {
    if (attr.name.indexOf(prefix) === -1) return

    var noprefix = attr.name.slice(prefix.length + 1),
        dirname = noprefix,
        def = Directives[dirname],
        arg = null;

    var exp = attr.value,
        key = exp.trim();

    return def ? {
        attr: attr,
        key: key,
        render: def
    } : null;
}

module.exports = MVVM;
