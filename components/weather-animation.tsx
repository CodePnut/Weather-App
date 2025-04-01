"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  CloudLightning,
  Star,
} from "lucide-react";

interface WeatherAnimationProps {
  condition: string;
  isDay?: boolean;
}

export function WeatherAnimation({
  condition,
  isDay = true,
}: WeatherAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation for rain drops
  useEffect(() => {
    if (
      condition !== "Rainy" &&
      condition !== "Stormy" &&
      condition !== "Drizzle"
    )
      return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const raindrops: { x: number; y: number; length: number; speed: number }[] =
      [];

    // Create raindrops
    for (let i = 0; i < 100; i++) {
      raindrops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(174, 230, 255, 0.5)";
      ctx.lineWidth = 1;

      for (const drop of raindrops) {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;

        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [condition]);

  // Stars animation for night sky
  useEffect(() => {
    if (isDay) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const stars: {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      twinkleSpeed: number;
    }[] = [];

    // Create stars
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let time = 0;
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        // Make stars twinkle
        const opacity =
          star.opacity * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed * 10));

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isDay]);

  // Background color based on weather condition and day/night
  const getBgColor = () => {
    // Night conditions
    if (!isDay) {
      switch (condition) {
        case "Clear Night":
          return "from-indigo-900 to-slate-900";
        case "Partly Cloudy Night":
          return "from-slate-900 to-indigo-900";
        case "Cloudy":
          return "from-slate-800 to-slate-900";
        case "Rainy":
        case "Drizzle":
          return "from-slate-900 to-slate-800";
        case "Thunderstorm":
        case "Stormy":
          return "from-slate-950 to-slate-900";
        case "Snowy":
        case "Foggy":
          return "from-slate-800 to-slate-700";
        default:
          return "from-indigo-900 to-slate-900";
      }
    }

    // Day conditions
    switch (condition) {
      case "Sunny":
        return "from-blue-400 to-sky-300";
      case "Partly Cloudy":
        return "from-blue-400 to-slate-300";
      case "Cloudy":
        return "from-slate-400 to-slate-300";
      case "Rainy":
      case "Drizzle":
        return "from-slate-600 to-slate-500";
      case "Thunderstorm":
      case "Stormy":
        return "from-slate-800 to-slate-700";
      case "Snowy":
        return "from-slate-300 to-blue-100";
      case "Foggy":
        return "from-slate-400 to-slate-300";
      default:
        return "from-blue-400 to-sky-300";
    }
  };

  return (
    <div
      className={`relative h-64 bg-gradient-to-b ${getBgColor()} overflow-hidden`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {condition === "Sunny" && isDay && (
        <motion.div
          className="absolute top-6 right-12"
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <Sun className="h-20 w-20 text-yellow-300 drop-shadow-lg" />
        </motion.div>
      )}

      {condition === "Clear Night" && !isDay && (
        <>
          <motion.div
            className="absolute top-6 right-12"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              scale: {
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            <Moon className="h-16 w-16 text-gray-200 drop-shadow-lg" />
          </motion.div>

          {/* Just a few bigger stars as elements */}
          <motion.div
            className="absolute top-10 left-20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Star className="h-3 w-3 text-white" />
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-40"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Star className="h-2 w-2 text-white" />
          </motion.div>
        </>
      )}

      {condition === "Partly Cloudy" && isDay && (
        <>
          <motion.div
            className="absolute top-6 left-12"
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: {
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
              scale: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            <Sun className="h-16 w-16 text-yellow-300 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute top-12 right-12"
            animate={{ x: [0, 10, 0] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-16 w-16 text-white drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-20 w-20 text-white drop-shadow-lg" />
          </motion.div>
        </>
      )}

      {condition === "Partly Cloudy Night" && !isDay && (
        <>
          <motion.div
            className="absolute top-6 left-12"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              scale: {
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }}
          >
            <Moon className="h-14 w-14 text-gray-200 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute top-12 right-12"
            animate={{ x: [0, 10, 0] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-16 w-16 text-gray-300 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-20 w-20 text-gray-300 drop-shadow-lg" />
          </motion.div>
        </>
      )}

      {condition === "Cloudy" && (
        <>
          <motion.div
            className="absolute top-12 right-12"
            animate={{ x: [0, 10, 0] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-16 w-16 text-gray-300 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-20 w-20 text-gray-300 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute top-20 left-32"
            animate={{ x: [0, 8, 0] }}
            transition={{
              duration: 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-14 w-14 text-gray-300 drop-shadow-lg" />
          </motion.div>
        </>
      )}

      {(condition === "Rainy" || condition === "Drizzle") && (
        <>
          <motion.div
            className="absolute top-8 right-12"
            animate={{ x: [0, 10, 0] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <CloudRain className="h-16 w-16 text-gray-300 drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <CloudRain className="h-20 w-20 text-gray-300 drop-shadow-lg" />
          </motion.div>
        </>
      )}

      {(condition === "Thunderstorm" || condition === "Stormy") && (
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
            <CloudLightning className="h-16 w-16 text-gray-300 drop-shadow-lg" />
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
            <CloudLightning className="h-20 w-20 text-gray-300 drop-shadow-lg" />
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
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <CloudSnow className="h-16 w-16 text-white drop-shadow-lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-12"
            animate={{ x: [0, -10, 0] }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <CloudSnow className="h-20 w-20 text-white drop-shadow-lg" />
          </motion.div>
        </>
      )}

      {condition === "Foggy" && (
        <>
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>
          <motion.div
            className="absolute inset-0 bg-white/20 backdrop-blur-sm"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          ></motion.div>

          <motion.div
            className="absolute top-10 right-12 opacity-70"
            animate={{ x: [0, 10, 0] }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-16 w-16 text-white drop-shadow-sm" />
          </motion.div>

          <motion.div
            className="absolute bottom-20 left-20 opacity-70"
            animate={{ x: [0, -10, 0] }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Cloud className="h-24 w-24 text-white drop-shadow-sm" />
          </motion.div>
        </>
      )}
    </div>
  );
}
