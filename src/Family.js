var Class = require('./Class'),
    LinkedList = require('./LinkedList'),
    Node = require('./Node');

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
         * @public
         * @readonly
         */
        this.entities = new LinkedList();
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
        this.entities.add(node);
    },

    removeEntityIfMatch: function (entity) {
        var node;

        node = this._entityMap[entity.id];
        if (node) {
            this._entityMap[entity.id] = undefined;
            this.entities.remove(node);
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
                this.entities.remove(node);
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
