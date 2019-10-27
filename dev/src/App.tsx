import React, { Suspense, useState, useEffect } from 'react'
import Pages from './pages'
import NavigationDot from './components/NavigationDot'

export default () => {
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const resizeHandler: EventListener = () => setWidth(window.innerWidth)

    window.addEventListener('resize', resizeHandler)

    // clean up function
    return () => window.removeEventListener('resize', resizeHandler)
  }, [width])

  return (
    <div>
      {
        Pages.map(Page => (
          <Suspense fallback key={Math.random()}>
            <Page/>
          </Suspense>
        ))
      }

      {
        width > 640 ? <NavigationDot TotalPage={Pages.length} /> : null
      }
      
    </div>
  )
}