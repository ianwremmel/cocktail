(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('underscore'));
    }
    else if(typeof define === 'function' && define.amd) {
        define(['underscore'], factory);
    }
    else {
        root['Cocktail'] = factory(root._);
    }
}(this, function(_) {
/* global _ */
'use strict';

var Cocktail = {};

Cocktail.mixins = {};

Cocktail.mixin = function mixin(klass) {
  var mixins = _.chain(arguments).toArray().rest().flatten().value();
  // Allows mixing into the constructor's prototype or the dynamic instance
  var obj = klass.prototype || klass;

  var collisions = {};

  _(mixins).each(function(mixin) {
    if (_.isString(mixin)) {
      mixin = Cocktail.mixins[mixin];
    }
    _(mixin).each(function(value, key) {
      if (_.isFunction(value)) {
        if (obj[key]) {
          collisions[key] = collisions[key] || [obj[key]];
          collisions[key].push(value);
        }
        obj[key] = value;
      } else if (_.isObject(value)) {
        obj[key] = _.extend({}, value, obj[key] || {});
      } else if (!(key in obj)) {
        obj[key] = value;
      }
    });
  });

  _(collisions).each(function(propertyValues, propertyName) {
    obj[propertyName] = function() {
      var that = this,
        args = arguments,
        returnValue;

      _(propertyValues).each(function(value) {
        var returnedValue = _.isFunction(value) ? value.apply(that, args) : value;
        returnValue = (typeof returnedValue === 'undefined' ? returnValue : returnedValue);
      });

      return returnValue;
    };
  });
};

var originalExtend;

Cocktail.patch = function patch(Backbone) {
  originalExtend = Backbone.Model.extend;

  var extend = function(protoProps, classProps) {
    var klass = originalExtend.call(this, protoProps, classProps);

    var mixins = klass.prototype.mixins;
    if (mixins && klass.prototype.hasOwnProperty('mixins')) {
      Cocktail.mixin(klass, mixins);
    }

    return klass;
  };

  _([Backbone.Model, Backbone.Collection, Backbone.Router, Backbone.View]).each(function(klass) {
    klass.mixin = function mixin() {
      Cocktail.mixin(this, _.toArray(arguments));
    };

    klass.extend = extend;
  });
};

Cocktail.unpatch = function unpatch(Backbone) {
  _([Backbone.Model, Backbone.Collection, Backbone.Router, Backbone.View]).each(function(klass) {
    klass.mixin = undefined;
    klass.extend = originalExtend;
  });
};

    return Cocktail;
}));