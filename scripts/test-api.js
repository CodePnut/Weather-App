/**
 * OpenWeatherMap API Test Script
 *
 * This script tests the OpenWeatherMap API directly to ensure
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
  process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL ||
  "https://api.openweathermap.org/data/2.5";

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

// Test current weather by coordinates
async function testCurrentWeatherByCoords() {
  console.log("\n--- Testing Current Weather API by Coordinates ---");

  try {
    const url = addNoCacheParam(
      `${baseUrl}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
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
    console.log(`Location: ${data.name}`);
    console.log(`Temperature: ${data.main.temp}°C`);
    console.log(
      `Weather: ${data.weather[0].main} (${data.weather[0].description})`
    );
    console.log(`Wind: ${data.wind.speed} m/s`);
    console.log(`Humidity: ${data.main.humidity}%`);
    console.log(`Timezone: ${data.timezone} seconds from UTC`);
  } catch (error) {
    console.error("Error testing current weather by coordinates:", error);
  }
}

// Test current weather by city name
async function testCurrentWeatherByCity() {
  console.log("\n--- Testing Current Weather API by City Name ---");

  try {
    const url = addNoCacheParam(
      `${baseUrl}/weather?q=${cityName}&units=metric&appid=${apiKey}`
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
    console.log(`Location: ${data.name}`);
    console.log(`Temperature: ${data.main.temp}°C`);
    console.log(
      `Weather: ${data.weather[0].main} (${data.weather[0].description})`
    );
    console.log(`Wind: ${data.wind.speed} m/s`);
    console.log(`Humidity: ${data.main.humidity}%`);
  } catch (error) {
    console.error("Error testing current weather by city:", error);
  }
}

// Test OneCall API for UV index
async function testOneCallAPI() {
  console.log("\n--- Testing OneCall API for UV Index ---");

  try {
    const url = addNoCacheParam(
      `${baseUrl}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${apiKey}`
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
    console.log(`UV Index: ${data.current.uvi || "Not available"}`);
    console.log(
      `Is day: ${
        data.current.dt > data.current.sunrise &&
        data.current.dt < data.current.sunset
          ? "Yes"
          : "No"
      }`
    );
    console.log(
      `Sunrise: ${new Date(data.current.sunrise * 1000).toLocaleTimeString()}`
    );
    console.log(
      `Sunset: ${new Date(data.current.sunset * 1000).toLocaleTimeString()}`
    );
  } catch (error) {
    console.error("Error testing OneCall API:", error);
  }
}

// Test Forecast API
async function testForecastAPI() {
  console.log("\n--- Testing 5-day Forecast API ---");

  try {
    const url = addNoCacheParam(
      `${baseUrl}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
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
    console.log(`Number of forecast periods: ${data.list.length}`);
    console.log("Sample forecasts:");

    // Show the first few forecast periods
    for (let i = 0; i < Math.min(3, data.list.length); i++) {
      const forecast = data.list[i];
      console.log(
        `- ${forecast.dt_txt}: ${forecast.main.temp}°C, ${forecast.weather[0].main}`
      );
    }
  } catch (error) {
    console.error("Error testing forecast API:", error);
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
  console.log("OpenWeatherMap API Test Script");
  console.log("==============================");

  if (!checkApiKey()) {
    return;
  }

  await testCurrentWeatherByCoords();
  await testCurrentWeatherByCity();
  await testOneCallAPI();
  await testForecastAPI();

  console.log("\nTests completed!");
}

// Execute tests
runAllTests();
