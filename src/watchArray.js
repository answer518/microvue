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
