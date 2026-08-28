import type { Metadata } from 'next'
import { CardWorkshopApp } from '../../components/workshop/card-workshop-app'

export const metadata: Metadata = {
  title: '匕首心卡牌工坊 V3 | DH-IN-ONE',
  description: '支持武器、防具、战斗敌人、环境险境、赛博装备等 33+ 种卡牌设计，内嵌官方 d60 掉落抽取器与标准卡包导出。',
}

export default function WorkshopPage() {
  return <CardWorkshopApp />
}
