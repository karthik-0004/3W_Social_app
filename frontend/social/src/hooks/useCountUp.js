import { useEffect, useMemo, useState } from 'react'

export default function useCountUp(target = 0, duration = 1000) {
  const safeTarget = useMemo(() => Number(target) || 0, [target])
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let frame

    const tick = (now) => {
      const elapsed = Math.min(now - start, duration)
      const progress = elapsed / duration
      const eased = Math.pow(progress, 0.5)
      setValue(Math.round(safeTarget * eased))
      if (elapsed < duration) {
        frame = requestAnimationFrame(tick)
      }
    }

    setValue(0)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [safeTarget, duration])

  return value
}
