var Class  = require('./class'),
    Signal = require('./signal');

/**
 * The entity is the container of components.
 * @class
 */
var Entity = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        /**
         * @public
         * @readonly
         */
        this.id = Entity._id++;

        /**
         * Map from component names to components.
         * @private
         * @property
         */
        this._components = {};

        /**
         * @public
         * @readonly
         */
        this.onComponentAdded = new Signal();
        
        /**
         * @public
         * @readonly
         */
        this.onComponentRemoved = new Signal();
    },

    /**
     * Check if this entity has a component by name.
     * @public
     * @param {String} componentName
     * @return {Boolean}
     */
    hasComponent: function (componentName) {
        return this._components['$' + componentName] !== undefined;
    },

    /**
     * Get a component of this entity by name.
     * @public
     * @param {String} componentName
     * @return {Component}
     */
    getComponent: function (componentName) {
        return this._components['$' + componentName];
    },

    /**
     * Add a component to this entity.
     * @public
     * @param {Component} component
     */
    addComponent: function (component) {
        this._components['$' + component.name] = component;
        this.onComponentAdded.emit(this, component.name);
    },

    /**
     * Remove a component from this entity by name.
     * @public
     * @param {String} componentName
     */
    removeComponent: function (componentName) {
        this._components['$' + componentName] = undefined;
        this.onComponentRemoved.emit(this, componentName);
    }
});


/**
 * @static
 */
Entity._id = 0;
