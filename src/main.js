var prefix = 'mv',
    Directive = require('./directive'),
    Directives = require('./directives'),
    selector = Object.keys(Directives).map(function (d) {
        return '[' + prefix + '-' + d + ']'
    }).join()

function MVVM(opts) {
    var _self = this,
        root = this.el = document.getElementById(opts.id),
        els = root.querySelectorAll(selector)

    _self.bindings = {};// 接受外部传递的数据
    _self.scope = {};
    // 遍历元素，并解析指令
    [].forEach.call(els, this.compileNode.bind(this))
    this.compileNode(root)

    for (var key in _self.bindings) {
        _self.scope[key] = opts.data[key]
    }
}

MVVM.prototype.compileNode = function (node) {
    var _self = this;
    cloneAttributes(node.attributes).forEach(function (attr) {
        var directive = Directive.parse(attr, prefix);
        if (directive) {
            _self.bind(node, directive);
        }
    })
}

// clone attributes so they don't change
function cloneAttributes(attributes) {
    return [].map.call(attributes, function (attr) {
        return {
            name: attr.name,
            value: attr.value
        }
    })
}

MVVM.prototype.bind = function (node, directive) {
    directive.el = node;
    node.removeAttribute(directive.attr.name);

    var key = directive.key,
        binding = this.bindings[key] || this.createBinding(key);

    binding.directives.push(directive);
    // invoke bind hook if exists
    if (directive.bind) { // 一直没用上
        directive.bind(el, binding.value)
    }
}

MVVM.prototype.createBinding = function (key) {

    var binding = {
        value: undefined,
        directives: []
    }

    this.bindings[key] = binding;
    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.directives.forEach(function (directive) {
                directive.update(value);
            })
        }
    });

    return binding;
}

module.exports = MVVM;