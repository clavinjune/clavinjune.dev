import React, { ReactNode } from 'react'
import Style from './style.module.scss'

interface IPage {
  ClassName?: string,
  children: ReactNode
}

export default ({ ClassName, children }: IPage) => {
  const className: string = `${Style.Page} ${ClassName || ''}`
  
  return (
    <div className={className}>
      {children}
    </div>
  )
}