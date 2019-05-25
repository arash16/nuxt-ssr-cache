const makeCache = require('../lib/cache-builders');

describe('memoryCache', () => {
    it('should return cached result', async () => {
        const cache = makeCache({ type: 'memory' });
        cache.setAsync('sample', 'data');
        expect(await cache.getAsync('sample')).to.be.eql('data');
    });
});

describe('redisCache', () => {
    it('should return cached result', async () => {
        const cache = makeCache({
            type: 'redis',
            host: 'localhost'
        });
        cache.setAsync('sample', 'data');
        expect(await cache.getAsync('sample')).to.be.eql('data');
    });

    it('should configure on initialization', async () => {
        const cache = makeCache({
            type: 'redis',
            host: process.env.CACHE_HOST || 'localhost',
            prefix: '',
            ttl: 10 * 60,
            configure: [
                ['maxmemory', '200mb'],
                ['maxmemory-policy', 'allkeys-lru'],
            ],
        });
        cache.setAsync('sample', 'data');
        expect(await cache.getAsync('sample')).to.be.eql('data');
    });
});

describe('memcached', () => {
  it('should return cached result', async () => {
    const cache = makeCache({
      type: 'memcached',
      options: {
        hosts: ['127.0.0.1:11211'],
      },
    });
    await cache.setAsync('sample', 'data');
    expect(await cache.getAsync('sample')).to.be.eql('data');
  });
});

describe('multi', () => {
  it('memory+memcached should return cached result', async () => {
    const cache = makeCache({
      type: 'multi',
      stores: [
        {
          type: 'memory',
          max: 2000,
          ttl: 3600
        },
        {
          type: 'memcached',
          options: {
            hosts: ['127.0.0.1:11211']
          }
        }
      ]
    });
    await cache.setAsync('sample', 'data');
    expect(await cache.getAsync('sample')).to.be.eql('data');
  });

  it('memory+redis should return cached result', async () => {
    const cache = makeCache({
      type: 'multi',
      stores: [
        {
          type: 'memory',
          max: 2000,
          ttl: 3600
        },
        {
          type: 'redis',
          host: 'localhost'
        }
      ]
    });
    await cache.setAsync('sample', 'data');
    expect(await cache.getAsync('sample')).to.be.eql('data');
  });
});
