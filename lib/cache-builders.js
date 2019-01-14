const cacheManager = require('cache-manager');

function memoryCache(config) {
    return cacheManager.caching({
        store: 'memory',
        ...config,
    });
}

function redisCache(config) {
    if (config && Array.isArray(config.configure)) {
        const redis = require('redis');
        const client = redis.createClient(config.client);
        config.configure.forEach(function (options) {
            client.config('set', ...options, function (err, result) {
                if (err || result !== 'ok') {
                    console.error(err);
                }
            });
        });
        client.quit();
    }

    return cacheManager.caching({
        store: require('cache-manager-redis'),
        retry_strategy() {
            return undefined;
        },
        ...config,
    });
}

function multiCache(config) {
    const stores = config.stores.map(function (conf) {
        return makeCache(conf);
    });

    return cacheManager.multiCaching(stores);
}

function makeCache(config = { store: 'memory' }) {
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