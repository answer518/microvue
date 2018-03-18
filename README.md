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