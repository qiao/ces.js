var Class = require('./Class');

var System = module.exports = Class.extend({
    init: function () {
        /**
         * This property will be set when the system is added to a world.
         * @public
         */
        this.world = null;
    },

    /**
     * @public
     */
    update: function (dt) {
        throw new Error('Subclassed should override this method');
    }
});
