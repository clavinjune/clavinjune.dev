import React from 'react'
import Style from './App.module.scss'
import { Home, About } from './pages'

export default () => {
  return (
    <div className={Style.App}>
      <Home/>
      <About />
    </div>
  )
}