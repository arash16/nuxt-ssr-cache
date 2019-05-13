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
        const client = redis.createClient(config);

        Promise
            .all(config.configure.map(options => new Promise((resolve, reject) => {
                client.config('SET', ...options, function (err, result) {
                    if (err || result !== 'OK') {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            })))
            .then(() => client.quit());
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
    const stores = config.stores.map(makeCache);
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