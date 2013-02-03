var Class = require('./class');

/**
 * The signal can register listeners and invoke the listeners with messages.
 * @class
 */
var Signal = module.exports = Class.extend({
    /**
     * @constructor
     */
    init: function () {
        this._listeners = [];
    },

    /**
     * Add a listener to this signal.
     * @public
     * @param {Function} listener
     */
    add: function (listener) {
        this._listeners.push(listener);
    },

    /**
     * Remove a listener from this signal.
     * @public
     * @param {Function} listener
     */
    remove: function (listener) {
        var listeners = this._listeners,
            i, len;

        for (i = 0, len = listeners.length; i < len; ++i) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                return true;
            }
        }
        return false;
    },

    /**
     * Emit a message.
     * @public
     * @param {...*} messages
     */
    emit: function (/* messages */) {
        var messages = arguments,
            listeners = this._listeners,
            i, len;

        for (i = 0, len = listeners.length; i < len; ++i) {
            listeners[i].apply(null, messages);
        }
    }
});
