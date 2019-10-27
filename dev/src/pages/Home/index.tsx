import React from 'react'
import Page from '../../components/Page'
import Style from './style.module.scss'

export default () => {
  return (
    <Page ClassName={Style.Home}>
      <div className={Style.name}>Clavin June</div>
      <div className={Style.title}>résumé</div>
    </Page>
  )
}
