var Class = require('./class'),
    Node = require('./node'),
    Family = require('./family');

var World = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        this._families = {};
        this._systems = [];
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
    },

    /**
     * @public
     */
    getEntities: function (/* arguments */) {
        var familyId, families;

        familyId = '$' + Array.prototype.join.call(arguments, ',');
        families = this._families;
        
        if (!families[familyId]) {
            families[familyId] = new Family(
                Array.prototype.slice.call(arguments)
            );
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
