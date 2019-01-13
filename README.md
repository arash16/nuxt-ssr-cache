# nuxt-cache
Cache middleware for nuxt's SSR rendering.

## Setup
```npm install nuxt-ssr-cache```

or

```yarn add nuxt-ssr-cache```

after creating `Nuxt` instance, call `nuxtCache`:

```javascript
// ....
const nuxt = new Nuxt(config);
const nuxtCache = require('nuxt-ssr-cache');
nuxtCache(nuxt, config);
```

then inside your `nuxt.config.js` add cache config:

```javascript
    module.exports = {
        // ....
        
        cache: {
            store: {
              type: 'multi',
              stores: [
                {
                  type: 'memory',
                  max: 100,
                  ttl: 60,
                },
                {
                  type: 'redis',
                  host: 'localhost',
                  prefix: '',
                  ttl: 10 * 60,
                  configure: [
                    ['maxmemory', '200mb'],
                    ['maxmemory-policy', 'allkeys-lru'],
                  ],
                },
              ],
            },
            pages: [
              '/',
              '/page1',
              '/page2',
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