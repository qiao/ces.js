var Class = require('./class'),
    LinkedList = require('./linkedlist'),
    Node = require('./node');

var Family = module.exports = Class.extend({
    /**
     * @constructor
     * @param {Array} componentNames
     */
    init: function (componentNames) {
        this._componentNames = componentNames;

        /**
         * An object mapping from entity ids to the entity nodes.
         * @private
         */
        this._entityMap = {};

        /**
         * A linked list holding the entity nodes.
         * @private
         */
        this._entities = new LinkedList();
    },

    getEntities: function () {
        return this._entities.toArray();
    },

    /**
     * Add the entity into the family if match.
     * @public
     * @function
     * @param {Entity} entity
     */
    addEntityIfMatch: function (entity) {
        var node;

        // return if the entity is already in this family or does not match
        if (this._entityMap[entity.id] || !this._matchEntity(entity)) {
            return;
        }

        node = new Node(entity);
        this._entityMap[entity.id] = node;
        this._entities.add(node);
    },

    removeEntityIfMatch: function (entity) {
        var node;

        node = this._entityMap[entity.id];
        if (node) {
            this._entityMap[entity.id] = undefined;
            this._entities.remove(node);
        }
    },

    onComponentAdded: function (entity, componentName) {
        this.addEntityIfMatch(entity);
    },

    onComponentRemoved: function (entity, componentName) {
        var node, names, name, i, len;

        node = this._entityMap[entity.id];

        // return if the entity is not in this family
        if (!node) {
            return;
        }

        // remove the node if the removed component is required by this family
        names = this._componentNames;
        for (i = 0, len = names.length; i < len; ++i) {
            if (names[i] === componentName) {
                this._entityMap[entity.id] = undefined;
                this._entities.remove(node);
            }
        }
    },

    /**
     * Check if the entity belongs to this family.
     * @private
     * @function
     * @param {Entity} entity
     * @return {Boolean}
     */
    _matchEntity: function (entity) {
        var componentNames, i, len;

        componentNames = this._componentNames;

        for (i = 0, len = componentNames.length; i < len; ++i) {
            if (!entity.hasComponent(componentNames[i])) {
                return false;
            }
        }

        return true;
    }
});
