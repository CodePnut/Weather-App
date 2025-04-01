import { cache } from "react";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL;

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    humidity: number;
    wind: number;
    feelsLike: number;
    uvIndex: number;
    lastUpdated: string;
    isDay: boolean;
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
  coordinates?: {
    lat: number;
    lon: number;
  };
  timezone?: number;
  units: "metric" | "imperial";
}

// Utility function to convert weather condition codes to human-readable conditions with day/night awareness
function getConditionFromCode(code: number, isDay: boolean): string {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) return "Thunderstorm";
  if (code >= 300 && code < 400) return "Drizzle";
  if (code >= 500 && code < 600) return "Rainy";
  if (code >= 600 && code < 700) return "Snowy";
  if (code >= 700 && code < 800) return "Foggy";
  if (code === 800) return isDay ? "Sunny" : "Clear Night";
  if (code > 800) return isDay ? "Partly Cloudy" : "Partly Cloudy Night";
  return "Unknown";
}

// Utility function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

// Get day name from date
function getDayName(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

// Check if it's currently daytime at the location
function isDaytime(
  sunriseTimestamp: number,
  sunsetTimestamp: number,
  timezone: number
): boolean {
  // Get current time in the location's timezone
  const now = Math.floor(Date.now() / 1000) + timezone;
  return now >= sunriseTimestamp && now < sunsetTimestamp;
}

// Get user's location using browser geolocation API
export async function getUserLocation(): Promise<{
  lat: number;
  lon: number;
} | null> {
  // Only run in browser environment
  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        resolve(null);
      },
      { timeout: 10000 } // 10 second timeout
    );
  });
}

// Get weather data by coordinates
export async function getWeatherByCoordinates(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    // If we don't have an API key, return mock data
    if (!API_KEY || API_KEY === "your_api_key_here") {
      return getMockWeatherData();
    }

    // Use metric units (Celsius)
    const units = "metric";

    // Fetch current weather
    const currentRes = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    );
    if (!currentRes.ok) throw new Error("Failed to fetch current weather");
    const currentData = await currentRes.json();

    // Fetch 7-day forecast
    const forecastRes = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    );
    if (!forecastRes.ok) throw new Error("Failed to fetch forecast");
    const forecastData = await forecastRes.json();

    // Determine if it's daytime based on sunrise/sunset
    const isDay = isDaytime(
      currentData.sys.sunrise,
      currentData.sys.sunset,
      currentData.timezone
    );

    // Process forecast data - filter to get one entry per day
    const processedForecast = forecastData.list
      .filter((item: any, index: number) => index % 8 === 0) // One entry per day (3-hour intervals, 8 entries per day)
      .slice(0, 7) // Only take 7 days
      .map((item: any) => ({
        day: getDayName(item.dt_txt),
        temp: Math.round(item.main.temp),
        condition: getConditionFromCode(item.weather[0].id, true), // Assume daytime for forecasts
      }));

    // Get current local time
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return {
      location: currentData.name,
      current: {
        temp: Math.round(currentData.main.temp),
        condition: getConditionFromCode(currentData.weather[0].id, isDay),
        humidity: currentData.main.humidity,
        wind: Math.round(currentData.wind.speed),
        feelsLike: Math.round(currentData.main.feels_like),
        uvIndex: Math.round(currentData.clouds.all / 20) + 1, // Estimate UV index from cloud coverage
        lastUpdated: timestamp,
        isDay: isDay,
      },
      forecast: processedForecast,
      coordinates: { lat, lon },
      timezone: currentData.timezone,
      units: "metric",
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return getMockWeatherData();
  }
}

// This function is cached to improve performance
export const getWeatherData = cache(
  async (city?: string): Promise<WeatherData> => {
    try {
      // Try to get user location first if no city is provided
      if (!city) {
        const coordinates = await getUserLocation();
        if (coordinates) {
          return getWeatherByCoordinates(coordinates.lat, coordinates.lon);
        }
      }

      // If no coordinates or specific city is requested
      // If we don't have an API key, return mock data
      if (!API_KEY || API_KEY === "your_api_key_here") {
        return getMockWeatherData();
      }

      // Use provided city or default to San Francisco
      const searchCity = city || "San Francisco";

      // Use metric units (Celsius)
      const units = "metric";

      // Fetch current weather
      const currentRes = await fetch(
        `${BASE_URL}/weather?q=${searchCity}&units=${units}&appid=${API_KEY}`
      );
      if (!currentRes.ok) throw new Error("Failed to fetch current weather");
      const currentData = await currentRes.json();

      // Fetch 7-day forecast
      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${searchCity}&units=${units}&appid=${API_KEY}`
      );
      if (!forecastRes.ok) throw new Error("Failed to fetch forecast");
      const forecastData = await forecastRes.json();

      // Determine if it's daytime based on sunrise/sunset
      const isDay = isDaytime(
        currentData.sys.sunrise,
        currentData.sys.sunset,
        currentData.timezone
      );

      // Process forecast data - filter to get one entry per day
      const processedForecast = forecastData.list
        .filter((item: any, index: number) => index % 8 === 0) // One entry per day (3-hour intervals, 8 entries per day)
        .slice(0, 7) // Only take 7 days
        .map((item: any) => ({
          day: getDayName(item.dt_txt),
          temp: Math.round(item.main.temp),
          condition: getConditionFromCode(item.weather[0].id, true), // Assume daytime for forecasts
        }));

      // Get current local time
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return {
        location: currentData.name,
        current: {
          temp: Math.round(currentData.main.temp),
          condition: getConditionFromCode(currentData.weather[0].id, isDay),
          humidity: currentData.main.humidity,
          wind: Math.round(currentData.wind.speed),
          feelsLike: Math.round(currentData.main.feels_like),
          uvIndex: Math.round(currentData.clouds.all / 20) + 1, // Estimate UV index from cloud coverage
          lastUpdated: timestamp,
          isDay: isDay,
        },
        forecast: processedForecast,
        coordinates: {
          lat: currentData.coord.lat,
          lon: currentData.coord.lon,
        },
        timezone: currentData.timezone,
        units: "metric",
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return getMockWeatherData();
    }
  }
);

// Mock data for development or when API key is not available
function getMockWeatherData(): WeatherData {
  // Get current local time
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Detect if it's likely day or night based on user's local time
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20; // Simple approximation: daytime is 6 AM to 8 PM

  return {
    location: "Your Location",
    current: {
      temp: 27, // Singapore's average temperature in Celsius
      condition: isDay ? "Sunny" : "Clear Night",
      humidity: 75, // Singapore's typically high humidity
      wind: 8,
      feelsLike: 30, // With high humidity, feels hotter
      uvIndex: isDay ? 8 : 0, // High UV index in Singapore during the day
      lastUpdated: timestamp,
      isDay: isDay,
    },
    forecast: [
      { day: "Mon", temp: 28, condition: "Sunny" },
      { day: "Tue", temp: 27, condition: "Partly Cloudy" },
      { day: "Wed", temp: 27, condition: "Rainy" },
      { day: "Thu", temp: 26, condition: "Rainy" },
      { day: "Fri", temp: 27, condition: "Partly Cloudy" },
      { day: "Sat", temp: 28, condition: "Sunny" },
      { day: "Sun", temp: 29, condition: "Sunny" },
    ],
    coordinates: {
      lat: 1.3521, // Singapore coordinates
      lon: 103.8198,
    },
    timezone: 28800, // UTC+8 (Singapore timezone)
    units: "metric",
  };
}
