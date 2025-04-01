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
  };
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
}

// Utility function to convert weather condition codes to human-readable conditions
function getConditionFromCode(code: number): string {
  // Weather condition codes: https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) return "Thunderstorm";
  if (code >= 300 && code < 400) return "Drizzle";
  if (code >= 500 && code < 600) return "Rainy";
  if (code >= 600 && code < 700) return "Snowy";
  if (code >= 700 && code < 800) return "Foggy";
  if (code === 800) return "Sunny";
  if (code > 800) return "Partly Cloudy";
  return "Unknown";
}

// Get day name from date
function getDayName(dateStr: string): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

// This function is cached to improve performance
export const getWeatherData = cache(
  async (city: string = "San Francisco"): Promise<WeatherData> => {
    try {
      // If we don't have an API key, return mock data
      if (!API_KEY || API_KEY === "your_api_key_here") {
        return getMockWeatherData();
      }

      // Fetch current weather
      const currentRes = await fetch(
        `${BASE_URL}/weather?q=${city}&units=imperial&appid=${API_KEY}`
      );
      if (!currentRes.ok) throw new Error("Failed to fetch current weather");
      const currentData = await currentRes.json();

      // Fetch 7-day forecast
      const forecastRes = await fetch(
        `${BASE_URL}/forecast?q=${city}&units=imperial&appid=${API_KEY}`
      );
      if (!forecastRes.ok) throw new Error("Failed to fetch forecast");
      const forecastData = await forecastRes.json();

      // Process forecast data - filter to get one entry per day
      const processedForecast = forecastData.list
        .filter((item: any, index: number) => index % 8 === 0) // One entry per day (3-hour intervals, 8 entries per day)
        .slice(0, 7) // Only take 7 days
        .map((item: any) => ({
          day: getDayName(item.dt_txt),
          temp: Math.round(item.main.temp),
          condition: getConditionFromCode(item.weather[0].id),
        }));

      return {
        location: currentData.name,
        current: {
          temp: Math.round(currentData.main.temp),
          condition: getConditionFromCode(currentData.weather[0].id),
          humidity: currentData.main.humidity,
          wind: Math.round(currentData.wind.speed),
          feelsLike: Math.round(currentData.main.feels_like),
          uvIndex: 6, // UV Index not available in free tier, using a placeholder
        },
        forecast: processedForecast,
      };
    } catch (error) {
      console.error("Error fetching weather data:", error);
      return getMockWeatherData();
    }
  }
);

// Mock data for development or when API key is not available
function getMockWeatherData(): WeatherData {
  return {
    location: "San Francisco",
    current: {
      temp: 72,
      condition: "Sunny",
      humidity: 45,
      wind: 8,
      feelsLike: 74,
      uvIndex: 6,
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
  };
}
