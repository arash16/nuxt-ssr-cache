module.exports = {
    // renderer's result contains a Set and Function,
    // here we are handling their serializations

    serialize(result) {
        return JSON.stringify(result, function (key, value) {
            if (typeof value === 'object' && value instanceof Set) {
                return {_t: 'set', _v: [...value]};
            }

            if (typeof value === 'function') {
                return {_t: 'func', _v: value()};
            }

            return value;
        });
    },
    deserialize(jsoned) {
        return JSON.parse(jsoned, function (key, value) {
            if (value && value._v) {
                if (value._t === 'set') {
                    return new Set(value._v);
                }

                if (value._t === 'func') {
                    const result = value._v;
                    return function () {
                        return result;
                    };
                }
            }

            return value;
        });
    }
};
