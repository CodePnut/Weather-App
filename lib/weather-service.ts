"use client";

import { cache } from "react";
import { findCityByName, CityData } from "@/lib/cities-data";
import { getConditionFromCode, getWeatherAttributes } from "@/lib/tomorrow-weather-codes";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL || "https://api.tomorrow.io/v4";

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
    "⚠️ Tomorrow.io API key is missing or invalid. Using mock data instead. " +
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
    weatherCode?: number; // Added for Tomorrow.io integration
    precipitationProbability?: number; // Added for Tomorrow.io integration
    precipitationIntensity?: number; // Added for Tomorrow.io integration
    visibility?: number; // Added for Tomorrow.io integration
    pressure?: number; // Added for Tomorrow.io integration
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    weatherCode?: number; // Added for Tomorrow.io integration
    precipitationProbability?: number; // Added for Tomorrow.io integration
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

function isDaytime(
  sunriseTimestamp: number,
  sunsetTimestamp: number
): boolean {
  const now = new Date().getTime();
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
    
    const fields = [
      "temperature", 
      "temperatureApparent", 
      "humidity", 
      "windSpeed", 
      "precipitationProbability",
      "precipitationIntensity",
      "weatherCode", 
      "uvIndex", 
      "visibility",
      "pressureSurfaceLevel",
      "sunriseTime",
      "sunsetTime"
    ].join(",");
    
    // Fetch current weather with improved no-cache approach
    const currentUrl = addNoCacheParam(
      `${BASE_URL}/timelines?location=${lat},${lon}&fields=${fields}&timesteps=current&units=${units}&apikey=${API_KEY}`
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
    console.log("Current weather fetched for coordinates");
    
    const currentValues = currentData.data.timelines[0].intervals[0].values;
    const currentTime = currentData.data.timelines[0].intervals[0].startTime;
    
    let locationName = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    try {
      const geocodeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const geocodeRes = await fetch(geocodeUrl);
      if (geocodeRes.ok) {
        const geocodeData = await geocodeRes.json();
        locationName = geocodeData.city || geocodeData.locality || locationName;
      }
    } catch (error) {
      console.error("Error getting location name:", error);
    }

    const forecastFields = [
      "temperature",
      "weatherCode",
      "precipitationProbability"
    ].join(",");
    
    const forecastUrl = addNoCacheParam(
      `${BASE_URL}/timelines?location=${lat},${lon}&fields=${forecastFields}&timesteps=1d&startTime=now&endTime=${encodeURIComponent(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())}&units=${units}&apikey=${API_KEY}`
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
    const sunriseTime = new Date(currentValues.sunriseTime).getTime();
    const sunsetTime = new Date(currentValues.sunsetTime).getTime();
    const isDay = isDaytime(sunriseTime, sunsetTime);
    console.log("Is daytime:", isDay);

    const processedForecast = forecastData.data.timelines[0].intervals
      .slice(0, 7) // Only take 7 days
      .map((item: any) => {
        const date = new Date(item.startTime);
        return {
          day: getDayName(item.startTime),
          temp: Math.round(item.values.temperature),
          condition: getConditionFromCode(item.values.weatherCode, true), // Assume daytime for forecasts
          weatherCode: item.values.weatherCode,
          precipitationProbability: item.values.precipitationProbability
        };
      });

    // Get current local time
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const windSpeedFormatted = Math.round(currentValues.windSpeed);

    const result: WeatherData = {
      location: locationName,
      current: {
        temp: Math.round(currentValues.temperature),
        condition: getConditionFromCode(currentValues.weatherCode, isDay),
        humidity: Math.round(currentValues.humidity),
        wind: windSpeedFormatted,
        feelsLike: Math.round(currentValues.temperatureApparent),
        uvIndex: Math.round(currentValues.uvIndex),
        lastUpdated: timestamp,
        isDay: isDay,
        weatherCode: currentValues.weatherCode,
        precipitationProbability: currentValues.precipitationProbability,
        precipitationIntensity: currentValues.precipitationIntensity,
        visibility: currentValues.visibility,
        pressure: currentValues.pressureSurfaceLevel
      },
      forecast: processedForecast,
      coordinates: { lat, lon },
      timezone: 0, // Tomorrow.io uses UTC timestamps
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

    console.log("City not found in database, using geocoding search");
    // Check for valid API key
    if (!isValidApiKey()) {
      logApiKeyMissing();
      return getMockWeatherData(null, null, cityName);
    }

    const searchCity = encodeURIComponent(cityName);
    
    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${searchCity}&format=json&limit=1`;
      console.log("Geocoding city:", geocodeUrl);
      
      const geocodeRes = await fetch(geocodeUrl, {
        headers: {
          "User-Agent": "Weather-App/1.0"
        }
      });
      
      if (!geocodeRes.ok) {
        throw new Error(`Geocoding failed: ${geocodeRes.status}`);
      }
      
      const geocodeData = await geocodeRes.json();
      
      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0];
        console.log(`City "${cityName}" geocoded to coordinates:`, lat, lon);
        
        return await getWeatherByCoordinates(parseFloat(lat), parseFloat(lon));
      } else {
        console.error("City not found in geocoding service");
        return getMockWeatherData(null, null, cityName);
      }
    } catch (error) {
      console.error("Error geocoding city:", error);
      return getMockWeatherData(null, null, cityName);
    }
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
  let timezone = 0; // UTC timezone (Tomorrow.io uses UTC)

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

  const weatherCodes = [
    { code: 1000, condition: "Sunny" },
    { code: 1100, condition: "Partly Cloudy" },
    { code: 1001, condition: "Cloudy" },
    { code: 4000, condition: "Drizzle" },
    { code: 4001, condition: "Rainy" },
    { code: 8000, condition: "Thunderstorm" },
    { code: 5000, condition: "Snowy" },
    { code: 2000, condition: "Foggy" },
  ];
  
  // Generate forecast with varying temperatures and conditions
  const forecast = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Get current day to start forecast from
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  const currentWeatherCode = isDay ? 1000 : 1000;

  for (let i = 0; i < 7; i++) {
    const dayIndex = (today + i) % 7;
    const randomTemp = tempBase + Math.floor(Math.random() * 7) - 3; // -3 to +3 from base
    const randomWeatherIndex = Math.floor(Math.random() * weatherCodes.length);
    const weatherCode = weatherCodes[randomWeatherIndex];
    
    forecast.push({
      day: days[dayIndex],
      temp: randomTemp,
      condition: weatherCode.condition,
      weatherCode: weatherCode.code,
      precipitationProbability: Math.floor(Math.random() * 100)
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
      weatherCode: currentWeatherCode,
      precipitationProbability: Math.floor(Math.random() * 30), // Lower for sunny weather
      precipitationIntensity: 0.1,
      visibility: 10,
      pressure: 1013
    },
    forecast,
    coordinates,
    timezone,
    units: "metric",
  };
}
