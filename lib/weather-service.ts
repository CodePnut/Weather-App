"use client";

import { cache } from "react";
import { findCityByName, CityData } from "@/lib/cities-data";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL;

// Maximum number of API retries
const MAX_RETRIES = 2;

// Check if we have a valid API key
function isValidApiKey(): boolean {
  return (
    API_KEY !== undefined &&
    API_KEY !== null &&
    API_KEY !== "" &&
    API_KEY !== "your_api_key_here" &&
    typeof API_KEY === "string" &&
    API_KEY.length > 10
  );
}

// Log message for missing API key
function logApiKeyMissing() {
  console.warn(
    "⚠️ OpenWeatherMap API key is missing or invalid. Using mock data instead. " +
      "Set NEXT_PUBLIC_WEATHER_API_KEY in .env.local file to use actual weather data."
  );
}

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

// Improved utility function for API requests with retries
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    // Always add no-cache headers
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    };

    const response = await fetch(url, fetchOptions);

    // If response is not ok and we have retries left, retry the request
    if (!response.ok && retries > 0) {
      console.warn(
        `Request failed (${response.status}), retrying... (${retries} left)`
      );
      // Add exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * (MAX_RETRIES - retries + 1))
      );
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Request error, retrying... (${retries} left)`, error);
      // Add exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 500 * (MAX_RETRIES - retries + 1))
      );
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
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
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true } // Ensure fresh location, improved timeout
    );
  });
}

// Improved function to prevent API caching
function addNoCacheParam(url: string): string {
  // Add a precise timestamp to prevent caching
  const timestamp = Date.now();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_nocache=${timestamp}`;
}

// Get weather data by coordinates
export async function getWeatherByCoordinates(
  lat: number,
  lon: number
): Promise<WeatherData> {
  console.log("Getting weather by coordinates:", lat, lon);
  try {
    // Check for valid API key first
    if (!isValidApiKey()) {
      logApiKeyMissing();
      return getMockWeatherData(lat, lon);
    }

    // Use metric units (Celsius)
    const units = "metric" as const;

    // Fetch current weather with improved no-cache approach
    const currentUrl = addNoCacheParam(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    );

    console.log("Fetching current weather data from:", currentUrl);
    const currentRes = await fetchWithRetry(currentUrl);

    if (!currentRes.ok) {
      console.error(
        "Failed to fetch current weather:",
        await currentRes.text()
      );
      throw new Error(`Failed to fetch current weather: ${currentRes.status}`);
    }

    const currentData = await currentRes.json();
    console.log("Current weather fetched for coordinates:", currentData.name);

    // Fetch UV data using OneCall API (if available) or estimate from weather data
    let uvIndex = 0;
    try {
      const oneCallUrl = addNoCacheParam(
        `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=${units}&appid=${API_KEY}`
      );

      console.log("Fetching one call API data from:", oneCallUrl);
      const oneCallRes = await fetchWithRetry(oneCallUrl);

      if (oneCallRes.ok) {
        const oneCallData = await oneCallRes.json();
        uvIndex =
          oneCallData.current.uvi ||
          Math.min(Math.round(currentData.clouds.all / 10), 11);
        console.log("UV data fetched successfully:", uvIndex);
      } else {
        console.warn("One call API failed, estimating UV index");
        // Fallback: Estimate UV index based on clouds and time of day
        const cloudCoverage = currentData.clouds?.all || 0;
        const isDay = isDaytime(
          currentData.sys.sunrise,
          currentData.sys.sunset,
          currentData.timezone
        );

        // Lower cloud coverage = higher UV, but only during day
        if (isDay) {
          uvIndex = Math.max(
            0,
            Math.min(11, Math.round((100 - cloudCoverage) / 10))
          );
        } else {
          uvIndex = 0; // No UV at night
        }
        console.log("Estimated UV index:", uvIndex);
      }
    } catch (error) {
      console.error("Error fetching UV data:", error);
      // Fallback UV calculation
      uvIndex = Math.min(
        Math.round((100 - (currentData.clouds?.all || 0)) / 10),
        11
      );
      console.log("Fallback UV calculation:", uvIndex);
    }

    // Fetch 7-day forecast
    const forecastUrl = addNoCacheParam(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    );

    console.log("Fetching forecast data from:", forecastUrl);
    const forecastRes = await fetchWithRetry(forecastUrl);

    if (!forecastRes.ok) {
      console.error("Failed to fetch forecast:", await forecastRes.text());
      throw new Error(`Failed to fetch forecast: ${forecastRes.status}`);
    }

    const forecastData = await forecastRes.json();
    console.log("Forecast data fetched successfully");

    // Determine if it's daytime based on sunrise/sunset
    const isDay = isDaytime(
      currentData.sys.sunrise,
      currentData.sys.sunset,
      currentData.timezone
    );
    console.log("Is daytime:", isDay);

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

    // Ensure wind speed is in m/s for metric
    const windSpeed = currentData.wind.speed;
    const windSpeedFormatted = Math.round(windSpeed); // Already in m/s for metric

    const result: WeatherData = {
      location: currentData.name,
      current: {
        temp: Math.round(currentData.main.temp),
        condition: getConditionFromCode(currentData.weather[0].id, isDay),
        humidity: currentData.main.humidity, // Already accurate from API
        wind: windSpeedFormatted,
        feelsLike: Math.round(currentData.main.feels_like),
        uvIndex: uvIndex,
        lastUpdated: timestamp,
        isDay: isDay,
      },
      forecast: processedForecast,
      coordinates: { lat, lon },
      timezone: currentData.timezone,
      units: units,
    };

    console.log("Weather data constructed successfully:", result.location);
    return result;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return getMockWeatherData(lat, lon);
  }
}

