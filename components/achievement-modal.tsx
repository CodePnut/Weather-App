"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Award, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AchievementModalProps {
  type: string
  onClose: () => void
}

export function AchievementModal({ type, onClose }: AchievementModalProps) {
  useEffect(() => {
    // Trigger confetti when achievement is shown
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const getAchievementDetails = () => {
    switch (type) {
      case "streak":
        return {
          title: "10 Day Streak!",
          description: "You've checked the weather for 10 days in a row. Keep it up!",
          color: "text-amber-500",
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
          borderColor: "border-amber-300 dark:border-amber-700",
        }
      case "explorer":
        return {
          title: "Weather Explorer!",
          description: "You've earned 400 points and unlocked the Weather Explorer achievement!",
          color: "text-purple-500",
          bgColor: "bg-purple-100 dark:bg-purple-900/30",
          borderColor: "border-purple-300 dark:border-purple-700",
        }
      default:
        return {
          title: "Achievement Unlocked!",
          description: "You've unlocked a new achievement!",
          color: "text-blue-500",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          borderColor: "border-blue-300 dark:border-blue-700",
        }
    }
  }

  const details = getAchievementDetails()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl ${details.bgColor} border-2 ${details.borderColor}`}
      >
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="relative mb-4"
          >
            <div className="absolute inset-0 rounded-full blur-md opacity-50 bg-white" />
            <Award className={`h-24 w-24 ${details.color}`} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold mb-2"
          >
            {details.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-600 dark:text-slate-300"
          >
            {details.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            >
              Awesome!
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

