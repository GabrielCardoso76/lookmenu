"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const ingredients = [
  {
    id: "burger",
    path: "M4 18h16c0 0 1-3-8-3s-8 3-8 3zm0-2c0-1 2-4 8-4s8 3 8 4H4zm1-5h14c.5 0 1 .5 1 1H4c0-.5.5-1 1-1zm-1 2h16s-1-1-8-1-8 1-8 1zM6 8h12c1 0 2 1 2 2H4c0-1 1-2 2-2z",
    size: 32,
    positions: { top: "8%", left: "5%" },
    parallaxRange: [0, -60],
  },
  {
    id: "tomato",
    path: "M12 2c-1 0-2 .5-2 .5S11 4 12 4s2-1.5 2-1.5S13 2 12 2zm0 3c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7zm0 2c.3 0 .5.1.5.1l-1 5-.5-5.1h1zm-2 .5l1.5 4.5-3-3.5c.4-.5 1-1 1.5-1zm4 0c.5.5 1.1 1 1.5 1.5l-3 3.5 1.5-5z",
    size: 28,
    positions: { top: "15%", right: "8%" },
    parallaxRange: [0, -80],
  },
  {
    id: "leaf",
    path: "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z",
    size: 26,
    positions: { bottom: "20%", left: "8%" },
    parallaxRange: [0, -50],
  },
  {
    id: "pizza",
    path: "M12 2C7.58 2 4 5.58 4 10l8 10 8-10c0-4.42-3.58-8-8-8zm-2 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z",
    size: 24,
    positions: { top: "45%", right: "4%" },
    parallaxRange: [0, -70],
  },
  {
    id: "fries",
    path: "M18 11h-1V8c0-.55-.45-1-1-1h-1V4c0-.55-.45-1-1-1s-1 .45-1 1v3h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v3H8c-.55 0-1 .45-1 1v3H6c-.55 0-1 .45-1 1v2c0 3.31 2.69 6 6 6h2c3.31 0 6-2.69 6-6v-2c0-.55-.45-1-1-1z",
    size: 22,
    positions: { bottom: "35%", right: "12%" },
    parallaxRange: [0, -55],
  },
]

export function FloatingIngredients() {
  const { scrollY } = useScroll()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {ingredients.map((item) => (
        <FloatingItem key={item.id} item={item} scrollY={scrollY} />
      ))}
    </div>
  )
}

function FloatingItem({
  item,
  scrollY,
}: {
  item: (typeof ingredients)[number]
  scrollY: ReturnType<typeof useScroll>["scrollY"]
}) {
  const y = useTransform(scrollY, [0, 3000], item.parallaxRange)

  return (
    <motion.div
      className="absolute opacity-[0.06]"
      style={{
        ...item.positions,
        y,
      }}
      animate={{
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <svg
        width={item.size}
        height={item.size}
        viewBox="0 0 24 24"
        className="fill-primary"
      >
        <path d={item.path} />
      </svg>
    </motion.div>
  )
}
