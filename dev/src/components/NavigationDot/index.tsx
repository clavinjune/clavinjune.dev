import React, { useState, useEffect } from 'react'
import Style from './style.module.scss'

interface INavigationDot {
  TotalPage: number
}

export default ({ TotalPage }: INavigationDot) => {
  const [page, setPage] = useState(0)

  useEffect(() => {
    const scrollHandler: EventListener = () => setPage(Math.round(window.pageYOffset / window.innerHeight))
    window.addEventListener('scroll', scrollHandler)

    // cleanup function
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [page])

  return (
    <div className={Style.NavigationDot}>
      {
        [...Array(TotalPage).keys()].map(idx => {
          let className: string = page === idx ? Style.active : Style.inactive
          
          return <span key={idx} className={className}></span>
        })
      }
    </div>
  )
}