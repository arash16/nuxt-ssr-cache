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









function serialize(result) {
  return JSON.stringify(result, function(key, value) {
    if (typeof value === 'object' && value instanceof Set) {
      return { _t: 'set', _v: [...value] };
    }

    if (typeof value === 'function') {
      return { _t: 'func', _v: value() };
    }

    return value;
  });
}

function deserialize(jsoned) {
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
};

