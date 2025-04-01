"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  Droplets,
  Sun,
  Wind,
  Award,
  Zap,
  Flame,
  Search,
  MapPin,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { WeatherAnimation } from "@/components/weather-animation";
import { WeatherForecast } from "@/components/weather-forecast";
import { AchievementModal } from "@/components/achievement-modal";
import { WeatherStats } from "@/components/weather-stats";
import { useTheme } from "next-themes";
import {
  getWeatherData,
  getUserLocation,
  getWeatherByCoordinates,
  type WeatherData,
  getWeatherByCityName,
} from "@/lib/weather-service";
import { CitySearch } from "@/components/ui/city-search";

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(() => {
    // Load streak from localStorage or start at 0
    if (typeof window !== "undefined") {
      const savedStreak = localStorage.getItem("weatherStreak");
      return savedStreak ? parseInt(savedStreak, 10) : 0;
    }
    return 0;
  });
  const [points, setPoints] = useState(() => {
    // Load points from localStorage or start at 0
    if (typeof window !== "undefined") {
      const savedPoints = localStorage.getItem("weatherPoints");
      return savedPoints ? parseInt(savedPoints, 10) : 0;
    }
    return 0;
  });
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementType, setAchievementType] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const { theme, setTheme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);

  // Prevent duplicate API calls
  const isFetchingRef = useRef(false);
  // Store last fetch time to control refresh rate
  const lastFetchTimeRef = useRef(0);

  // Save streak and points to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("weatherStreak", streak.toString());
      localStorage.setItem("weatherPoints", points.toString());
    }
  }, [streak, points]);

  // Load saved temperature unit preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUnit = localStorage.getItem("tempUnit") as "F" | "C" | null;
      if (savedUnit) {
        setTempUnit(savedUnit);
      }
    }
  }, []);

  // Enhanced fetch function to avoid race conditions and provide better error handling
  const fetchWeatherData = useCallback(async (cityName?: string) => {
    // Prevent duplicate fetches and throttle requests (max 1 request per 2 seconds)
    const now = Date.now();
    const minTimeBetweenFetches = 2000; // 2 seconds

    if (isFetchingRef.current) {
      console.log("Fetch already in progress, skipping");
      return null;
    }

    if (now - lastFetchTimeRef.current < minTimeBetweenFetches) {
      console.log("Throttling API requests, too many requests");
      return null;
    }

    try {
      console.log(
        "Fetching weather data for city:",
        cityName || "Using geolocation"
      );
      setLoading(true);
      setError("");

      // Set the fetching flag to prevent duplicate calls
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;

      const data = await getWeatherData(cityName);
      console.log("Weather data fetched successfully:", data.location);
      return data;
    } catch (err) {
      console.error("Error in fetchWeatherData:", err);
      setError("Failed to load weather data. Please try again.");
      return null;
    } finally {
      // Reset the fetching flag
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Fetch weather data when component mounts or when city changes
  useEffect(() => {
    console.log(
      "useEffect triggered with city:",
      city,
      "and refreshKey:",
      refreshKey
    );
    let isMounted = true;

    async function initialFetch() {
      const data = await fetchWeatherData(city);
      if (data && isMounted) {
        console.log("Setting weather data from useEffect:", data.location);
        setWeatherData(data);
      }
    }

    initialFetch();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [city, refreshKey, fetchWeatherData]);

  // Handle manual refresh with improved error handling
  const refreshWeather = async () => {
    if (isRefreshing) {
      console.log("Already refreshing, skipping");
      return;
    }

    try {
      setIsRefreshing(true);
      console.log("Manual refresh triggered");

      // Try to get fresh location data if no city is specified
      if (!city) {
        const coordinates = await getUserLocation();
        if (coordinates) {
          console.log("Got coordinates from geolocation:", coordinates);
          const data = await getWeatherByCoordinates(
            coordinates.lat,
            coordinates.lon
          );

          if (data) {
            console.log(
              "Setting weather data from manual refresh:",
              data.location
            );
            setWeatherData(data);
            setRefreshKey((prev) => prev + 1);

            // Give points for refreshing
            setPoints((prev) => prev + 5);
          }
          return;
        }
      }

      // Fallback to city-based search
      const data = await getWeatherData(city);
      if (data) {
        console.log("Setting weather data from city refresh:", data.location);
        setWeatherData(data);
        setRefreshKey((prev) => prev + 1);

        // Give points for refreshing
        setPoints((prev) => prev + 5);
      }
    } catch (err) {
      console.error("Error in refreshWeather:", err);
      setError("Failed to refresh weather data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle using current location
  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Getting current location");

      const coordinates = await getUserLocation();
      if (!coordinates) {
        setError(
          "Could not get your location. Please check your location permissions."
        );
        return;
      }

      console.log("Got coordinates from geolocation:", coordinates);

      // Clear city to use coordinates
      setCity(undefined);

      // This will trigger the useEffect due to city change
      // But we also fetch directly to avoid delay
      const data = await getWeatherByCoordinates(
        coordinates.lat,
        coordinates.lon
      );

      if (data) {
        console.log("Setting weather data from location:", data.location);
        setWeatherData(data);
        setRefreshKey((prev) => prev + 1);

        // Reward for using location
        setPoints((prev) => prev + 10);
      }
    } catch (err) {
      console.error("Error in useCurrentLocation:", err);
      setError("Failed to get your location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle city selection from search with direct data fetching
  const handleCitySelect = useCallback(async (selectedCity: string) => {
    console.log("City selected by name:", selectedCity);
    if (!selectedCity.trim()) {
      console.log("Empty city name, ignoring");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Update city state
      setCity(selectedCity);

      // Fetch weather data directly
      const data = await getWeatherByCityName(selectedCity);
      console.log("Weather data fetched by name:", data.location);

      // Force a refresh by updating state
      setWeatherData(data);
      setRefreshKey((prev) => prev + 1);

      // Reward for searching a new city
      setPoints((prev) => prev + 5);
    } catch (err) {
      console.error("Error in handleCitySelect:", err);
      setError("Failed to get weather data for selected city.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle coordinates selection from search with direct data fetching
  const handleCoordinatesSelect = useCallback(
    async (lat: number, lon: number) => {
      console.log("Coordinates selected:", lat, lon);
      try {
        setLoading(true);
        setError("");

        // Clear city to use coordinates directly
        setCity(undefined);

        // Fetch weather data directly
        const data = await getWeatherByCoordinates(lat, lon);
        console.log("Weather data fetched by coordinates:", data.location);

        // Force a refresh by updating state
        setWeatherData(data);
        setRefreshKey((prev) => prev + 1);

        // Reward for using coordinates search
        setPoints((prev) => prev + 8);
      } catch (err) {
        console.error("Error in handleCoordinatesSelect:", err);
        setError("Failed to get weather data for selected location.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Simulate checking weather and earning points
  const checkWeather = () => {
    // Add points
    const newPoints = points + 25;
    setPoints(newPoints);

    // Increment streak
    const newStreak = streak + 1;
    setStreak(newStreak);

    // Update weather stats
    if (weatherData) {
      // Get current stats
      interface WeatherStats {
        daysChecked: number;
        rainyDays: number;
        sunnyDays: number;
        windyDays: number;
        highestTemp: number;
        lowestTemp: number;
      }

      const defaultStats: WeatherStats = {
        daysChecked: 0,
        rainyDays: 0,
        sunnyDays: 0,
        windyDays: 0,
        highestTemp: -100,
        lowestTemp: 200,
      };

      let statsData: WeatherStats = defaultStats;

      if (typeof window !== "undefined") {
        const savedStats = localStorage.getItem("weatherStats");
        if (savedStats) {
          try {
            statsData = JSON.parse(savedStats) as WeatherStats;
          } catch (e) {
            console.error("Error parsing saved stats:", e);
          }
        }
      }

      const updatedStats: WeatherStats = { ...statsData };

      // Update days checked
      updatedStats.daysChecked += 1;

      // Update condition counts
      const condition = weatherData.current.condition;
      if (condition.includes("Sunny") || condition.includes("Clear")) {
        updatedStats.sunnyDays += 1;
      } else if (condition.includes("Rain") || condition.includes("Drizzle")) {
        updatedStats.rainyDays += 1;
      }

      if (weatherData.current.wind > 10) {
        updatedStats.windyDays += 1;
      }

      // Update temperature records
      const temp = weatherData.current.temp;
      if (temp > updatedStats.highestTemp) {
        updatedStats.highestTemp = temp;
      }

      if (temp < updatedStats.lowestTemp) {
        updatedStats.lowestTemp = temp;
      }

      // Save updated stats
      if (typeof window !== "undefined") {
        localStorage.setItem("weatherStats", JSON.stringify(updatedStats));
      }
    }

    // Show achievement if streak milestone reached
    if (newStreak === 7) {
      setAchievementType("streak-week");
      setShowAchievement(true);
    } else if (newStreak === 10) {
      setAchievementType("streak");
      setShowAchievement(true);
    }

    // Show achievement if points milestone reached
    if (newPoints >= 300 && points < 300) {
      setAchievementType("enthusiast");
      setShowAchievement(true);
    } else if (newPoints >= 400 && points < 400) {
      setAchievementType("explorer");
      setShowAchievement(true);
    }
  };

  // Toggle theme and earn points
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    setPoints((prev) => prev + 10);

    if (points >= 400 && !showAchievement) {
      setAchievementType("explorer");
      setShowAchievement(true);
    }
  };

  // Function to convert Celsius to Fahrenheit
  const convertToFahrenheit = (temp: number) => {
    return Math.round((temp * 9) / 5 + 32);
  };

  // Function to convert Fahrenheit to Celsius
  const convertToCelsius = (temp: number) => {
    return Math.round(((temp - 32) * 5) / 9);
  };

  // Get temperature with the user's preferred unit
  const getTemperatureInPreferredUnit = (temp: number) => {
    // If API units are metric (Celsius) and user wants Fahrenheit
    if (weatherData?.units === "metric" && tempUnit === "F") {
      return convertToFahrenheit(temp);
    }
    // If API units are imperial (Fahrenheit) and user wants Celsius
    else if (weatherData?.units === "imperial" && tempUnit === "C") {
      return convertToCelsius(temp);
    }
    // Units already match user preference
    else {
      return temp;
    }
  };

  // Toggle temperature unit and save preference
  const toggleTempUnit = () => {
    const newUnit = tempUnit === "F" ? "C" : "F";
    setTempUnit(newUnit);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("tempUnit", newUnit);
    }

    // Give points for toggling units
    setPoints((prev) => prev + 2);
  };

  if (!weatherData && loading) {
    return (
      <div className="container max-w-5xl mx-auto p-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Loading weather data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-5xl mx-auto p-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => handleCitySelect("Singapore")}>
              Try Default City
            </Button>
            <Button onClick={useCurrentLocation} variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Use My Location
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Sun className="h-8 w-8 text-yellow-500 dark:text-yellow-300" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Weather Wonderland
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-4 mt-4 md:mt-0"
        >
          <Badge
            variant="outline"
            className="px-3 py-1 flex items-center gap-2 bg-amber-100 dark:bg-amber-900 border-amber-300 dark:border-amber-700"
          >
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="font-medium">{streak} Day Streak</span>
          </Badge>

          <Badge
            variant="outline"
            className="px-3 py-1 flex items-center gap-2 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700"
          >
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="font-medium">{points} Points</span>
          </Badge>

          <Button
            variant="outline"
            onClick={toggleTempUnit}
            className="flex items-center gap-1 px-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 border-blue-200 dark:border-blue-800"
          >
            <span className="text-sm font-medium">
              {tempUnit === "F" ? "°F | °C" : "°C | °F"}
            </span>
          </Button>

          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Cloud className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <CitySearch
            onCitySelect={handleCitySelect}
            onCoordinatesSelect={handleCoordinatesSelect}
            isLoading={loading}
            error={error}
          />
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            onClick={useCurrentLocation}
            variant="outline"
            disabled={loading}
          >
            <MapPin className="h-4 w-4 mr-2" />
            My Location
          </Button>

          <Button
            onClick={refreshWeather}
            variant="outline"
            disabled={isRefreshing || loading}
            className={isRefreshing ? "opacity-70" : ""}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="relative">
                  <WeatherAnimation
                    condition={weatherData.current.condition}
                    isDay={weatherData.current.isDay}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/30 to-transparent text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-4xl font-bold mb-1">
                          {weatherData.location}
                        </h2>
                        <p className="text-lg opacity-90">
                          {weatherData.current.condition}
                        </p>
                        <div className="flex items-center mt-1 text-sm opacity-80">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Updated {weatherData.current.lastUpdated}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-6xl font-bold">
                          {getTemperatureInPreferredUnit(
                            weatherData.current.temp
                          )}
                          °{tempUnit}
                        </div>
                        <p className="text-lg opacity-90">
                          Feels like{" "}
                          {getTemperatureInPreferredUnit(
                            weatherData.current.feelsLike
                          )}
                          °{tempUnit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Droplets className="h-6 w-6 text-blue-500 mb-2" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Humidity
                      </span>
                      <span className="text-lg font-medium">
                        {weatherData.current.humidity}%
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-cyan-50 dark:bg-cyan-900/30 rounded-lg">
                      <Wind className="h-6 w-6 text-cyan-500 mb-2" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Wind
                      </span>
                      <span className="text-lg font-medium">
                        {weatherData.current.wind}{" "}
                        {weatherData.units === "metric" ? "m/s" : "mph"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                      <Sun className="h-6 w-6 text-amber-500 mb-2" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        UV Index
                      </span>
                      <span className="text-lg font-medium">
                        {weatherData.current.uvIndex}
                      </span>
                    </div>
                  </div>

                  <WeatherForecast
                    forecast={weatherData.forecast}
                    tempUnit={tempUnit}
                    convertTemp={(temp) => getTemperatureInPreferredUnit(temp)}
                  />

                  <div className="mt-6">
                    <Button
                      onClick={checkWeather}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Check Weather (+25 points)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>
              <TabsContent value="stats">
                <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Your Weather Stats
                    </h3>
                    <WeatherStats
                      coordinates={weatherData.coordinates}
                      tempUnit={tempUnit}
                      convertTemp={(temp) =>
                        getTemperatureInPreferredUnit(temp)
                      }
                      weatherData={weatherData}
                    />

                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        Level Progress
                      </h4>
                      <Progress value={points % 100} className="h-2 mb-1" />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Level {Math.floor(points / 100)}</span>
                        <span>{points % 100}/100 to next level</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="achievements">
                <Card className="border-none shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Achievements</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          streak >= 7
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-slate-700 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Award
                            className={`h-5 w-5 ${
                              streak >= 7 ? "text-green-500" : "text-slate-400"
                            }`}
                          />
                          <h4 className="font-medium">7 Day Streak</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Check the weather for 7 days in a row
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          streak >= 10
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-slate-700 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Award
                            className={`h-5 w-5 ${
                              streak >= 10 ? "text-green-500" : "text-slate-400"
                            }`}
                          />
                          <h4 className="font-medium">10 Day Streak</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Check the weather for 10 days in a row
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          points >= 300
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-slate-700 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Award
                            className={`h-5 w-5 ${
                              points >= 300
                                ? "text-green-500"
                                : "text-slate-400"
                            }`}
                          />
                          <h4 className="font-medium">Weather Enthusiast</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Earn 300 points
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          points >= 400
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-slate-700 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Award
                            className={`h-5 w-5 ${
                              points >= 400
                                ? "text-green-500"
                                : "text-slate-400"
                            }`}
                          />
                          <h4 className="font-medium">Weather Explorer</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Earn 400 points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showAchievement && (
          <AchievementModal
            type={achievementType}
            onClose={() => setShowAchievement(false)}
          />
        )}
      </AnimatePresence>

      {/* API Debug Link */}
      <div className="mt-8 text-center">
        <Button
          variant="link"
          size="sm"
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          onClick={() => (window.location.href = "/api-debug")}
        >
          API Debug Tools
        </Button>
      </div>
    </div>
  );
}
