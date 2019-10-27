import React, { ReactNode } from 'react'
import Style from './style.module.scss'

interface IHighlightedSpan {
  children: ReactNode
}

export default ({ children }: IHighlightedSpan) => {
  return (
    <span className={Style.HighlightedSpan}>
      {children}
    </span>
  )
}