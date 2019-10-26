import React, { Component, CSSProperties } from 'react'
import Style from './style.module.scss'

interface IPage {
  Style?: CSSProperties
}

export default class Page extends Component<IPage> {
  render () {
    const style: CSSProperties = this.props.Style || {}
    return (
      <div style={style} className={Style.Page}>
        {this.props.children}
      </div>
    )
  }
}