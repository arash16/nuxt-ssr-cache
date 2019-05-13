const makeCache = require('../lib/cache-builders');

describe('memoryCache', () => {
    it('should return cached result', async () => {
        const cache = makeCache({ type: 'memory' });
        cache.set('sample', 'data');
        expect(await cache.get('sample')).to.be.eql('data');
    });
});

describe('redisCache', () => {
    it('should return cached result', async () => {
        const cache = makeCache({
            type: 'redis',
            host: 'localhost'
        });
        cache.set('sample', 'data');
        expect(await cache.get('sample')).to.be.eql('data');
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
        cache.set('sample', 'data');
        expect(await cache.get('sample')).to.be.eql('data');
    });
});