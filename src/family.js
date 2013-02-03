var Class = require('./class'),
    EntityList = require('./entitylist');

var Family = module.exports = Class.extend({
    /**
     * @constructor
     * @param {Array} componentNames
     */
    init: function (componentNames) {
        this._componentNames = componentNames;

        /**
         * A linked list holding the entities;
         * @public
         * @readonly
         */
        this.entities = new EntityList();
    },

    /**
     * Add the entity into the family if match.
     * @public
     * @function
     * @param {Entity} entity
     */
    addEntityIfMatch: function (entity) {
        if (!this.entities.has(entity) && this._matchEntity(entity)) {
            this.entities.add(entity);
        }
    },

    removeEntityIfMatch: function (entity) {
        this.entities.remove(entity);
    },

    onComponentAdded: function (entity, componentName) {
        this.addEntityIfMatch(entity);
    },

    onComponentRemoved: function (entity, componentName) {
        var names, i, len;

        // return if the entity is not in this family
        if (!this.entities.has(entity)) {
            return;
        }

        // remove the node if the removed component is required by this family
        names = this._componentNames;
        for (i = 0, len = names.length; i < len; ++i) {
            if (names[i] === componentName) {
                this.entities.remove(entity);
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
