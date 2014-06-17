var Class = require('./class'),
    Family = require('./family'),
    EntityList = require('./entitylist');

/**
 * The world is the container of all the entities and systems.
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

        /**
         * @private
         */
        this._systems = [];

        /**
         * @private
         */
        this._entities = new EntityList();
    },

    /**
     * Add a system to this world.
     * @public
     * @param {System} system
     */
    addSystem: function (system) {
        this._systems.push(system);
        system.addedToWorld(this);
        return this;
    },

    /**
     * Remove a system from this world.
     * @public
     * @param {System} system
     */
    removeSystem: function (system) {
        var systems, i, len;

        systems = this._systems;
        for (i = 0, len = systems.length; i < len; ++i) {
            if (systems[i] === system) {
                systems.splice(i, 1);
                system.removedFromWorld();
            }
        }
    },

    /**
     * Add an entity to this world.
     * @public
     * @param {Entity} entity
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
     * Remove and entity from this world.
     * @public
     * @param {Entity} entity
     */
    removeEntity: function (entity) {
        var families, familyId;

        // try to remove the entity from each family
        families = this._families;
        for (familyId in families) {
            families[familyId].removeEntity(entity);
        }

        this._entities.remove(entity);
    },

    /**
     * Get the entities having all the specified componets.
     * @public
     * @param {...String} componentNames
     * @return {Array} an array of entities.
     */
    getEntities: function (/* componentNames */) {
        var familyId, families;

        familyId = this._getFamilyId(arguments);
        this._ensureFamilyExists(arguments);

        return this._families[familyId].getEntities();
    },

    /**
     * For each system in the world, call its `update` method.
     * @public
     * @param {Number} dt time interval between updates.
     */
    update: function (dt) {
        var systems, i, len;

        systems = this._systems;
        for (i = 0, len = systems.length; i < len; ++i) {
            systems[i].update(dt);
        }
    },

    /**
     * Returns the signal for entities added with the specified components. The
     * signal is also emitted when a component is added to an entity causing it
     * match the specified component names.
     * @public
     * @param {...String} componentNames
     * @return {Signal} A signal which is emitted every time an entity with
     *     specified components is added.
     */
    entityAdded: function(/* componentNames */) {
        var familyId, families;

        familyId = this._getFamilyId(arguments);
        this._ensureFamilyExists(arguments);

        return this._families[familyId].entityAdded;
    },

    /**
     * Returns the signal for entities removed with the specified components.
     * The signal is also emitted when a component is removed from an entity
     * causing it to no longer match the specified component names.
     * @public
     * @param {...String} componentNames
     * @return {Signal} A signal which is emitted every time an entity with
     *     specified components is removed.
     */
    entityRemoved: function(/* componentNames */) {
        var familyId, families;

        familyId = this._getFamilyId(arguments);
        this._ensureFamilyExists(arguments);

        return this._families[familyId].entityRemoved;
    },

    /**
     * Creates a family for the passed array of component names if it does not
     * exist already.
     * @param {Array.<String>} components
     */
    _ensureFamilyExists: function(components) {
        var families = this._families;
        var familyId = this._getFamilyId(components);

        if (!families[familyId]) {
            families[familyId] = new Family(
                Array.prototype.slice.call(components)
            );
            for (var node = this._entities.head; node; node = node.next) {
                families[familyId].addEntityIfMatch(node.entity);
            }
        }
    },

    /**
     * Returns the family ID for the passed array of component names. A family
     * ID is a comma separated string of all component names with a '$'
     * prepended.
     * @param {Array.<String>} components
     * @return {String} The family ID for the passed array of components.
     */
    _getFamilyId: function(components) {
        return '$' + Array.prototype.join.call(components, ',');
    },

    /**
     * Handler to be called when a component is added to an entity.
     * @private
     * @param {Entity} entity
     * @param {String} componentName
     */
    _onComponentAdded: function (entity, componentName) {
        var families, familyId;

        families = this._families;
        for (familyId in families) {
            families[familyId].onComponentAdded(entity, componentName);
        }
    },

    /**
     * Handler to be called when component is removed from an entity.
     * @private
     * @param {Entity} entity
     * @param {String} componentName
     */
    _onComponentRemoved: function (entity, componentName) {
        var families, familyId;

        families = this._families;
        for (familyId in families) {
            families[familyId].onComponentRemoved(entity, componentName);
        }
    }
});
