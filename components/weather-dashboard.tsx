"use client";

import { useState, useEffect } from "react";
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
import { getWeatherData, type WeatherData } from "@/lib/weather-service";

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [city, setCity] = useState("San Francisco");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(7);
  const [points, setPoints] = useState(350);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementType, setAchievementType] = useState("");
  const { theme, setTheme } = useTheme();

  // Fetch weather data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const data = await getWeatherData(city);
        setWeatherData(data);
      } catch (err) {
        setError("Failed to load weather data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [city]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput("");
      setPoints((prev) => prev + 5); // Reward for searching a new city
    }
  };

  // Simulate checking weather and earning points
  const checkWeather = () => {
    setPoints((prev) => prev + 25);
    setStreak((prev) => prev + 1);

    // Show achievement if streak milestone reached
    if (streak + 1 === 10) {
      setAchievementType("streak");
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
          <Button onClick={() => setCity("San Francisco")}>
            Try Default City
          </Button>
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

          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Cloud className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </header>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          type="text"
          placeholder="Enter city name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="default">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

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
                  <WeatherAnimation condition={weatherData.current.condition} />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/30 to-transparent text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-4xl font-bold mb-1">
                          {weatherData.location}
                        </h2>
                        <p className="text-lg opacity-90">
                          {weatherData.current.condition}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-6xl font-bold">
                          {weatherData.current.temp}°
                        </div>
                        <p className="text-lg opacity-90">
                          Feels like {weatherData.current.feelsLike}°
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
                        {weatherData.current.wind} mph
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

                  <WeatherForecast forecast={weatherData.forecast} />

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
                    <WeatherStats />

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
    </div>
  );
}
