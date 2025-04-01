"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Cloud, CloudRain, Sun, Wind } from "lucide-react"

export function WeatherStats() {
  const [stats] = useState({
    daysChecked: 28,
    rainyDays: 8,
    sunnyDays: 15,
    windyDays: 5,
    highestTemp: 82,
    lowestTemp: 58,
  })

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
            <div className="text-xs text-slate-500 dark:text-slate-400">Days Checked</div>
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
            <div className="text-xs text-slate-500 dark:text-slate-400">Sunny Days</div>
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
            <div className="text-xs text-slate-500 dark:text-slate-400">Rainy Days</div>
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
            <div className="text-xs text-slate-500 dark:text-slate-400">Windy Days</div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between mt-4 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">Highest</div>
          <div className="text-2xl font-bold">{stats.highestTemp}°</div>
        </div>
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400">Lowest</div>
          <div className="text-2xl font-bold">{stats.lowestTemp}°</div>
        </div>
      </div>
    </div>
  )
}

