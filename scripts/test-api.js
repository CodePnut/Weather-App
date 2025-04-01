/**
 * Tomorrow.io API Test Script
 *
 * This script tests the Tomorrow.io API directly to ensure
 * it's working correctly and to help debug API issues.
 *
 * Usage:
 * - Set your API key in the .env.local file or pass it as an environment variable
 * - Run with node scripts/test-api.js
 */

// Load environment variables from .env.local file
require("dotenv").config({ path: ".env.local" });

const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const baseUrl =
  process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL || "https://api.tomorrow.io/v4";

// Test location coordinates (Singapore)
const lat = 1.3521;
const lon = 103.8198;
const cityName = "Singapore";

// Utility to add timestamp to prevent caching
const addNoCacheParam = (url) => {
  const timestamp = Date.now();
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_nocache=${timestamp}`;
};

// Test current weather through Timeline API
async function testCurrentWeather() {
  console.log("\n--- Testing Current Weather (Timeline API) ---");

  try {
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
    ].join(",");

    const url = addNoCacheParam(
      `${baseUrl}/timelines?location=${lat},${lon}&fields=${fields}&timesteps=current&units=metric&apikey=${apiKey}`
    );

    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Response:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Success! Response summary:");

    // Data is in a nested structure
    if (data.data && data.data.timelines && data.data.timelines[0].intervals) {
      const current = data.data.timelines[0].intervals[0].values;

      console.log(`Location: ${lat}, ${lon} (Singapore)`);
      console.log(`Temperature: ${current.temperature}°C`);
      console.log(`Weather Code: ${current.weatherCode}`);
      console.log(
        `Precipitation Probability: ${current.precipitationProbability}%`
      );
      console.log(`Wind: ${current.windSpeed} m/s`);
      console.log(`Humidity: ${current.humidity}%`);
      console.log(`UV Index: ${current.uvIndex}`);
    } else {
      console.log("Unexpected response format:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error testing current weather:", error);
  }
}

// Test hourly forecast
async function testHourlyForecast() {
  console.log("\n--- Testing Hourly Forecast API ---");

  try {
    const fields = [
      "temperature",
      "weatherCode",
      "precipitationProbability",
    ].join(",");

    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24); // 24 hours from now

    const url = addNoCacheParam(
      `${baseUrl}/timelines?location=${lat},${lon}&fields=${fields}&timesteps=1h&startTime=now&endTime=${endTime.toISOString()}&units=metric&apikey=${apiKey}`
    );

    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Response:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Success! Response summary:");

    // Log the number of hourly forecasts
    if (data.data && data.data.timelines && data.data.timelines[0].intervals) {
      const intervals = data.data.timelines[0].intervals;
      console.log(`Number of hourly forecasts: ${intervals.length}`);
      console.log("Sample forecasts:");

      // Show the first few forecast periods
      for (let i = 0; i < Math.min(3, intervals.length); i++) {
        const forecast = intervals[i];
        console.log(
          `- ${new Date(forecast.startTime).toLocaleTimeString()}: ${
            forecast.values.temperature
          }°C, Code: ${forecast.values.weatherCode}, Precip: ${
            forecast.values.precipitationProbability
          }%`
        );
      }
    } else {
      console.log("Unexpected response format:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error testing hourly forecast:", error);
  }
}

// Test daily forecast
async function testDailyForecast() {
  console.log("\n--- Testing Daily Forecast API ---");

  try {
    const fields = [
      "temperatureMin",
      "temperatureMax",
      "weatherCode",
      "precipitationProbability",
      "precipitationIntensity",
    ].join(",");

    const endTime = new Date();
    endTime.setDate(endTime.getDate() + 5); // 5 days from now (API limit)

    const url = addNoCacheParam(
      `${baseUrl}/timelines?location=${lat},${lon}&fields=${fields}&timesteps=1d&startTime=now&endTime=${endTime.toISOString()}&units=metric&apikey=${apiKey}`
    );

    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Response:", errorText);
      return;
    }

    const data = await response.json();
    console.log("Success! Response summary:");

    // Log the number of daily forecasts
    if (data.data && data.data.timelines && data.data.timelines[0].intervals) {
      const intervals = data.data.timelines[0].intervals;
      console.log(`Number of daily forecasts: ${intervals.length}`);
      console.log("Daily forecasts:");

      // Show the forecast periods
      for (let i = 0; i < intervals.length; i++) {
        const forecast = intervals[i];
        const date = new Date(forecast.startTime);
        console.log(
          `- ${date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}: ${Math.round(forecast.values.temperatureMin)}°C to ${Math.round(
            forecast.values.temperatureMax
          )}°C, Code: ${forecast.values.weatherCode}, Precip: ${
            forecast.values.precipitationProbability
          }%`
        );
      }
    } else {
      console.log("Unexpected response format:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error testing daily forecast:", error);
  }
}

// Check API key
function checkApiKey() {
  console.log("\n--- API Key Check ---");

  if (!apiKey) {
    console.error(
      "Error: No API key found. Set NEXT_PUBLIC_WEATHER_API_KEY in .env.local file."
    );
    return false;
  }

  console.log(
    `API Key found: ${apiKey.substring(0, 4)}...${apiKey.substring(
      apiKey.length - 4
    )}`
  );
  return true;
}

// Run all tests
async function runAllTests() {
  console.log("Tomorrow.io API Test Script");
  console.log("==============================");

  if (!checkApiKey()) {
    return;
  }

  await testCurrentWeather();
  await testHourlyForecast();
  await testDailyForecast();

  console.log("\nTests completed!");
}

// Execute tests
runAllTests();
