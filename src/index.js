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
      return function X1() {
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

    case 'withdraw':
      return classMethod;

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

    case 'withdraw':
      return classHash;

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
