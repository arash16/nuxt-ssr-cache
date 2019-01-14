const {serialize, deserialize} = require('./serializer');
const makeCache = require('./builders');

module.exports = function cacheRenderer(nuxt, config) {
    if (!config.cache || !Array.isArray(config.cache.pages) || !config.cache.pages.length) {
        return;
    }

    function isCacheFriendly(path) {
        return config.cache.pages.some(
            pat => pat instanceof RegExp
                ? pat.test(path)
                : path.startsWith(pat)
        );
    }

    const cache = makeCache(config.cache.store);
    const renderer = nuxt.renderer;
    const renderRoute = renderer.renderRoute.bind(renderer);
    renderer.renderRoute = function(route, context) {
        if (!isCacheFriendly(route)) {
            return renderRoute(route, context);
        }

        function renderSetCache(){
            return renderRoute(route, context)
                .then(function(result) {
                    if (!result.error) {
                        cache.set(route, serialize(result));
                    }
                    return result;
                });
        }

        return cache.get(route)
            .then(function (cachedResult) {
                if (cachedResult) {
                    return deserialize(cachedResult);
                }

                return renderSetCache();
            })
            .catch(renderSetCache);
    };

    return cache;
};
