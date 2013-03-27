var Kitty = Kitty || {};

/**
 * base abstract class with initializer, Events mixin & backbone extend method.
 */
var Class = Kitty.Class = function() {
    this.initialize && this.initialize.apply(this, arguments);
};
// add Events behaviour
_.extend(Class.prototype, Backbone.Events);
// add extend method
Class.extend = Backbone.Model.extend;