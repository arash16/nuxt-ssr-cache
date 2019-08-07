# nuxt-ssr-cache
[![NPM version](https://img.shields.io/npm/v/nuxt-ssr-cache.svg)](https://www.npmjs.com/package/nuxt-ssr-cache)

Cache middleware for nuxt's SSR rendering.

## Setup
```npm install nuxt-ssr-cache```

or

```yarn add nuxt-ssr-cache```

then inside your `nuxt.config.js` add cache config:

```javascript
module.exports = {
  // If you provide a version, it will be stored inside cache.
  // Later when you deploy a new version, old cache will be
  // automatically purged.
  version: pkg.version,

  // ....

  modules: [
      'nuxt-ssr-cache',
  ],
  cache: {
    // if you're serving multiple host names (with differing
    // results) from the same server, set this option to true.
    // (cache keys will be prefixed by your host name)
    // if your server is behind a reverse-proxy, please use
    // express or whatever else that uses 'X-Forwarded-Host'
    // header field to provide req.hostname (actual host name)
    useHostPrefix: false,
    pages: [
      // these are prefixes of pages that need to be cached
      // if you want to cache all pages, just include '/'
      '/page1',
      '/page2',

      // you can also pass a regular expression to test a path
      /^\/page3\/\d+$/,

      // to cache only root route, use a regular expression
      /^\/$/
    ],
    
    key(route, context) {
      // custom function to return cache key, when used previous
      // properties (useHostPrefix, pages) are ignored. return 
      // falsy value to bypass the cache
    },

    store: {
      type: 'memory',

      // maximum number of pages to store in memory
      // if limit is reached, least recently used page
      // is removed.
      max: 100,

      // number of seconds to store this page in cache
      ttl: 60,
    },
  },

  // ...
};
```

### `redis` store
```javascript
module.exports = {
  // ....
  cache: {
    // ....
    store: {
      type: 'redis',
      host: 'localhost',
      ttl: 10 * 60,
      configure: [
        // these values are configured
        // on redis upon initialization
        ['maxmemory', '200mb'],
        ['maxmemory-policy', 'allkeys-lru'],
      ],
    },
  },
}
```
Uses [cache-manager-redis](https://www.npmjs.com/package/cache-manager-redis) under the hood.

### `memcached` store
```javascript
module.exports = {
  // ....
  cache: {
    // ....
    store: {
      type: 'memcached',
      options: {
        hosts: ['127.0.0.1:11211'],
      },
    },
  },
}
```
Uses [cache-manager-memcached-store](https://www.npmjs.com/package/cache-manager-memcached-store) under the hood.

### `multi` cache (layered)
```javascript
module.exports = {
  // ....
  cache: {
    // ....
    store: {
      // multi cache stores pages in all caches
      // later tries to read them in sequential order
      // in this example it first tries to read from memory
      // if not found, it tries to read from redis
      type: 'multi',
      stores: [
        { type: 'memory', /* ... */ },
        { type: 'redis', /* ... */ },
      ],
    },
  },
}
```

## License
MIT
