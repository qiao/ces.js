var Class = require('./class'),
    Family = require('./family'),
    EntityList = require('./entitylist');

/**
 * @class
 */
var World = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        /**
         * A map from familyId to family
         * @private
         */
        this._families = {};
        this._systems = [];
        this._entities = new EntityList();
    },

    /**
     * @public
     */
    addSystem: function (system) {
        system.world = this;
        this._systems.push(system);
        return this;
    },

    /**
     * @public
     */
    addEntity: function (entity) {
        var families, familyId, self;

        // try to add the entity into each family
        families = this._families;
        for (familyId in families) {
            families[familyId].addEntityIfMatch(entity);
        }

        self = this;

        // update the entity-family relationship whenever components are
        // added to or removed from the entities
        entity.onComponentAdded.add(function (entity, component) {
            self._onComponentAdded(entity, component);
        });
        entity.onComponentRemoved.add(function (entity, component) {
            self._onComponentRemoved(entity, component);
        });

        this._entities.add(entity);
    },

    /**
     * @public
     * @param {Entity} entity
     */
    removeEntity: function (entity) {
        var families, familyId;

        // try to remove the entity from each family
        families = this._families;
        for (familyId in families) {
            families[familyId].removeEntityIfMatch(entity);
        }

        this._entities.remove(entity);
    },

    /**
     * @public
     * @param {...String} componentName
     */
    getEntities: function (componetName) {
        var familyId, families, node;

        familyId = '$' + Array.prototype.join.call(arguments, ',');
        families = this._families;
        
        if (!families[familyId]) {
            families[familyId] = new Family(
                Array.prototype.slice.call(arguments)
            );
            for (node = this._entities.head; node; node = node.next) {
                families[familyId].addEntityIfMatch(node.entity);
            }
        }

        return families[familyId].getEntities();
    },

    /**
     * @public
     */
    update: function (dt) {
        var systems, i, len;

        systems = this._systems;
        for (i = 0, len = systems.length; i < len; ++i) {
            systems[i].update(dt);
        }
    },

    /**
     * @private
     */
    _onComponentAdded: function (entity, componentName) {
        var families, familyId;

        families = this._families;
        for (familyId in families) {
            families[familyId].onComponentAdded(entity, componentName);
        }
    },

    /**
     * @private
     */
    _onComponentRemoved: function (entity, componentName) {
        var families, familyId;

        families = this._families;
        for (familyId in families) {
            families[familyId].onComponentRemoved(entity, componentName);
        }
    }
});
