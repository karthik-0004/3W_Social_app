import { Box, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import AnimatedBackground from './AnimatedBackground'
import MobileNav from './MobileNav'
import SearchBar from './SearchBar'
import Sidebar from './Sidebar'

export default function Layout() {
  const isMobile = useMediaQuery('(max-width:768px)')
  const location = useLocation()
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false)

  useEffect(() => {
    setIsRouteTransitioning(true)
    const timer = window.setTimeout(() => {
      setIsRouteTransitioning(false)
    }, 260)

    return () => {
      window.clearTimeout(timer)
    }
  }, [location.pathname, location.search])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AnimatedBackground isRouteTransitioning={isRouteTransitioning} />
      {!isMobile && <Sidebar />}
      <Box
        sx={{
          flex: 1,
          ml: isMobile ? 0 : '260px',
          mb: isMobile ? '70px' : 0,
          minHeight: '100vh',
          px: { xs: 1.2, md: 2.5 },
        }}
      >
        <Box sx={{ maxWidth: 1180, mx: 'auto', width: '100%' }}>
          {!isMobile && (
            <Box sx={{ pt: 2.2, pb: 1.4, display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ width: 320, maxWidth: '100%' }}>
                <SearchBar />
              </Box>
            </Box>
          )}
          <Outlet />
        </Box>
      </Box>
      {isMobile && <MobileNav />}
    </Box>
  )
}
