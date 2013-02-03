var Class = require('./class'),
    Family = require('./family'),
    EntityList = require('./entitylist');

var World = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
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
        var families, i, len, self;

        families = this._families;

        for (i = 0, len = families.length; i < len; ++i) {
            families[i].addEntityIfMatch(entity);
        }

        self = this;
        entity.onComponentAdded.add(function (entity, component) {
            self._onComponentAdded(entity, component);
        });
        entity.onComponentRemoved.add(function (entity, component) {
            self._onComponentRemoved(entity, component);
        });

        this._entities.add(entity);

        return this;
    },

    /**
     * @public
     */
    removeEntity: function (entity) {
        var families, i, len;

        families = this._families;
        for (i = 0, len = families.length; i < len; ++i) {
            families[i].removeEntityIfMatch(entity);
        }

        this._entities.remove(entity);
    },

    /**
     * @public
     */
    getEntities: function (/* arguments */) {
        var familyId, families, entity;

        familyId = '$' + Array.prototype.join.call(arguments, ',');
        families = this._families;
        
        if (!families[familyId]) {
            families[familyId] = new Family(
                Array.prototype.slice.call(arguments)
            );
            for (entity = this._entities.head; entity; entity = entity.next) {
                families[familyId].addEntityIfMatch(entity);
            }
        }

        return families[familyId].entities;
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
        var families, i, len;

        families = this._families;
        for (i = 0, len = families.length; i < len; ++i) {
            this._families.onComponentAdded(entity, componentName);
        }
    },

    /**
     * @private
     */
    _onComponentRemoved: function (entity, componentName) {
        var families, i, len;

        families = this._families;
        for (i = 0, len = families.length; i < len; ++i) {
            this._families.onComponentRemoved(entity, componentName);
        }
    }
});
