# microvue
this is a micro vue implements

## 如何监听对象属性的变化

ES5中新添加了一个方法：Object.defineProperty，可以自定义getter和setter函数，从而在获取对象属性和设置对象属性的时候能够执行自定义的回调函数。
```javascript
var user = {
    name: "guotingjie",
    age: "30",
    city: "beijing"
}

for(var key in user) {
    Object.defineProperty(user, key, {
        set: function(newVal) {
            console.log('监听到属性[' + key + ']发生变化,新值为:' + newVal);
        },
        get: function() {
            return bindings[variable].value
        }
    })
}

user.age = 31
```
采用递归算法，直到监听的属性不再是对象类型为止。

### 如何监听一个数组的变化

```javascript
var proto = Array.prototype,
    slice = proto.slice,
    fakeMethods = [
        'pop',
        'push',
        'reverse',
        'shift',
        'unshift',
        'splice',
        'sort'
    ]

module.exports = function(arr, callback) {
    fakeMethods.forEach(function(method) {
        arr[method] = function() {
            proto[method].apply(this, arguments);
            // 这里用于通知
            callback({
                method: method,
                args: slice.call(arguments),
                array: arr
            })
        }
    });
}
````

这里并没有重写Array类的方法，而是巧妙的通过重新创建一个"数组对象"来达到监听数组元素变化的目的。

## MVVM中的指令

指令就是定义在元素上面的一些自定义属性，每个MVVM框架的指令都会有一个统一的前缀，例如Vue指令的前缀为v-开头。指令的作用：**将DOM节点和数据一一映射，当数据发生变化时，能更新对应的DOM节点；反之DOM的响应也能反映到数据上面**