import React from 'react'
import Style from './style.module.scss'
import Page from '../../components/Page'
import Icon from '../../components/Icon'
import HighlightedSpan from '../../components/HighlightedSpan'
import { faLine, faLinkedin, faMedium, faInstagram, faGithubSquare } from '@fortawesome/free-brands-svg-icons'
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons'

export default () => {
  return (
    <Page ClassName={Style.About}>
      <div className={Style.name}>Cla.vin June</div>
      <div className={Style.pronounce}>/klavīn 'jün/</div>
      <div className={Style.category}>Dev</div>
      <div className={Style.description}>
        My name is <HighlightedSpan>Clavianus Juneardo</HighlightedSpan>,
        known as <HighlightedSpan>Clavin June</HighlightedSpan>.
        I was born in <HighlightedSpan>Tangerang, Indonesia</HighlightedSpan> on <HighlightedSpan>28 of June 1998</HighlightedSpan>.
        As a developer, I am focused on <HighlightedSpan>web development</HighlightedSpan>.
        Even though I was born as a <HighlightedSpan>native Indonesian</HighlightedSpan>,
        I understand <HighlightedSpan>English on a business level</HighlightedSpan> and <HighlightedSpan>a bit Japanese</HighlightedSpan>.
      </div>
      
      <div className={Style.icons}>
        <Icon Path="https://line.me/ti/p/~clavin7099" Icon={faLine} />
        <Icon Path="mailto:juneardoc@gmail.com" Icon={faEnvelopeSquare} />
        <Icon Path="https://linkedin.com/in/juneardoc" Icon={faLinkedin} />
        <Icon Path="https://github.com/ClavinJune" Icon={faGithubSquare} />
        <Icon Path="https://medium.com/@clavinjune" Icon={faMedium} />
        <Icon Path="https://instagram.com/clavinjune" Icon={faInstagram} />
      </div>
    </Page>
  )
}