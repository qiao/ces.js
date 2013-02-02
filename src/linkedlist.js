var Class = require('./class');

var LinkedList = module.exports = Class.extend({
    init: function () {
        this.head = null;
        this.tail = null;
    },

    add: function (node) {
        if (this.head === null) {
            this.head = this.tail = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }
    },

    remove: function (node) {
        if (node.prev === null) {
            this.head = node.next;
        } else {
            node.prev.next = node.next;
        }
        if (node.next === null) {
            this.tail = node.prev;
        } else {
            node.next.prev = node.prev;
        }
    },

    clear: function () {
        this.head = this.tail = null;
    },

    toArray: function () {
        var array, node;

        array = [];
        for (node = this.head; node; node = node.next) {
            array.push(node.value);
        }

        return array;
    }
});
