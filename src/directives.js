var config = require('./config'),
    watchArray = require('./watchArray');

module.exports = {
    text: function (value) {
        this.el.textContent = value || ''
    },
    show: function (value) {
        this.el.style.display = value ? '' : 'none'
    },
    class: function (value) {
        this.el.classList[value ? 'add' : 'remove'](this.arg)
    },
    on: {
        update: function (handler) {
            var event = this.arg;
            if (!this.handlers) {
                this.handlers = {}
            }
            var handlers = this.handlers
            if (handlers[event]) {
                this.el.removeEventListener(event, handlers[event])
            }

            if (handler) { // like event hanlder changeMessage..
                this.el.addEventListener(event, handler)
                handlers[event] = handler
            }
        },
        unbind: function () {
            var event = this.arg;
            if (this.handlers) {
                this.el.removeEventListener(event, this.handlers[event]);
            }
        }
    },
    each: {
        bind: function () {
            // 起到了停止each的作用
            this.el.removeAttribute(config.prefix + '-each')
            this.prefixRE = new RegExp('^' + this.arg + '.')
            var ctn = this.container = this.el.parentNode
            this.marker = document.createComment('mv-each-' + this.arg + '-marker')
            ctn.insertBefore(this.marker, this.el)
            ctn.removeChild(this.el)
            this.list = []
        },
        update: function (collection) {
            if (this.list.length) {
                this.list.forEach(function (child) {
                    child.destroy()
                })
                this.list= []
            }
            // 监控数组变化
            watchArray(collection, this.mutate.bind(this))
            var self = this
            collection.forEach(function (item, i) {
                self.list.push(self.buildItem(item, i, collection))
            })
        },
        mutate: function () {
            console.log(this);
        },
        buildItem: function (data, index, collection) {
            var node = this.el.cloneNode(true),
                MVVM = require('./mv'),
                spore = new MVVM(node, data, {
                    eachPrefixRE: this.prefixRE,
                    parentScope: this.mv
                })
            this.container.insertBefore(node, this.marker)
            collection[index] = spore.scope
            return spore
        }
    }
}
