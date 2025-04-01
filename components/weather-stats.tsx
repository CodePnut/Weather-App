"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, Wind, MapPin } from "lucide-react";

interface WeatherStatsProps {
  coordinates?: {
    lat: number;
    lon: number;
  };
  tempUnit?: "F" | "C";
  convertTemp?: (temp: number) => number;
  weatherData?: any; // Add weatherData prop
}

export function WeatherStats({
  coordinates,
  tempUnit = "F",
  convertTemp = (t) => t,
  weatherData,
}: WeatherStatsProps) {
  // Initialize stats from localStorage or with zeros
  const [stats, setStats] = useState(() => {
    if (typeof window !== "undefined") {
      const savedStats = localStorage.getItem("weatherStats");
      if (savedStats) {
        return JSON.parse(savedStats);
      }
    }

    return {
      daysChecked: 0,
      rainyDays: 0,
      sunnyDays: 0,
      windyDays: 0,
      highestTemp: -100, // Will be updated on first weather check
      lowestTemp: 200, // Will be updated on first weather check
    };
  });

  // Update stats when weatherData changes
  useEffect(() => {
    if (!weatherData || !weatherData.current) return;

    const condition = weatherData.current.condition;
    const temp = weatherData.current.temp;

    const newStats = { ...stats };

    // Update condition counts
    if (condition.includes("Sunny") || condition.includes("Clear")) {
      newStats.sunnyDays += 0; // Don't increment automatically
    } else if (condition.includes("Rain") || condition.includes("Drizzle")) {
      newStats.rainyDays += 0; // Don't increment automatically
    } else if (weatherData.current.wind > 10) {
      newStats.windyDays += 0; // Don't increment automatically
    }

    // Update temperature records
    if (temp > newStats.highestTemp) {
      newStats.highestTemp = temp;
    }

    if (temp < newStats.lowestTemp) {
      newStats.lowestTemp = temp;
    }

    // Don't update state to avoid unnecessary re-renders
    // This will be updated when checkWeather is called
  }, [weatherData]);

  // Format coordinates as readable values (e.g., 37.7749° N, 122.4194° W)
  const formatCoordinates = () => {
    if (!coordinates) return null;

    const { lat, lon } = coordinates;
    const latDirection = lat >= 0 ? "N" : "S";
    const lonDirection = lon >= 0 ? "E" : "W";

    return (
      <div className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 mt-4">
        <MapPin className="h-3 w-3 mr-1" />
        <span>
          {Math.abs(lat).toFixed(4)}° {latDirection}, {Math.abs(lon).toFixed(4)}
          ° {lonDirection}
        </span>
      </div>
    );
  };

  // Get temperature with correct unit
  const formatTemp = (temp: number) => {
    return tempUnit === "F" ? temp : convertTemp(temp);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800">
            <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.daysChecked}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Days Checked
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800">
            <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.sunnyDays}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Sunny Days
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-800">
            <CloudRain className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.rainyDays}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Rainy Days
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800">
            <Wind className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.windyDays}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Windy Days
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Highest
          </div>
          <div className="text-2xl font-bold">
            {stats.highestTemp > -100
              ? `${formatTemp(stats.highestTemp)}°${tempUnit}`
              : "-"}
          </div>
        </div>
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Lowest
          </div>
          <div className="text-2xl font-bold">
            {stats.lowestTemp < 200
              ? `${formatTemp(stats.lowestTemp)}°${tempUnit}`
              : "-"}
          </div>
        </div>
      </div>

      {formatCoordinates()}
    </div>
  );
}
