# microvue
this is a micro vue implements

## 如何监听一个对象的变化

ES5中新添加了一个方法：Object.defineProperty，可以自定义getter和setter函数，从而在获取对象属性和设置对象属性的时候能够执行自定义的回调函数。

当一个对象是复合对象的时候，也就是嵌套对象的时候：

```javascript
var data = {
    user: {
        name: "guotingjie",
        age: "30"
    },
    address: {
        city: "beijing"
    }
}
```
采用递归算法，直到监听的属性不再是对象类型为止。

## 如何监听一个数组的变化

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