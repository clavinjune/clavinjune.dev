import React from 'react'
import Style from './style.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IIcon } from '../../interfaces'

export default ({ Icon, Path }: IIcon) => {
  return (
    <a target="_blank" rel="noopener noreferrer" href={Path}>
      <FontAwesomeIcon icon={Icon} className={Style.Icon} />
    </a>
  )
}