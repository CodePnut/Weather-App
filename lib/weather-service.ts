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

    // Fetch current weather
    const currentRes = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
    );
    if (!currentRes.ok) throw new Error("Failed to fetch current weather");
    const currentData = await currentRes.json();

    // Fetch 7-day forecast
    const forecastRes = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
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

      // Fetch current weather
      const currentRes = await fetch(
        `${BASE_URL}/weather?q=${searchCity}&units=imperial&appid=${API_KEY}`
      );
      if (!currentRes.ok) throw new Error("Failed to fetch current weather");
      const currentData = await currentRes.json();

      // Fetch 7-day forecast
      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${searchCity}&units=imperial&appid=${API_KEY}`
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
      temp: 72,
      condition: isDay ? "Sunny" : "Clear Night",
      humidity: 45,
      wind: 8,
      feelsLike: 74,
      uvIndex: isDay ? 6 : 0,
      lastUpdated: timestamp,
      isDay: isDay,
    },
    forecast: [
      { day: "Mon", temp: 72, condition: "Sunny" },
      { day: "Tue", temp: 68, condition: "Partly Cloudy" },
      { day: "Wed", temp: 70, condition: "Cloudy" },
      { day: "Thu", temp: 65, condition: "Rainy" },
      { day: "Fri", temp: 69, condition: "Partly Cloudy" },
      { day: "Sat", temp: 74, condition: "Sunny" },
      { day: "Sun", temp: 76, condition: "Sunny" },
    ],
    coordinates: {
      lat: 37.7749,
      lon: -122.4194,
    },
    timezone: 0,
  };
}
