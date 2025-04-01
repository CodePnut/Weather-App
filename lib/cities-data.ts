export interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// A list of popular cities with their coordinates
export const POPULAR_CITIES: CityData[] = [
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.006 },
  { name: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  { name: "San Francisco", country: "USA", lat: 37.7749, lon: -122.4194 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978 },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074 },
  { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694 },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631 },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lon: -118.2437 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784 },
  { name: "Chicago", country: "USA", lat: 41.8781, lon: -87.6298 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738 },
];

/**
 * Filter cities based on a search query
 * @param query The search query
 * @returns Filtered list of cities
 */
export function filterCities(query: string): CityData[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  return POPULAR_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery)
  ).slice(0, 6); // Limit to 6 results
}

/**
 * Find a city by its name
 * @param name City name to search for
 * @returns The city data or undefined if not found
 */
export function findCityByName(name: string): CityData | undefined {
  if (!name) return undefined;

  const normalizedName = name.toLowerCase().trim();

  // Try exact match first
  const exactMatch = POPULAR_CITIES.find(
    (city) => city.name.toLowerCase() === normalizedName
  );

  if (exactMatch) return exactMatch;

  // Try partial match if no exact match found
  return POPULAR_CITIES.find((city) =>
    city.name.toLowerCase().includes(normalizedName)
  );
}
