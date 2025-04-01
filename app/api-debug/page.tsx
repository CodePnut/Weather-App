"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function ApiDebugPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<
    "loading" | "valid" | "invalid" | "missing"
  >("loading");
  const [weatherResponse, setWeatherResponse] = useState<any>(null);
  const [oneCallResponse, setOneCallResponse] = useState<any>(null);
  const [forecastResponse, setForecastResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom hook to add no-cache param to URLs
  const addNoCacheParam = (url: string) => {
    const timestamp = Date.now();
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}_nocache=${timestamp}`;
  };

  // Check if API key is valid
  const isValidApiKey = (key: string | null | undefined): boolean => {
    return (
      key !== undefined &&
      key !== null &&
      key !== "" &&
      key !== "your_api_key_here" &&
      typeof key === "string" &&
      key.length > 10
    );
  };

  // Format API key for display (hide most characters)
  const formatApiKey = (key: string | null): string => {
    if (!key) return "Not found";
    if (key === "your_api_key_here") return "Using placeholder value";
    if (key.length < 10) return "Invalid format";
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  };

  // Run tests on component mount
  useEffect(() => {
    const runTests = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get API key from environment variable
        const key = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        setApiKey(key || null);

        // Check API key validity
        if (!isValidApiKey(key)) {
          setApiStatus("invalid");
          setError(
            "API key is missing or invalid. Please add a valid OpenWeatherMap API key to your .env.local file."
          );
          setIsLoading(false);
          return;
        }

        // Test API endpoints
        const BASE_URL =
          process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL ||
          "https://api.openweathermap.org/data/2.5";
        const LAT = 1.3521; // Singapore
        const LON = 103.8198;

        // Test current weather API
        const weatherUrl = addNoCacheParam(
          `${BASE_URL}/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${key}`
        );

        const weatherResponse = await fetch(weatherUrl, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          throw new Error(
            `Weather API error: ${weatherResponse.status} ${weatherResponse.statusText}\n${errorText}`
          );
        }

        const weatherData = await weatherResponse.json();
        setWeatherResponse(weatherData);

        // Test OneCall API
        const oneCallUrl = addNoCacheParam(
          `${BASE_URL}/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly,daily,alerts&units=metric&appid=${key}`
        );

        const oneCallResponse = await fetch(oneCallUrl, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        if (oneCallResponse.ok) {
          const oneCallData = await oneCallResponse.json();
          setOneCallResponse(oneCallData);
        } else {
          console.warn("OneCall API failed but continuing with other tests");
          const errorText = await oneCallResponse.text();
          console.error(
            `OneCall API error: ${oneCallResponse.status} ${oneCallResponse.statusText}\n${errorText}`
          );
        }

        // Test Forecast API
        const forecastUrl = addNoCacheParam(
          `${BASE_URL}/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${key}`
        );

        const forecastResponse = await fetch(forecastUrl, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        if (!forecastResponse.ok) {
          const errorText = await forecastResponse.text();
          throw new Error(
            `Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}\n${errorText}`
          );
        }

        const forecastData = await forecastResponse.json();
        setForecastResponse(forecastData);

        // All tests passed
        setApiStatus("valid");
      } catch (error) {
        console.error("API test error:", error);
        setApiStatus("invalid");
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    runTests();
  }, []);

  const refreshTests = () => {
    setIsLoading(true);
    setApiStatus("loading");
    setWeatherResponse(null);
    setOneCallResponse(null);
    setForecastResponse(null);
    setError(null);

    // Add a short delay to allow state updates to render
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Helper to render the status badge
  const renderStatusBadge = (
    status: "loading" | "valid" | "invalid" | "missing"
  ) => {
    switch (status) {
      case "loading":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            Checking...
          </Badge>
        );
      case "valid":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            Valid
          </Badge>
        );
      case "invalid":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          >
            Invalid
          </Badge>
        );
      case "missing":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          >
            Missing
          </Badge>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Weather API Debug</h1>
        <Button onClick={refreshTests} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh Tests
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>API Key Status</span>
            {renderStatusBadge(apiStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="font-medium">API Key</span>
              <span>{formatApiKey(apiKey)}</span>
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm whitespace-pre-wrap">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {apiStatus === "valid" && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <p>
                    API key is valid and all endpoints are functioning
                    correctly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Current Weather API</span>
              {isLoading ? (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Testing
                </Badge>
              ) : weatherResponse ? (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Working
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                >
                  <XCircle className="h-3 w-3 mr-1" /> Failed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
              </div>
            ) : weatherResponse ? (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Location
                    </span>
                    <span className="font-medium">{weatherResponse.name}</span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Temperature
                    </span>
                    <span className="font-medium">
                      {Math.round(weatherResponse.main.temp)}°C
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Weather
                    </span>
                    <span className="font-medium">
                      {weatherResponse.weather[0].main}
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Humidity
                    </span>
                    <span className="font-medium">
                      {weatherResponse.main.humidity}%
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Wind
                    </span>
                    <span className="font-medium">
                      {weatherResponse.wind.speed} m/s
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Clouds
                    </span>
                    <span className="font-medium">
                      {weatherResponse.clouds.all}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <XCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
                <p>Failed to fetch current weather data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>OneCall API (UV Index)</span>
              {isLoading ? (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Testing
                </Badge>
              ) : oneCallResponse ? (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Working
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" /> N/A
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ) : oneCallResponse ? (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      UV Index
                    </span>
                    <span className="font-medium">
                      {oneCallResponse.current.uvi}
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Timezone
                    </span>
                    <span className="font-medium">
                      {oneCallResponse.timezone}
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Sunrise
                    </span>
                    <span className="font-medium">
                      {new Date(
                        oneCallResponse.current.sunrise * 1000
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="block text-gray-500 dark:text-gray-400">
                      Sunset
                    </span>
                    <span className="font-medium">
                      {new Date(
                        oneCallResponse.current.sunset * 1000
                      ).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500 mb-2" />
                <p>OneCall API not available or failed</p>
                <p className="text-sm text-gray-500 mt-2">
                  This is optional - the app will estimate UV index from other
                  data
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Forecast API</span>
              {isLoading ? (
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Testing
                </Badge>
              ) : forecastResponse ? (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Working
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                >
                  <XCircle className="h-3 w-3 mr-1" /> Failed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ) : forecastResponse ? (
              <div>
                <p className="mb-3">
                  Showing first 3 forecast periods of{" "}
                  {forecastResponse.list.length} total:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {forecastResponse.list
                    .slice(0, 3)
                    .map((forecast: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <p className="font-medium">{forecast.dt_txt}</p>
                        <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Temp:
                            </span>
                            <span className="ml-1">
                              {Math.round(forecast.main.temp)}°C
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Weather:
                            </span>
                            <span className="ml-1">
                              {forecast.weather[0].main}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Humidity:
                            </span>
                            <span className="ml-1">
                              {forecast.main.humidity}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Wind:
                            </span>
                            <span className="ml-1">
                              {forecast.wind.speed} m/s
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <XCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
                <p>Failed to fetch forecast data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>This page is for development and debugging purposes only.</p>
        <p className="mt-1">
          To fix API issues, ensure you have a valid OpenWeatherMap API key in
          your .env.local file with the name NEXT_PUBLIC_WEATHER_API_KEY.
        </p>
      </div>
    </div>
  );
}
