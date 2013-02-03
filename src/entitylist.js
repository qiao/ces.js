var Class = require('./class');

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
         * @private
         */
        this._entityIds = {};
    },

    add: function (entity) {
        if (this.head === null) {
            this.head = this.tail = entity;
        } else {
            entity.prev = this.tail;
            this.tail.next = entity;
            this.tail = entity;
        }
        this.length += 1;
        this._entityIds[entity.id] = true;
    },

    remove: function (entity) {
        if (!this.has(entity)) {
            return;
        }

        if (entity.prev === null) {
            this.head = entity.next;
        } else {
            entity.prev.next = entity.next;
        }
        if (entity.next === null) {
            this.tail = entity.prev;
        } else {
            entity.next.prev = entity.prev;
        }

        this.length -= 1;
        delete this._entityIds[entity.id];
    },

    has: function (entity) {
        return this._entityIds[entity.id] === true;
    },

    clear: function () {
        this.head = this.tail = null;
        this.length = 0;
        this._entityIds = {};
    },

    toArray: function () {
        var array, entity;

        array = [];
        for (entity = this.head; entity; entity = entity.next) {
            array.push(entity.value);
        }

        return array;
    }
});
