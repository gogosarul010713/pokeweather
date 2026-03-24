import { type City } from '../../src/data/useStore'

export const mockCity: Partial<City> = {
  id: 'test-city',
  name: 'Test City',
  country: 'Test Country',
  flag: '🧪',
  region: 'asia' as const,
  lat: 35.0,
  lon: 139.0,
  density: 50,
  stops: 100,
  gyms: 20,
  rating: 4 as const,
  tags: [],
  tips: 'Test tips',
  best: 'Test best',
  evento: 'Test event',
  transporte: 'Test transport',
  condition: 'sunny' as const,
  isExtreme: false,
  boostedTypes: ['fire', 'ground'],
  tempC: 20,
  feelsLike: 18,
  humidity: 60,
  windKmh: 10,
  gustKmh: 15,
  localTime: '14:30',
  s2Key: 's2-test-key',
  accuLocationKey: 'acc-test-key',
  weatherIcon: 1,
  timezone: 32400, // +9 hours UTC
  updatedAt: Date.now(),
  weatherImage: '/weather/sunny.png',
}

/**
 * Test cities with specific density/gyms/rating for quartile testing
 * 4 cities to calculate top 25% (p75 = 100)
 */
export const testCitiesForQuartiles: City[] = [
  {
    ...mockCity,
    id: 'low-density',
    name: 'Low Density City',
    density: 10,
    gyms: 5,
    rating: 2,
    stops: 50,
  } as City,
  {
    ...mockCity,
    id: 'mid-city',
    name: 'Mid City',
    density: 50,
    gyms: 25,
    rating: 3,
    stops: 250,
  } as City,
  {
    ...mockCity,
    id: 'high-city',
    name: 'High City',
    density: 100,
    gyms: 50,
    rating: 4,
    stops: 500,
  } as City,
  {
    ...mockCity,
    id: 'super-city',
    name: 'Super City',
    density: 120,
    gyms: 60,
    rating: 5,
    stops: 800,
  } as City,
]

/**
 * Test city with all conditions for badge assignment
 */
export const perfectBadgeCity: City = {
  ...mockCity,
  id: 'perfect-city',
  name: 'Perfect Badge City',
  density: 120, // top 25%
  gyms: 60,     // top 25%
  rating: 5,    // >= 4.0
  stops: 800,
} as City

/**
 * Test city with only one badge category
 */
export const singleBadgeCity: City = {
  ...mockCity,
  id: 'single-badge-city',
  name: 'Single Badge City',
  density: 120, // top 25% → stops badge
  gyms: 5,      // bottom 25%
  rating: 2,    // < 4.0
  stops: 600,
} as City

/**
 * Test city with two badge categories
 */
export const twoBadgeCity: City = {
  ...mockCity,
  id: 'two-badge-city',
  name: 'Two Badge City',
  density: 120, // top 25% → stops badge
  gyms: 60,     // top 25% → gyms badge
  rating: 2,    // < 4.0
  stops: 700,
} as City
