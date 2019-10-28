import React from 'react'
import Style from './style.module.scss'
import Page from '../../components/Page'

export default () => {
  return (
    <Page ClassName={Style.Home}>
      <div className={Style.name}>Clavin June</div>
      <div className={Style.title}>résumé</div>
    </Page>
  )
}
