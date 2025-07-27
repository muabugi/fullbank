import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'

export function LoadingBeam() {
  const [isVisible, setIsVisible] = useState(true)
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 4000) // 4 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      {/* Logo with breathing effect */}
      <motion.div
        className="mb-8 flex items-center justify-center"
        initial={{ opacity: 0.7, scale: 1 }}
        animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="40" cy="40" r="36" stroke="#22c55e" strokeWidth="6" fill="none" />
          <text
            x="50%"
            y="54%"
            textAnchor="middle"
            fontSize="32"
            fontWeight="bold"
            fill="#22c55e"
            fontFamily="sans-serif"
            dominantBaseline="middle"
            letterSpacing="-2"
          >
            GV
          </text>
        </svg>
      </motion.div>
      <div className="relative w-full max-w-2xl h-1">
        <motion.div
          className="absolute h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-full w-8 bg-primary/80 blur-xl"
          initial={{ left: "0%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 3.5, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  )
} 