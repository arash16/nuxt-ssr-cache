const path = require('path');
const {serialize, deserialize} = require('./serializer');
const makeCache = require('./cache-builders');


function cleanIfNewVersion(cache, version) {
    if (!version) return;
    return cache.get('appVersion')
        .then(function (oldVersion) {
            if (oldVersion !== version) {
                return cache.reset();
                // unfortunately multi cache doesn't return a promise
                // and we can't await for it so as to store new version
                // immediately after reset.
            }
        });
}

function tryStoreVersion(cache, version) {
    if (!version || cache.versionSaved) return;
    return cache.set('appVersion', version, {ttl: null})
        .then(() => { cache.versionSaved = true; });
}

module.exports = function cacheRenderer(nuxt, config) {
    // used as a nuxt module, only config is provided as argument
    // and nuxt instance will be provided as this context
    if (arguments.length < 2 && this.nuxt) {
      nuxt = this.nuxt;
      config = this.options;
    }

    if (!config.cache || !Array.isArray(config.cache.pages) || !config.cache.pages.length) {
        return;
    }

    function isCacheFriendly(path) {
        return config.cache.pages.some(pat =>
            pat instanceof RegExp
                ? pat.test(path)
                : path.startsWith(pat)
        );
    }

    const currentVersion = config.version || config.cache.version;
    const cache = makeCache(config.cache.store);
    cleanIfNewVersion(cache, currentVersion);

    const renderer = nuxt.renderer;
    const renderRoute = renderer.renderRoute.bind(renderer);
    renderer.renderRoute = function(route, context) {
        const hostname = context.req.hostname || context.req.host;
    	const cacheKey = config.cache.useHostPrefix === true && hostname
    	                ? path.join(hostname, route)
                        : route;

        // hopefully cache reset is finished up to this point.
        tryStoreVersion(cache, currentVersion);


        if (!isCacheFriendly(route)) {
            return renderRoute(route, context);
        }

        function renderSetCache(){
            return renderRoute(route, context)
                .then(function(result) {
                    if (!result.error) {
                        cache.set(cacheKey, serialize(result));
                    }
                    return result;
                });
        }

        return cache.get(cacheKey)
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