// This function gets weather data for a city using our city database coordinates if available
export async function getWeatherByCityName(
  cityName: string
): Promise<WeatherData> {
  console.log("Getting weather by city name:", cityName);
  try {
    // Try to find the city in our database first
    const cityData = findCityByName(cityName);

    // If found, use its coordinates for more accurate results
    if (cityData) {
      console.log(
        "City found in database, using coordinates:",
        cityData.name,
        cityData.lat,
        cityData.lon
      );
      return await getWeatherByCoordinates(cityData.lat, cityData.lon);
    }

    console.log("City not found in database, using API city search");
    // Check for valid API key
    if (!isValidApiKey()) {
      logApiKeyMissing();
      return getMockWeatherData(null, null, cityName);
    }

    // Use provided city
    const searchCity = cityName;

    // Continue with the existing city name lookup logic
    // Use metric units (Celsius)
    const units = "metric" as const;

    // Fetch current weather with improved no-cache approach
    const currentUrl = addNoCacheParam(
      `${BASE_URL}/weather?q=${searchCity}&units=${units}&appid=${API_KEY}`
    );

    console.log("Fetching current weather by city from:", currentUrl);
    const currentRes = await fetchWithRetry(currentUrl);

    if (!currentRes.ok) {
      console.error(
        "Failed to fetch current weather by city:",
        await currentRes.text()
      );
      throw new Error(
        `Failed to fetch current weather by city: ${currentRes.status}`
      );
    }

    const currentData = await currentRes.json();
    console.log("Current weather fetched for city:", currentData.name);

    // Fetch UV data using OneCall API (if available) or estimate from weather data
    let uvIndex = 0;
    try {
      const { lat, lon } = currentData.coord;
      const oneCallUrl = addNoCacheParam(
        `${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=${units}&appid=${API_KEY}`
      );

      console.log("Fetching one call API data for city from:", oneCallUrl);
      const oneCallRes = await fetchWithRetry(oneCallUrl);

      if (oneCallRes.ok) {
        const oneCallData = await oneCallRes.json();
        uvIndex =
          oneCallData.current.uvi ||
          Math.min(Math.round(currentData.clouds.all / 10), 11);
        console.log("UV data fetched successfully for city:", uvIndex);
      } else {
        console.warn("One call API failed for city, estimating UV index");
        // Fallback: Estimate UV index based on clouds and time of day
        const cloudCoverage = currentData.clouds?.all || 0;
        const isDay = isDaytime(
          currentData.sys.sunrise,
          currentData.sys.sunset,
          currentData.timezone
        );

        // Lower cloud coverage = higher UV, but only during day
        if (isDay) {
          uvIndex = Math.max(
            0,
            Math.min(11, Math.round((100 - cloudCoverage) / 10))
          );
        } else {
          uvIndex = 0; // No UV at night
        }
        console.log("Estimated UV index for city:", uvIndex);
      }
    } catch (error) {
      console.error("Error fetching UV data for city:", error);
      // Fallback UV calculation
      uvIndex = Math.min(
        Math.round((100 - (currentData.clouds?.all || 0)) / 10),
        11
      );
      console.log("Fallback UV calculation for city:", uvIndex);
    }

    // Fetch 7-day forecast
    const forecastUrl = addNoCacheParam(
      `${BASE_URL}/forecast?q=${searchCity}&units=${units}&appid=${API_KEY}`
    );

    console.log("Fetching forecast data for city from:", forecastUrl);
    const forecastRes = await fetchWithRetry(forecastUrl);

    if (!forecastRes.ok) {
      console.error(
        "Failed to fetch forecast for city:",
        await forecastRes.text()
      );
      throw new Error(
        `Failed to fetch forecast for city: ${forecastRes.status}`
      );
    }

    const forecastData = await forecastRes.json();
    console.log("Forecast data fetched successfully for city");

    // Determine if it's daytime based on sunrise/sunset
    const isDay = isDaytime(
      currentData.sys.sunrise,
      currentData.sys.sunset,
      currentData.timezone
    );
    console.log("Is daytime for city:", isDay);

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

    // Ensure wind speed is in m/s for metric
    const windSpeed = currentData.wind.speed;
    const windSpeedFormatted = Math.round(windSpeed); // Already in m/s for metric

    const result: WeatherData = {
      location: currentData.name,
      current: {
        temp: Math.round(currentData.main.temp),
        condition: getConditionFromCode(currentData.weather[0].id, isDay),
        humidity: currentData.main.humidity, // Already accurate from API
        wind: windSpeedFormatted,
        feelsLike: Math.round(currentData.main.feels_like),
        uvIndex: uvIndex,
        lastUpdated: timestamp,
        isDay: isDay,
      },
      forecast: processedForecast,
      coordinates: {
        lat: currentData.coord.lat,
        lon: currentData.coord.lon,
      },
      timezone: currentData.timezone,
      units: units,
    };

    console.log(
      "Weather data for city constructed successfully:",
      result.location
    );
    return result;
  } catch (error) {
    console.error("Error fetching weather data by city:", error);
    return getMockWeatherData(null, null, cityName);
  }
}

