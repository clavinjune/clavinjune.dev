import React from 'react'
import Style from './style.module.scss'
import { IPage } from '../../interfaces'

export default ({ ClassName, children }: IPage) => {
  const className: string = `${Style.Page} ${ClassName || ''}`
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}