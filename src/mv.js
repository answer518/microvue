var config = require('./config'),
    controllers = require('./controllers'),
    bindingParser = require('./binding')

var map = Array.prototype.map,
    each = Array.prototype.forEach

// lazy init
var ctrlAttr,
    eachAttr

function Mv(el, data, options) {

    // refresh
    ctrlAttr = config.prefix + '-controller'
    eachAttr = config.prefix + '-each'

    if (typeof el === 'string') {
        el = document.querySelector(el)
    }

    this.el = el
    this.scope = {}
    this._bindings = {}
    this._options = options || {}

    var key
    // keep a temporary copy for all the real data
    // so we can overwrite the passed in data object
    // with getter/setters.
    this._dataCopy = {}
    for (key in data) {
        this._dataCopy[key] = data[key]
    }

    // if has controller
    var ctrlID = el.getAttribute(ctrlAttr),
        controller = null
    if (ctrlID) {
        controller = controllers[ctrlID]
        el.removeAttribute(ctrlAttr)
        if (!controller) throw new Error('controller ' + ctrlID + ' is not defined.')
    }

    // process nodes for directives
    this._compileNode(el, true);
    // initialize all variables by invoking setters
    for (key in this._dataCopy) {
        this.scope[key] = this._dataCopy[key]
    }
    delete this._dataCopy

    // copy in methods from controller
    if (controller) {
        controller.call(null, this.scope, this)
    }
}

Mv.prototype._compileNode = function (node, root) {
    var self = this

    if (node.nodeType === 3) {
        // text node
        self._compileTextNode(node)
    } else if (node.attributes && node.attributes.length) {
        var eachExp = node.getAttribute(eachAttr),
            ctrlExp = node.getAttribute(ctrlAttr)

        if (eachExp) { // each block
            var binding = bindingParser.parse(eachAttr, eachExp)
            if (binding) {
                // bindings => { arg: todo, key: todos }
                self._bind(node, binding)
                // need to set each block now so it can inherit
                // parent scope. i.e. the childSeeds must have been
                // initiated when parent scope setters are invoked
                self.scope[binding.key] = self._dataCopy[binding.key]
                delete self._dataCopy[binding.key]
            }
        } else if (ctrlExp && !root) { // nested controllers

            // TODO need to be clever here!

        } else { // no controller

            if (node.childNodes.length) {
                each.call(node.childNodes, function (child) {
                    self._compileNode(child)
                })
            }

            // clone attributes because the list can change
            var attrs = map.call(node.attributes, function (attr) {
                return {
                    name: attr.name,
                    expressions: attr.value.split(',')
                }
            })

            attrs.forEach(function (attr) {
                var valid = false
                attr.expressions.forEach(function (exp) {
                    var binding = bindingParser.parse(attr.name, exp)
                    if (binding) {
                        valid = true
                        self._bind(node, binding)
                    }
                })
                if (valid) node.removeAttribute(attr.name)
            })

        }
    }
}

Mv.prototype._compileTextNode = function (node) {
    return node
}

Mv.prototype._bind = function (node, bindingInstance) {

    bindingInstance.el = node;
    bindingInstance.mv = this;

    var key = bindingInstance.key,
        epr = this._options.eachPrefixRE,
        isEachKey = epr && epr.test(key),
        scopeOwner = this

    // TODO make scope chain work on nested controllers
    if (isEachKey) {
        key = key.replace(epr, '')
    } else if (epr) {
        scopeOwner = this._options.parentScope
    }

    var binding = scopeOwner._bindings[key] || scopeOwner._createBinding(key)

    // add directive to this binding
    binding.instances.push(bindingInstance)

    // invoke bind hook if exists
    if (bindingInstance.bind) {
        // 调用directive的初始化工作
        bindingInstance.bind(binding.value)
    }
}

Mv.prototype._createBinding = function (key) {
    var binding = {
        value: null,
        instances: []
    }

    this._bindings[key] = binding

    // bind accessor triggers to scope
    Object.defineProperty(this.scope, key, {
        get: function () {
            return binding.value
        },
        set: function (value) {
            binding.value = value
            binding.instances.forEach(function (instance) {
                instance.update(value)
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
        this._bindings[key].instances.forEach(unbind)
        delete this._bindings[key]
    }
    this.el.parentNode.removeChild(this.el)
    function unbind(instance) {
        instance.unbind && instance.unbind();
    }
}

module.exports = Mv