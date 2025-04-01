/**
 * Mapping of Tomorrow.io weather codes to readable conditions and icons
 * Based on: https://docs.tomorrow.io/reference/data-layers-overview
 */

export interface WeatherCodeMapping {
  condition: string; // Human-readable condition
  isRainy: boolean;
  isSnowy: boolean;
  isStormy: boolean;
  isCloudy: boolean;
  isSunny: boolean;
  isWindy: boolean;
}

export const TOMORROW_WEATHER_CODES: Record<number, WeatherCodeMapping> = {
  0: { condition: "Unknown", isRainy: false, isSnowy: false, isStormy: false, isCloudy: false, isSunny: false, isWindy: false },
  1000: { condition: "Clear", isRainy: false, isSnowy: false, isStormy: false, isCloudy: false, isSunny: true, isWindy: false },
  1001: { condition: "Cloudy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  1100: { condition: "Partly Cloudy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: true, isSunny: true, isWindy: false },
  1101: { condition: "Partly Cloudy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: true, isSunny: true, isWindy: false },
  1102: { condition: "Partly Cloudy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: true, isSunny: true, isWindy: false },
  2000: { condition: "Foggy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  2100: { condition: "Foggy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  3000: { condition: "Windy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: false, isSunny: false, isWindy: true },
  3001: { condition: "Windy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: false, isSunny: false, isWindy: true },
  3002: { condition: "Windy", isRainy: false, isSnowy: false, isStormy: false, isCloudy: false, isSunny: false, isWindy: true },
  4000: { condition: "Drizzle", isRainy: true, isSnowy: false, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  4001: { condition: "Rainy", isRainy: true, isSnowy: false, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  4200: { condition: "Rainy", isRainy: true, isSnowy: false, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  4201: { condition: "Heavy Rain", isRainy: true, isSnowy: false, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  5000: { condition: "Snowy", isRainy: false, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  5001: { condition: "Snowy", isRainy: false, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  5100: { condition: "Snowy", isRainy: false, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  5101: { condition: "Heavy Snow", isRainy: false, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  6000: { condition: "Freezing Drizzle", isRainy: true, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  6001: { condition: "Freezing Rain", isRainy: true, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  6200: { condition: "Freezing Rain", isRainy: true, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  6201: { condition: "Heavy Freezing Rain", isRainy: true, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  7000: { condition: "Sleet", isRainy: true, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  7101: { condition: "Heavy Sleet", isRainy: true, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  7102: { condition: "Sleet", isRainy: true, isSnowy: true, isStormy: false, isCloudy: true, isSunny: false, isWindy: false },
  8000: { condition: "Thunderstorm", isRainy: true, isSnowy: false, isStormy: true, isCloudy: true, isSunny: false, isWindy: false },
};

/**
 * Get a human-readable condition from Tomorrow.io weather code
 */
export function getConditionFromCode(code: number, isDay: boolean): string {
  const mapping = TOMORROW_WEATHER_CODES[code] || TOMORROW_WEATHER_CODES[0];
  
  if (mapping.isSunny) {
    return isDay ? "Sunny" : "Clear Night";
  }
  
  if (mapping.isCloudy && mapping.isSunny) {
    return isDay ? "Partly Cloudy" : "Partly Cloudy Night";
  }
  
  return mapping.condition;
}

/**
 * Get all weather attributes from code
 */
export function getWeatherAttributes(code: number): WeatherCodeMapping {
  return TOMORROW_WEATHER_CODES[code] || TOMORROW_WEATHER_CODES[0];
}
