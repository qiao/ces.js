var Class = require('./class');

/**
 * The system is responsible for updating the entities.
 * @class
 */
var System = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        /**
         * This property will be set when the system is added to a world.
         * @public
         */
        this.world = null;
    },

    addedToWorld: function(world) {
        this.world = world;
    },

    removedFromWorld: function(world) {
        this.world = null;
    },

    /**
     * Update the entities.
     * @public
     * @param {Number} dt time interval between updates
     */
    update: function (dt) {
        throw new Error('Subclassed should override this method');
    }
});
