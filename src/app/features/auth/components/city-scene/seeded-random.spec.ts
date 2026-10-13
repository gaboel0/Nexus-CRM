import { createRandom } from './seeded-random';

describe('createRandom', () => {
  it('gera a mesma sequência para a mesma semente', () => {
    const first = Array.from({ length: 10 }, createRandom(7));
    const second = Array.from({ length: 10 }, createRandom(7));
    expect(second).toEqual(first);
  });

  it('produz números no intervalo [0, 1)', () => {
    const random = createRandom(123);
    for (let i = 0; i < 1000; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
