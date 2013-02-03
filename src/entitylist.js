var Class = require('./class');

/**
 * The entity node is a wrapper around an entity, to be added into
 * the entity list.
 * @class
 */
var EntityNode = Class.extend({
    init: function (entity) {
        this.entity = entity;
        this.prev = null;
        this.next = null;
    }
});

/**
 * The entity list is a doubly-linked-list which allows the
 * entities to be added and removed efficiently.
 * @class
 */
var EntityList = module.exports = Class.extend({
    /**
     * @constructor
     */
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
         * Map from entity id to entity node,
         * for O(1) find and deletion.
         * @private
         */
        this._entities = {};
    },

    /**
     * Add an entity into this list.
     * @public
     * @param {Entity} entity
     */
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

    /**
     * Remove an entity from this list.
     * @public
     * @param {Entity} entity
     */
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

    /**
     * Check if this list has the entity.
     * @public
     * @param {Entity} entity
     * @return {Boolean}
     */
    has: function (entity) {
        return this._entities[entity.id] !== undefined;
    },

    /**
     * Remove all the entities from this list.
     * @public
     */
    clear: function () {
        this.head = this.tail = null;
        this.length = 0;
        this._entities = {};
    },

    /**
     * Return an array holding all the entities in this list.
     * @public
     * @return {Array}
     */
    toArray: function () {
        var array, node;

        array = [];
        for (node = this.head; node; node = node.next) {
            array.push(node.entity);
        }

        return array;
    }
});
