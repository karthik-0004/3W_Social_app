import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -20, filter: 'blur(10px)', transition: { duration: 0.3 } },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  )
}
