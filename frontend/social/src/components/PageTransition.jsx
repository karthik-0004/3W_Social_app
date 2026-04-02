import { motion } from 'framer-motion'

const MotionDiv = motion.div

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.16, ease: 'easeIn' } },
}

export default function PageTransition({ children }) {
  return (
    <MotionDiv
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </MotionDiv>
  )
}
