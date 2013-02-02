var Class = require('./class');

var Node = module.exports = Class.extend({
    init: function (value) {
        this.value = value;
        this.prev = null;
        this.next = null;
    }
});
