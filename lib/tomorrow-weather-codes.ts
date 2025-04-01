/**
 * Tomorrow.io Weather Code Utilities
 *
 * This file handles conversion between Tomorrow.io weather codes and
 * human-readable weather conditions and associated attributes.
 *
 * Weather code reference: https://docs.tomorrow.io/reference/data-layers-overview#weather-codes
 */

export type WeatherAttributes = {
  description: string;
  icon: string;
  color: string;
  textColor: string;
};

// These codes match Tomorrow.io's weather code system
// See: https://docs.tomorrow.io/reference/data-layers-overview#weather-codes
export const weatherCodes: Record<number, { day: string; night: string }> = {
  0: { day: "Unknown", night: "Unknown" },
  1000: { day: "Clear, Sunny", night: "Clear" },
  1001: { day: "Cloudy", night: "Cloudy" },
  1100: { day: "Mostly Clear", night: "Mostly Clear" },
  1101: { day: "Partly Cloudy", night: "Partly Cloudy" },
  1102: { day: "Mostly Cloudy", night: "Mostly Cloudy" },
  2000: { day: "Fog", night: "Fog" },
  2100: { day: "Light Fog", night: "Light Fog" },
  3000: { day: "Light Wind", night: "Light Wind" },
  3001: { day: "Wind", night: "Wind" },
  3002: { day: "Strong Wind", night: "Strong Wind" },
  4000: { day: "Drizzle", night: "Drizzle" },
  4001: { day: "Rain", night: "Rain" },
  4200: { day: "Light Rain", night: "Light Rain" },
  4201: { day: "Heavy Rain", night: "Heavy Rain" },
  5000: { day: "Snow", night: "Snow" },
  5001: { day: "Flurries", night: "Flurries" },
  5100: { day: "Light Snow", night: "Light Snow" },
  5101: { day: "Heavy Snow", night: "Heavy Snow" },
  6000: { day: "Freezing Drizzle", night: "Freezing Drizzle" },
  6001: { day: "Freezing Rain", night: "Freezing Rain" },
  6200: { day: "Light Freezing Rain", night: "Light Freezing Rain" },
  6201: { day: "Heavy Freezing Rain", night: "Heavy Freezing Rain" },
  7000: { day: "Ice Pellets", night: "Ice Pellets" },
  7101: { day: "Heavy Ice Pellets", night: "Heavy Ice Pellets" },
  7102: { day: "Light Ice Pellets", night: "Light Ice Pellets" },
  8000: { day: "Thunderstorm", night: "Thunderstorm" },
};

/**
 * Get human-readable weather condition from Tomorrow.io weather code
 * @param code Weather code from Tomorrow.io API
 * @param isDay Whether it's daytime or nighttime
 * @returns Human-readable weather condition
 */
export function getConditionFromCode(code: number, isDay: boolean): string {
  const weatherCode = weatherCodes[code];
  if (!weatherCode) return "Unknown";

  return isDay ? weatherCode.day : weatherCode.night;
}

/**
 * Get weather attributes (for styling) from Tomorrow.io weather code
 * @param code Weather code from Tomorrow.io API
 * @param isDay Whether it's daytime or nighttime
 * @returns Weather attributes for styling
 */
export function getWeatherAttributes(
  code: number,
  isDay: boolean
): WeatherAttributes {
  // Default
  let attributes: WeatherAttributes = {
    description: "Unknown weather condition",
    icon: "cloud-question",
    color: "bg-gray-200",
    textColor: "text-gray-700",
  };

  switch (code) {
    // Clear
    case 1000:
      attributes = {
        description: isDay ? "Clear skies and sunny" : "Clear night sky",
        icon: isDay ? "sun" : "moon",
        color: isDay ? "bg-amber-100" : "bg-indigo-900",
        textColor: isDay ? "text-amber-600" : "text-indigo-300",
      };
      break;

    // Partly Cloudy
    case 1100:
    case 1101:
      attributes = {
        description: isDay ? "Partly cloudy" : "Partly cloudy night",
        icon: isDay ? "cloud-sun" : "cloud-moon",
        color: isDay ? "bg-blue-100" : "bg-indigo-900/80",
        textColor: isDay ? "text-blue-600" : "text-indigo-300",
      };
      break;

    // Cloudy
    case 1001:
    case 1102:
      attributes = {
        description: "Cloudy conditions",
        icon: "cloud",
        color: "bg-gray-200",
        textColor: "text-gray-700",
      };
      break;

    // Fog
    case 2000:
    case 2100:
      attributes = {
        description: "Foggy conditions",
        icon: "cloud-fog",
        color: "bg-gray-300",
        textColor: "text-gray-700",
      };
      break;

    // Wind
    case 3000:
    case 3001:
    case 3002:
      attributes = {
        description: "Windy conditions",
        icon: "wind",
        color: "bg-cyan-100",
        textColor: "text-cyan-700",
      };
      break;

    // Light Rain/Drizzle
    case 4000:
    case 4200:
      attributes = {
        description: "Light rain or drizzle",
        icon: "cloud-drizzle",
        color: "bg-blue-100",
        textColor: "text-blue-700",
      };
      break;

    // Rain
    case 4001:
    case 4201:
      attributes = {
        description: "Rainy conditions",
        icon: "cloud-rain",
        color: "bg-blue-200",
        textColor: "text-blue-800",
      };
      break;

    // Snow
    case 5000:
    case 5001:
    case 5100:
    case 5101:
      attributes = {
        description: "Snowy conditions",
        icon: "cloud-snow",
        color: "bg-sky-50",
        textColor: "text-sky-800",
      };
      break;

    // Freezing Rain
    case 6000:
    case 6001:
    case 6200:
    case 6201:
      attributes = {
        description: "Freezing rain",
        icon: "cloud-hail",
        color: "bg-blue-300",
        textColor: "text-blue-900",
      };
      break;

    // Ice Pellets
    case 7000:
    case 7101:
    case 7102:
      attributes = {
        description: "Ice pellets or sleet",
        icon: "cloud-hail",
        color: "bg-indigo-100",
        textColor: "text-indigo-800",
      };
      break;

    // Thunderstorm
    case 8000:
      attributes = {
        description: "Thunderstorm",
        icon: "cloud-lightning",
        color: "bg-purple-200",
        textColor: "text-purple-900",
      };
      break;
  }

  return attributes;
}
