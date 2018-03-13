var MVVM = function(options) {
    this._init(options);
}

MVVM.prototype._init = function() {
    this.$options = options || {};
    // options = this.$options = ;

    this._initState();

    if (options.el) {
        this.$mount(options.el);
    }
}


MVVM.prototype._initState = function() {
    this._initData();
}

MVVM.prototype._initData = function() {
    var data = this._data = this.$options.data;
    var keys = Object.keys(data);
    var i, key;
    i = keys.length;
    while (i--) {
        key = keys[i];
        this._proxy(key);
    }

    // observe data
    // observe(data, this);
}

// MVVM.prototype._initComputed = function() {}

/**
 * 通过一层代理实现 vm.prop === vm.data.prop 等价
 * @return {[type]} [description]
 */
MVVM.prototype._proxy = function() {
    var self = this;
    Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
            return self._data[key];
        },
        set: function proxySetter(val) {
            self._data[key] = val;
        }
    });
}

MVVM.prototype.$mount = function() {
	
}