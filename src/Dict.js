var Class = require('./Class');

var Dict = module.exports = Class.extend({
    init: function () {
        this._keys = [];
        this._values = [];
    },

    set: function (key, value) {
        var keys = this._keys,
            i, len;

        for (i = 0, len = keys.length; i < len; ++i) {
            if (keys[i] === key) {
                this._values[i] = value;
                return;
            }
        }
        keys.push(key);
        this._values.push(value);
    },

    get: function (key) {
        var keys = this._keys,
            i, len;

        for (i = 0, len = keys.length; i < len; ++i) {
            if (keys[i] === key) {
                return this._values[i];
            }
        }
        return null;
    },

    remove: function (key) {
        var keys = this._keys,
            i, len;

        for (i = 0, len = keys.length; i < len; ++i) {
            if (keys[i] === key) {
                keys.splice(i, 1);
                this._values.splice(i, 1);
                return true;
            }
        }
        return false;
    }
});
