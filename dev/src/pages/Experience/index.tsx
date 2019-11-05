import React from 'react'
import Style from './style.module.scss'
import Page from '../../components/Page'
import Card from '../../components/Card'
import data from './data.json'

interface ExpDate {
  month: number
  year: number
}

export interface ExpData {
  title: string
  type: string
  place: string
  description: string
  startDate: ExpDate
  endDate: ExpDate
}

export default () => {
  let groupedData: Array<Array<ExpData>> = [
    ...data
    .reduce((result: Map<string, Array<ExpData>>, exp: ExpData) =>
      result.set(exp.type, (result.get(exp.type) || []).concat(exp))
    , new Map<string, Array<ExpData>>())
    .values()
  ]

  let key = 0

  return (
    <Page ClassName={Style.Experience}>
      {
        groupedData.map((values: Array<ExpData>) => {
          return (
            <div key={++key} className={Style.row}>
              {
                values.map((value: ExpData) => <Card key={++key} Data={value}/>)
              }
            </div>
          )
        })
      }
    </Page>
  )
}