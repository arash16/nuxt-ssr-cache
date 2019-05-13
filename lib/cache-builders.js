"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var cacheManager = require('cache-manager');

function memoryCache(config) {
  return cacheManager.caching(_objectSpread({
    store: 'memory'
  }, config));
}

function redisCache(config) {
  if (config && Array.isArray(config.configure)) {
    var redis = require('redis');

    var client = redis.createClient(config.client);
    Promise.all(config.configure.map(function (options) {
      return new Promise(function (resolve, reject) {
        client.config.apply(client, ['SET'].concat(_toConsumableArray(options), [function (err, result) {
          if (err || result !== 'OK') {
            reject(err);
          } else {
            resolve(result);
          }
        }]));
      });
    })).then(function () {
      return client.quit();
    });
  }

  return cacheManager.caching(_objectSpread({
    store: require('cache-manager-redis'),
    retry_strategy: function retry_strategy() {
      return undefined;
    }
  }, config));
}

function multiCache(config) {
  var stores = config.stores.map(makeCache);
  return cacheManager.multiCaching(stores);
}

function makeCache() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
    store: 'memory'
  };

  if (config.type === 'redis') {
    return redisCache(config);
  }

  if (config.type === 'memory') {
    return memoryCache(config);
  }

  if (config.type === 'multi') {
    return multiCache(config);
  }
}

module.exports = makeCache;