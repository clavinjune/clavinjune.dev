import React from 'react'
import Style from './style.module.scss'
import Page from '../../components/Page'
import skills from './skills.json'

export default () => {

  return (
    <Page ClassName={Style.Knowledge}>
      <div className={Style.title}>Dev Skills</div>
      <div className={Style.skills}>
        {
          skills.sort( (skill1, skill2) => skill1.name.toUpperCase() > skill2.name.toUpperCase() ? 1 : -1 )
          .map(({ name, isProfessionallyWorkingWith }, idx) => {

          const className: string = isProfessionallyWorkingWith ? Style.professional : Style.nonProfessional

            return <span key={idx} className={className}>{name}</span>
          })
        }
      </div>
      <div className={Style.learn}>Other skills will be learned soon...</div>
    </Page>
  )
}