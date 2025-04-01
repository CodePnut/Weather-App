"use client";

import { motion } from "framer-motion";
import { Cloud, CloudRain, CloudSnow, Sun, CloudLightning } from "lucide-react";

interface ForecastDay {
  day: string;
  temp: number;
  condition: string;
}

interface WeatherForecastProps {
  forecast: ForecastDay[];
  tempUnit?: "F" | "C";
  convertTemp?: (temp: number) => number;
}

export function WeatherForecast({
  forecast,
  tempUnit = "F",
  convertTemp = (t) => t,
}: WeatherForecastProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "Sunny":
        return <Sun className="h-6 w-6 text-yellow-500" />;
      case "Partly Cloudy":
        return <Cloud className="h-6 w-6 text-slate-400" />;
      case "Cloudy":
        return <Cloud className="h-6 w-6 text-slate-500" />;
      case "Rainy":
        return <CloudRain className="h-6 w-6 text-blue-500" />;
      case "Stormy":
        return <CloudLightning className="h-6 w-6 text-purple-500" />;
      case "Snowy":
        return <CloudSnow className="h-6 w-6 text-blue-300" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-3">7-Day Forecast</h3>
      <div className="grid grid-cols-7 gap-2">
        {forecast.map((day, index) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="text-sm font-medium mb-2">{day.day}</span>
            {getWeatherIcon(day.condition)}
            <span className="mt-2 text-lg font-medium">
              {tempUnit === "F" ? day.temp : convertTemp(day.temp)}°{tempUnit}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
