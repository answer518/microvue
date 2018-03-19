module.exports = {
    text: function(el, value) {
        el.textContent = value || ''
    },
    show: function(el, value) {
        el.style.display = value ? '' : 'none'
    },
    class: function(el, value, classname) {
        el.classList[value ? 'add' : 'remove'](classname)
    },
    on: {
    	update: function() {
    		console.log(11);
    	}
    }
}
