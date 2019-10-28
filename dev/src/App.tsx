import React, { Suspense, useState, useEffect } from 'react'
import Pages from './pages'
import NavigationDot from './components/NavigationDot'

export default () => {
  const [width, setWidth] = useState(window.innerWidth)
  const [height, setHeight] = useState(window.innerHeight)

  useEffect(() => {
    const resizeHandler: EventListener = () => setWidth(window.innerWidth) ; setHeight(window.innerHeight)

    window.addEventListener('resize', resizeHandler)

    // clean up function
    return () => window.removeEventListener('resize', resizeHandler)
  }, [width, height])

  return (
    <div>
      {
        Pages.map((Page, index) => (
          <Suspense fallback key={index}>
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