var Class = require('./class');

var EntityNode = Class.extend({
    init: function (entity) {
        this.entity = entity;
        this.prev = null;
        this.next = null;
    }
});

var EntityList = module.exports = Class.extend({
    init: function () {
        /**
         * @public
         * @readonly
         */
        this.head = null;

        /**
         * @public
         * @readonly
         */
        this.tail = null;

        /**
         * @public
         * @readonly
         */
        this.length = 0;

        /**
         * Map from entity id to entity node.
         * @private
         */
        this._entities = {};
    },

    add: function (entity) {
        var node = new EntityNode(entity);

        if (this.head === null) {
            this.head = this.tail = node;
        } else {
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
        }

        this.length += 1;
        this._entities[entity.id] = node;
    },

    remove: function (entity) {
        var node = this._entities[entity.id];

        if (node === undefined) {
            return;
        }

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

        this.length -= 1;
        delete this._entities[entity.id];
    },

    has: function (entity) {
        return this._entities[entity.id] !== undefined;
    },

    clear: function () {
        this.head = this.tail = null;
        this.length = 0;
        this._entities = {};
    },

    toArray: function () {
        var array, node;

        array = [];
        for (node = this.head; node; node = node.next) {
            array.push(node.entity);
        }

        return array;
    }
});
