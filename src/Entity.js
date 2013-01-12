var Class = require('./Class'),
    Dict = require('./Dict');

var Entity = module.exports = Class.extend({
    init: function () {
        this._components = new Dict();
    },

    addComponent: function (component) {
        this._components.set(component.constructor, component);
    },
});
