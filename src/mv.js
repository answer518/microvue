var Config = require('./config'),
    Directive = require('./directive')

var map = Array.prototype.map,
    each = Array.prototype.forEach

function Mv(el, data, options) {
    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el = el
    this.scope = {}
    this._bindings = {}
    this._options = options || {}

    // process nodes for directives
    this._compileNode(el);

    // initialize all variables by invoking setters
    for (var key in this._bindings) {
        this.scope[key] = data[key]
    }
}

Mv.prototype._compileNode = function (node) {
    var self = this

    if (node.nodeType === 3) {
        // text node
        self._compileTextNode(node)
    } else if (node.attributes && node.attributes.length) {
        // clone attributes because the list can change
        var attrs = map.call(node.attributes, function (attr) {
            return {
                name: attr.name,
                value: attr.value
            }
        })
        attrs.forEach(function (attr) {
            var directive = Directive.parse(attr)
            if (directive) {
                self._bind(node, directive)
            }
        })
    }

    if (!node['mv-block'] && node.childNodes.length) {
        each.call(node.childNodes, function (child) {
            self._compileNode(child)
        })
    }
}

Mv.prototype._compileTextNode = function () {

}

Mv.prototype._bind = function (node, directive) {

    directive.el = node;
    directive.mv = this;

    node.removeAttribute(directive.attr.name);

    var key = directive.key,
        epr = this._options.eachPrefixRE
    if (epr) {
        key = key.replace(epr, '')
    }

    var binding = this._bindings[key] || this._createBinding(key)

    // add directive to this binding
    binding.directives.push(directive)

    // invoke bind hook if exists
    if (directive.bind) { 
        // 调用directive的初始化工作
        directive.bind.call(directive, binding.value)
    }
}

Mv.prototype._createBinding = function (key) {
    var binding = {
        value: undefined,
        directives: []
    }

    this._bindings[key] = binding

    // bind accessor triggers to scope
    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.directives.forEach(function (directive) {
                directive.update(value)
            })
        }
    })

    return binding
}

Mv.prototype.dump = function () {
    var data = {}
    for (var key in this._bindings) {
        data[key] = this._bindings[key].value
    }
    return data
}

Mv.prototype.destroy = function () {
    for (var key in this._bindings) {
        this._bindings[key].directives.forEach(unbind)
        delete this._bindings[key]
    }
    this.el.parentNode.removeChild(this.el)
    function unbind(directive) {
        if (directive.unbind) {
            directive.unbind()
        }
    }
}

module.exports = Mv