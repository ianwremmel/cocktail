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

var applyMixin = function(proto, mixin) {
  if (_.isString(mixin)) {
    mixin = Cocktail.mixins[mixin];
  }

  var handleMethodCollision = function(mixinMethod, classMethod, resolution) {
    resolution = resolution || 'after';

    var buildHandler = function(X, A) {
      return function() {
        var retX = _.isFunction(X) ? X.apply(this, arguments) : X;
        var retA = _.isFunction(A) ? A.apply(this, arguments) : A;

        return typeof retA === 'undefined' ? retX : retA;
      };
    };

    switch(resolution) {
    case 'before':
      return buildHandler(mixinMethod, classMethod);

    case 'after':
      return buildHandler(classMethod, mixinMethod);

    case 'wrap':
      return _.wrap(classMethod, mixinMethod);

    case 'replace':
      return mixinMethod;

    case 'compose':
      return _.compose(mixinMethod, classMethod);

    default:
      throw new Error('Resolution "' + resolution + '" not recognized.');
    }
  };

  var handleHashCollision = function(mixinHash, classHash, resolution) {
    resolution = resolution || 'before';

    switch (resolution) {
    case 'before':
      return _.extend({}, mixinHash, classHash);

    case 'after':
      return _.extend({}, classHash, mixinHash);

    case 'replace':
      return mixinHash;

    default:
      throw new Error('Resolution "' + resolution + '" not valid for hashes.');
    }
  };

  _.each(mixin, function(property, propertyName) {
    if (proto[propertyName]) {
      var resolution = mixin.__collisions ? mixin.__collisions[propertyName] : null;
      if (_.isFunction(property)) {
        proto[propertyName] = handleMethodCollision(property, proto[propertyName], resolution);
      }
      else if (_.isObject(property)) {
        proto[propertyName] = handleHashCollision(property, proto[propertyName], resolution);
      }
    }
    else {
      proto[propertyName] = property;
    }
  });
};

Cocktail.mixin = function mixin(klass) {
  var mixins = _.chain(arguments).toArray().rest().flatten().value();
  // Allows mixing into the constructor's prototype or the dynamic instance
  var proto = klass.prototype || klass;

  // var applyMixin = function(mixin) {
  //   if (_.isString(mixin)) {
  //     mixin = Cocktail.mixins[mixin];
  //   }

  //   var resolutions = mixin.__collisions || {};

  //   var handleMethodCollision = function(value, key) {
  //     var resolution = resolutions[key] || 'after';

  //     switch (resolution) {
  //     case 'before':
  //       obj[key] = function() {
  //         obj[key].apply(this, arguments);
  //         return value.apply(this, arguments);
  //       };
  //       break;

  //     case 'after':
  //       obj[key] = function() {
  //         value.apply(this, arguments);
  //         return obj[key].apply(this, arguments);
  //       };
  //       break;

  //     case 'wrap':
  //       obj[key] = _.wrap(obj[key], value);
  //       break;

  //     case 'replace':
  //       obj[key] = value;
  //       break;

  //     case 'compose':
  //       obj[key] = _.compose(value, obj[key]);
  //       break;

  //     default:
  //       throw new Error('Resolution "' + resolution + '" not recognized.');
  //     }
  //   };

  //   var handleHashCollision = function(value, key) {
  //     var resolution = resolutions[key] || 'before';

  //     switch (resolution) {
  //     case 'before':
  //       obj[key] = _.extend({}, value, obj[key] || {});
  //       break;
  //     case 'after':
  //       obj[key] = _.extend({}, obj[key], value);
  //       break;
  //     case 'wrap':
  //       throw new Error('Resolution "wrap" not valid for hashes.');
  //     case 'replace':
  //       obj[key] = value;
  //       break;
  //     case 'compose':
  //       throw new Error('Resolution "compose" not valid for hashes.');
  //     default:
  //       throw new Error('Resolution "' + resolution + '" not recognized.');
  //     }
  //   };

  //   var applyMixinProperty = function(value, key) {
  //     if (key !== '__collisions') {
  //       if (obj[key]) {
  //         if (_.isFunction(value)) {
  //           handleMethodCollision(value, key);
  //         }
  //         else if (_.isObject(value)) {
  //           handleHashCollision(value, key);
  //         }
  //       }
  //       else {
  //         obj[key] = value;
  //       }
  //     }
  //   };

  //   _(mixin).each(applyMixinProperty);
  // };



  _(mixins).each(_.partial(applyMixin, proto));
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
