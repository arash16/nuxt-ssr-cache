# nuxt-ssr-cache
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
            useHostPrefix: false,
            store: {
              // multi cache stores pages in all caches
              // later tries to read them in sequential order
              // in this example it first tries to read from memory
              // if not found, it tries to read from redis
              type: 'multi',
              stores: [
                {
                  type: 'memory',

                  // maximum number of pages to store in memory
                  // if limit is reached, least recently used page
                  // is removed.
                  max: 100,

                  // number of seconds to store this page in cache
                  ttl: 60,
                },
                {
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
              ],
            },
            pages: [
              // these are prefixes of pages that need to be cached
              // if you want to cache all pages, just include '/'
              '/page1',
              '/page2',
              
              // you can also pass a regular expression to test a path
              /\/page3\/\d+/,
            ],
          },

          // ...
    };
```

In this example we have used a multi tiered cache.
You could also use a simpler memory/redis only cache.
`pages` is an array of route-prefixes that should be cached.

## License
MIT