// This function handles weather data fetching
export async function getWeatherData(city?: string): Promise<WeatherData> {
  console.log("getWeatherData called with city:", city);
  try {
    // Try to get user location first if no city is provided
    if (!city) {
      console.log("No city provided, trying geolocation");
      const coordinates = await getUserLocation();
      if (coordinates) {
        console.log("Geolocation available, using coordinates");
        return getWeatherByCoordinates(coordinates.lat, coordinates.lon);
      }
    }

    // If city is provided, use our enhanced city lookup function
    if (city) {
      console.log("City provided, using city name lookup");
      return getWeatherByCityName(city);
    }

    // Fallback to mock data
    console.log("No valid inputs, returning mock data");
    return getMockWeatherData();
  } catch (error) {
    console.error("Error in getWeatherData:", error);
    return getMockWeatherData();
  }
}

// Enhanced mock data for development or when API key is not available
function getMockWeatherData(
  lat?: number | null,
  lon?: number | null,
  cityName?: string
): WeatherData {
  // Get current local time
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Detect if it's likely day or night based on user's local time
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20; // Simple approximation: daytime is 6 AM to 8 PM

  // Choose an appropriate location name
  let location = "Demo Location";
  let coordinates = { lat: 1.3521, lon: 103.8198 }; // Singapore coordinates by default
  let timezone = 28800; // UTC+8 (Singapore timezone)

  // Use provided coordinates if available
  if (lat !== null && lon !== null && lat !== undefined && lon !== undefined) {
    coordinates = { lat, lon };
    location = "Custom Location";
  }

  // Use provided city name if available
  if (cityName) {
    location = cityName;
  }

  // Generate random variations for more realistic mock data
  const tempBase = 27; // Base temperature around Singapore average
  const tempVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2 degrees variation
  const currentTemp = tempBase + tempVariation;

  const humidityBase = 80; // Base humidity
  const humidityVariation = Math.floor(Math.random() * 10); // 0 to 10% variation
  const currentHumidity = humidityBase + humidityVariation;

  const windBase = 3; // Base wind speed in m/s
  const windVariation = Math.random() * 2; // 0 to 2 m/s variation
  const currentWind = Math.round((windBase + windVariation) * 10) / 10;

  const uvBase = isDay ? 8 : 0; // Base UV index (high during day, 0 at night)
  const uvVariation = isDay ? Math.floor(Math.random() * 3) - 1 : 0; // -1 to +1 variation during day
  const currentUV = Math.max(0, Math.min(11, uvBase + uvVariation)); // Ensure within 0-11 range

  // Generate forecast with varying temperatures and conditions
  const weatherConditions = [
    "Sunny",
    "Partly Cloudy",
    "Cloudy",
    "Rainy",
    "Thunderstorm",
  ];
  const forecast = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Get current day to start forecast from
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  for (let i = 0; i < 7; i++) {
    const dayIndex = (today + i) % 7;
    const randomTemp = tempBase + Math.floor(Math.random() * 7) - 3; // -3 to +3 from base
    const randomConditionIndex = Math.floor(
      Math.random() * weatherConditions.length
    );

    forecast.push({
      day: days[dayIndex],
      temp: randomTemp,
      condition: weatherConditions[randomConditionIndex],
    });
  }

  console.log(`Returning mock weather data for ${location}, isDay: ${isDay}`);

  return {
    location,
    current: {
      temp: currentTemp,
      condition: isDay ? "Sunny" : "Clear Night",
      humidity: currentHumidity,
      wind: currentWind,
      feelsLike: currentTemp + (currentHumidity > 70 ? 2 : 0), // Feels hotter with high humidity
      uvIndex: currentUV,
      lastUpdated: timestamp,
      isDay: isDay,
    },
    forecast,
    coordinates,
    timezone,
    units: "metric",
  };
}
