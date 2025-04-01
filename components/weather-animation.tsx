"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Cloud, CloudRain, CloudSnow, Sun, CloudLightning } from "lucide-react"

interface WeatherAnimationProps {
  condition: string
}

export function WeatherAnimation({ condition }: WeatherAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animation for rain drops
  useEffect(() => {
    if (condition !== "Rainy" && condition !== "Stormy") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const raindrops: { x: number; y: number; length: number; speed: number }[] = []

    // Create raindrops
    for (let i = 0; i < 100; i++) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 5,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "rgba(174, 230, 255, 0.5)"
      ctx.lineWidth = 1

      for (const drop of raindrops) {
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x, drop.y + drop.length)
        ctx.stroke()

        drop.y += drop.speed

        if (drop.y > canvas.height) {
          drop.y = -drop.length
          drop.x = Math.random() * canvas.width
        }
      }

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [condition])

  // Background color based on weather condition
  const getBgColor = () => {
    switch (condition) {
      case "Sunny":
        return "from-blue-400 to-sky-300"
      case "Partly Cloudy":
        return "from-blue-400 to-slate-300"
      case "Cloudy":
        return "from-slate-400 to-slate-300"
      case "Rainy":
        return "from-slate-600 to-slate-500"
      case "Stormy":
        return "from-slate-800 to-slate-700"
      case "Snowy":
        return "from-slate-300 to-blue-100"
      default:
        return "from-blue-400 to-sky-300"
    }
  }

  return (
    <div className={`relative h-64 bg-gradient-to-b ${getBgColor()} overflow-hidden`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {condition === "Sunny" && (
        <motion.div
          className="absolute top-6 right-12"
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Sun className="h-20 w-20 text-yellow-300 drop-shadow-lg" />
        </motion.div>
      )}

      {(condition === "Partly Cloudy" || condition === "Cloudy") && (
        <>
          {condition === "Partly Cloudy" && (
            <motion.div
              className="absolute top-6 left-12"
              animate={{
                rotate: 360,
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
              }}
            >
              <Sun className="h-16 w-16 text-yellow-300 drop-shadow-lg" />
            </motion.div>
          )}

          <motion.div
            className="absolute top-12 right-12"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <Cloud className="h-16 w-16 text-white drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <Cloud className="h-20 w-20 text-white drop-shadow-lg" />
          </motion.div>
        </>
      )}

      {condition === "Rainy" && (
        <>
          <motion.div
            className="absolute top-8 right-12"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <CloudRain className="h-16 w-16 text-slate-300 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <CloudRain className="h-20 w-20 text-slate-300 drop-shadow-lg" />
          </motion.div>
        </>
      )}

      {condition === "Stormy" && (
        <>
          <motion.div
            className="absolute top-8 right-12"
            animate={{
              x: [0, 10, 0],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <CloudLightning className="h-16 w-16 text-slate-300 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{
              x: [0, -10, 0],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <CloudLightning className="h-20 w-20 text-slate-300 drop-shadow-lg" />
          </motion.div>

          {/* Lightning flash */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{
              duration: 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: Math.random() * 5 + 5,
            }}
          />
        </>
      )}

      {condition === "Snowy" && (
        <>
          <motion.div
            className="absolute top-8 right-12"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <CloudSnow className="h-16 w-16 text-white drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <CloudSnow className="h-20 w-20 text-white drop-shadow-lg" />
          </motion.div>
        </>
      )}
    </div>
  )
}

