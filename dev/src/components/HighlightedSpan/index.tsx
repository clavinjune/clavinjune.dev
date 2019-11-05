import React from 'react'
import Style from './style.module.scss'
import { IHighlightedSpan } from '../../interfaces'

export default ({ children }: IHighlightedSpan) => {
  return (
    <span className={Style.HighlightedSpan}>
      {children}
    </span>
  )
}