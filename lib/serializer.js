"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = {
  // renderer's result contains a Set and Function,
  // here we are handling their serializations
  serialize: function serialize(result) {
    return JSON.stringify(result, function (key, value) {
      if (_typeof(value) === 'object' && value instanceof Set) {
        return {
          _t: 'set',
          _v: _toConsumableArray(value)
        };
      }

      if (typeof value === 'function') {
        return {
          _t: 'func',
          _v: value()
        };
      }

      return value;
    });
  },
  deserialize: function deserialize(jsoned) {
    return JSON.parse(jsoned, function (key, value) {
      if (value && value._v) {
        if (value._t === 'set') {
          return new Set(value._v);
        }

        if (value._t === 'func') {
          var result = value._v;
          return function () {
            return result;
          };
        }
      }

      return value;
    });
  }
};