"use client"

import React from 'react'
import type { SheetData } from '@/lib/sheet-data'
import type { CyberpunkSheetExtension } from '@/types/cyberpunk'
import { CYBERPUNK_TIER_SLOTS, CYBERPUNK_TIER_EQUIP_SLOTS } from '@/lib/cyberpunk/tier-constants'
import { CardMarkdown } from '@/components/ui/card-markdown'

interface CyberpunkPrintDossierPageProps {
  sheetData: SheetData
  cyberpunkData: CyberpunkSheetExtension
}

export function CyberpunkPrintDossierPage({
  sheetData,
  cyberpunkData,
}: CyberpunkPrintDossierPageProps) {
  const currentTier = cyberpunkData.tier || 'T1'
  const baseSlots = CYBERPUNK_TIER_SLOTS[currentTier]
  const baseEquipLimit = CYBERPUNK_TIER_EQUIP_SLOTS[currentTier]

  // 计算各部位已装配数量 (兼容 zones.head 与 augmentations 两种可能)
  const headList = cyberpunkData.zones?.head?.augmentations || (cyberpunkData as any).augmentations?.head || []
  const torsoList = cyberpunkData.zones?.torso?.augmentations || (cyberpunkData as any).augmentations?.torso || []
  const armsList = cyberpunkData.zones?.upper_limb?.augmentations || cyberpunkData.zones?.arms?.augmentations || (cyberpunkData as any).augmentations?.arms || []
  const legsList = cyberpunkData.zones?.lower_limb?.augmentations || cyberpunkData.zones?.legs?.augmentations || (cyberpunkData as any).augmentations?.legs || []
  const externalList = cyberpunkData.externalGear || []

  const headCount = headList.length
  const torsoCount = torsoList.length
  const armsCount = armsList.length
  const legsCount = legsList.length
  const externalCount = externalList.length

  // 各部位槽位上限
  const headMax = cyberpunkData.zoneSlotLimits?.head ?? baseSlots
  const torsoMax = cyberpunkData.zoneSlotLimits?.torso ?? baseSlots
  const armsMax = cyberpunkData.zoneSlotLimits?.upper_limb ?? cyberpunkData.zoneSlotLimits?.arms ?? baseSlots
  const legsMax = cyberpunkData.zoneSlotLimits?.lower_limb ?? cyberpunkData.zoneSlotLimits?.legs ?? baseSlots
  const externalMax = cyberpunkData.zoneSlotLimits?.external ?? baseEquipLimit

  // 提取立绘图片
  const portraitUrl = cyberpunkData.portrait || (sheetData as any).characterImage || (cyberpunkData as any).portraitImage

  // 生命、压力、希望、护甲
  const maxHP = Number(sheetData.hpMax) || 6
  const currentHP = Array.isArray(sheetData.hp) ? sheetData.hp.filter(Boolean).length : 0
  const maxStress = Number(sheetData.stressMax) || 6
  const currentStress = Array.isArray(sheetData.stress) ? sheetData.stress.filter(Boolean).length : 0
  const maxHope = Number(sheetData.hopeMax) || 6
  const currentHope = typeof sheetData.hope === 'number' ? sheetData.hope : 0
  const maxArmorBoxes = Number(sheetData.armorMax) || 6
  const currentArmorBoxes = Array.isArray(sheetData.armorBoxes) ? sheetData.armorBoxes.filter(Boolean).length : 0

  // 双阈值（标准 2 个分界值）
  const minorThreshold = sheetData.minorThreshold || 9
  const majorThreshold = sheetData.majorThreshold || 17
  const evasion = sheetData.evasion || 10
  const armorSlot = sheetData.equipment?.armorSlot
  const armorScore = armorSlot?.baseArmorMax || (sheetData as any).armorScore || 0

  // 熟练度
  const proficiency = Array.isArray(sheetData.proficiency) ? sheetData.proficiency.filter(Boolean).length : 1

  // 6 大属性
  const attributes = [
    { key: 'agility', label: '敏捷 (AGI)', value: sheetData.agility?.value || 0, isKey: sheetData.agility?.spellcasting },
    { key: 'strength', label: '力量 (STR)', value: sheetData.strength?.value || 0, isKey: sheetData.strength?.spellcasting },
    { key: 'finesse', label: '灵巧 (FIN)', value: sheetData.finesse?.value || 0, isKey: sheetData.finesse?.spellcasting },
    { key: 'instinct', label: '本能 (INS)', value: sheetData.instinct?.value || 0, isKey: sheetData.instinct?.spellcasting },
    { key: 'presence', label: '存在 (PRE)', value: sheetData.presence?.value || 0, isKey: sheetData.presence?.spellcasting },
    { key: 'knowledge', label: '知识 (KNO)', value: sheetData.knowledge?.value || 0, isKey: sheetData.knowledge?.spellcasting },
  ]

  // 经历 / 背景专长
  const experiences = sheetData.experience || []
  const experienceValues = sheetData.experienceValues || []

  // 武器与护甲
  const primaryWeapon = sheetData.equipment?.weaponSlots?.primary
  const secondaryWeapon = sheetData.equipment?.weaponSlots?.secondary
  const armor = sheetData.equipment?.armorSlot

  // 行动特性
  const professionCard = sheetData.cards?.[0]
  const subclassCard = sheetData.cards?.[1]
  const ancestry1Card = sheetData.cards?.[2]
  const ancestry2Card = sheetData.cards?.[3]
  const communityCard = sheetData.cards?.[4]

  return (
    <div className="a4-print-page flex flex-col justify-between text-[11px] leading-tight select-none">
      {/* 1. 顶部 Header (档案抬头、代号、位阶、经济) */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="bg-black text-white px-2 py-0.5 font-black text-sm tracking-widest uppercase">
              渊边行者 战术档案
            </span>
            <span className="text-base font-black tracking-wide">
              {sheetData.name || '未命名行者'}
            </span>
            <span className="text-xs font-mono font-bold text-neutral-600">
              (LV.{sheetData.level || 1} · {currentTier})
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-neutral-500 font-bold">信用点: </span>
              <strong className="text-sm font-black">{cyberpunkData.credits || 0} ₵</strong>
            </div>
            <div>
              <span className="text-neutral-500 font-bold">街头声望: </span>
              <strong className="text-sm font-black">{cyberpunkData.streetCred || 0}</strong>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-1.5 text-[10.5px] bg-neutral-100 p-1.5 rounded border border-neutral-300">
          <div>
            <span className="text-neutral-500 font-bold">职业: </span>
            <strong>{sheetData.profession || '——'}</strong>
          </div>
          <div>
            <span className="text-neutral-500 font-bold">子职业: </span>
            <strong>{sheetData.subclass || '——'}</strong>
          </div>
          <div>
            <span className="text-neutral-500 font-bold">社群/出身: </span>
            <strong>{sheetData.community || '——'}</strong>
          </div>
          <div>
            <span className="text-neutral-500 font-bold">血统/背景: </span>
            <strong>{sheetData.ancestry1 || '——'}{sheetData.ancestry2 ? ` / ${sheetData.ancestry2}` : ''}</strong>
          </div>
        </div>
      </div>

      {/* 2. 核心三列战术区域 */}
      <div className="grid grid-cols-12 gap-2.5 mb-2">
        {/* 左列：立绘 + 5 大经历 (4 列宽) */}
        <div className="col-span-4 flex flex-col gap-2">
          {/* 立绘框 */}
          <div className="h-[105px] border-2 border-black rounded relative overflow-hidden bg-neutral-50 flex items-center justify-center">
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitUrl}
                alt="角色立绘"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-neutral-400 font-mono text-[10px] text-center">
                ［ 全身战术立绘 ］
              </div>
            )}
            {/* 四角战术准星角标 */}
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-black" />
            <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-black" />
            <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-black" />
            <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-black" />
          </div>

          {/* 5 条经历 / 背景加值 */}
          <div className="border border-black rounded p-1.5 bg-neutral-50">
            <div className="font-bold text-[10px] uppercase tracking-wider border-b border-neutral-300 pb-0.5 mb-1 flex justify-between">
              <span>街头经历 (Experiences)</span>
              <span className="text-neutral-500 font-mono">检定加值</span>
            </div>
            <div className="space-y-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between text-[10px] border-b border-neutral-200 pb-0.5">
                  <span className="truncate max-w-[120px] text-neutral-700">
                    {experiences[i] || `经历 ${i + 1}：——`}
                  </span>
                  <span className="font-mono font-bold bg-neutral-200 px-1 rounded text-[9.5px]">
                    +{experienceValues[i] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中列：6 大属性 + 熟练度 + 防御指标 (4 列宽) */}
        <div className="col-span-4 flex flex-col gap-2">
          {/* 6 大属性网格 */}
          <div className="grid grid-cols-3 gap-1.5">
            {attributes.map((attr) => (
              <div
                key={attr.key}
                className={`border rounded p-1 text-center ${
                  attr.isKey ? 'border-black bg-neutral-100 font-bold' : 'border-neutral-300 bg-white'
                }`}
              >
                <div className="text-[9px] text-neutral-600 truncate">
                  {attr.label.split(' ')[0]} {attr.isKey ? '★' : ''}
                </div>
                <div className="text-sm font-black font-mono mt-0.5">
                  {Number(attr.value) >= 0 ? `+${attr.value}` : attr.value}
                </div>
              </div>
            ))}
          </div>

          {/* 熟练度 & 闪避 & 护甲 */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="border border-black rounded p-1 bg-neutral-100">
              <div className="text-[9px] text-neutral-500 font-bold">熟练度</div>
              <div className="text-xs font-black font-mono">{proficiency} 骰</div>
            </div>
            <div className="border border-black rounded p-1 bg-neutral-100">
              <div className="text-[9px] text-neutral-500 font-bold">闪避值</div>
              <div className="text-xs font-black font-mono">{evasion}</div>
            </div>
            <div className="border border-black rounded p-1 bg-neutral-100">
              <div className="text-[9px] text-neutral-500 font-bold">护甲值</div>
              <div className="text-xs font-black font-mono">+{armorScore}</div>
            </div>
          </div>

          {/* 双伤害阈值（精准 2 个分界值：轻/重分界 与 重/严重分界） */}
          <div className="border-2 border-black rounded p-1.5 bg-neutral-50 text-center">
            <div className="text-[9.5px] font-bold text-neutral-700 uppercase tracking-wider mb-0.5">
              伤害分界阈值 (Thresholds)
            </div>
            <div className="flex items-center justify-around font-mono font-black text-xs">
              <div className="text-left">
                <span className="text-[9px] font-normal text-neutral-500 block">轻/重大分界</span>
                <span className="text-sm">{minorThreshold}</span>
              </div>
              <div className="h-6 w-px bg-neutral-400" />
              <div className="text-right">
                <span className="text-[9px] font-normal text-neutral-500 block">重/严重分界</span>
                <span className="text-sm">{majorThreshold}</span>
              </div>
            </div>
            <div className="text-[8.5px] text-neutral-500 mt-1 border-t border-neutral-200 pt-0.5">
              &lt;{minorThreshold} 扣1HP | ≥{minorThreshold} 扣2HP | ≥{majorThreshold} 扣3HP
            </div>
          </div>

          {/* 护甲槽 Armor Boxes */}
          <div className="border border-neutral-400 rounded p-1 bg-white">
            <div className="flex justify-between items-center text-[9px] font-bold text-neutral-600 mb-0.5">
              <span>护甲消耗槽 (Armor)</span>
              <span>{currentArmorBoxes} / {maxArmorBoxes}</span>
            </div>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: maxArmorBoxes }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 border border-black rounded-sm ${
                    i < currentArmorBoxes ? 'bg-black' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 右列：生命/压力/希望 + 消耗品 + 插槽矩阵 (4 列宽) */}
        <div className="col-span-4 flex flex-col gap-2">
          {/* 生命轨 (HP) */}
          <div className="border border-black rounded p-1 bg-white">
            <div className="flex justify-between items-center text-[9.5px] font-bold mb-0.5">
              <span>生命值 (HP)</span>
              <span className="font-mono">{currentHP} / {maxHP}</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: maxHP }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 border border-black rounded-full ${
                    i < currentHP ? 'bg-black' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 压力轨 (Stress) */}
          <div className="border border-black rounded p-1 bg-white">
            <div className="flex justify-between items-center text-[9.5px] font-bold mb-0.5">
              <span>压力点 (Stress)</span>
              <span className="font-mono">{currentStress} / {maxStress}</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: maxStress }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 border border-black rounded-sm ${
                    i < currentStress ? 'bg-black' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 希望轨 (Hope) */}
          <div className="border border-black rounded p-1 bg-white">
            <div className="flex justify-between items-center text-[9.5px] font-bold mb-0.5">
              <span>希望点 (Hope)</span>
              <span className="font-mono">{currentHope} / {maxHope}</span>
            </div>
            <div className="flex gap-1 flex-wrap justify-center">
              {Array.from({ length: maxHope }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 border border-black rotate-45 m-0.5 ${
                    i < currentHope ? 'bg-black' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 战术消耗品储备 */}
          <div className="border border-neutral-300 rounded p-1 bg-neutral-50 text-[9px]">
            <div className="font-bold text-neutral-700 border-b border-neutral-200 pb-0.5 mb-1 flex justify-between">
              <span>战术消耗品 (Consumables)</span>
              <span className="text-[8px] text-neutral-400 font-mono">储备数量</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center font-mono">
              {Array.isArray(cyberpunkData.consumables) && cyberpunkData.consumables.length > 0 ? (
                cyberpunkData.consumables.slice(0, 3).map((item, idx) => (
                  <div key={item.id || idx} className="bg-white border rounded p-0.5">
                    <span className="text-neutral-500 block text-[8px] truncate">{item.name}</span>
                    <strong className="text-[10px]">{item.quantity ?? 1}</strong>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white border rounded p-0.5">
                    <span className="text-neutral-500 block text-[8px]">医疗针</span>
                    <strong>0</strong>
                  </div>
                  <div className="bg-white border rounded p-0.5">
                    <span className="text-neutral-500 block text-[8px]">强化剂</span>
                    <strong>0</strong>
                  </div>
                  <div className="bg-white border rounded p-0.5">
                    <span className="text-neutral-500 block text-[8px]">弹药箱</span>
                    <strong>0</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 8 大部位插槽负荷矩阵 */}
          <div className="border border-neutral-300 rounded p-1 bg-neutral-50 text-[9px]">
            <div className="flex justify-between font-bold text-neutral-700 border-b border-neutral-200 pb-0.5 mb-0.5">
              <span>身体部位插槽矩阵</span>
              <span className="font-mono">已装/上限</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[8.5px] font-mono">
              <div className="flex justify-between"><span>头部:</span><strong>{headCount}/{headMax}</strong></div>
              <div className="flex justify-between"><span>躯干:</span><strong>{torsoCount}/{torsoMax}</strong></div>
              <div className="flex justify-between"><span>上肢:</span><strong>{armsCount}/{armsMax}</strong></div>
              <div className="flex justify-between"><span>下肢:</span><strong>{legsCount}/{legsMax}</strong></div>
              <div className="flex justify-between"><span>外置:</span><strong>{externalCount}/{externalMax}</strong></div>
              <div className="flex justify-between text-black"><span>主/副武:</span><strong>已装配</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 中部：已装配核心军备与防具战术简目表 */}
      <div className="border border-black rounded p-2 mb-2 bg-white">
        <div className="font-bold text-[10.5px] uppercase tracking-wider border-b border-black pb-1 mb-1.5 flex justify-between items-center">
          <span>核心装配军备 (Equipped Arsenal)</span>
          <span className="text-[9px] font-normal text-neutral-500">※ 完整规则卡牌见第二页</span>
        </div>
        <table className="w-full text-left text-[9.5px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-300 text-neutral-500">
              <th className="py-0.5 font-bold w-1/4">栏位与装备名称</th>
              <th className="py-0.5 font-bold w-1/6">战术参数</th>
              <th className="py-0.5 font-bold w-1/6">属性与类型</th>
              <th className="py-0.5 font-bold">核心特性与规则效果</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            <tr>
              <td className="py-1 font-bold">
                主武器: {primaryWeapon?.name || '（未装配）'}
              </td>
              <td className="py-1 font-mono font-bold">
                {primaryWeapon?.damage ? `${proficiency}×(${primaryWeapon.damage})` : '——'}
              </td>
              <td className="py-1 text-neutral-600">
                {primaryWeapon?.trait || '通用'}
              </td>
              <td className="py-1 text-neutral-800">
                {primaryWeapon?.feature || '——'}
              </td>
            </tr>
            <tr>
              <td className="py-1 font-bold">
                副武器: {secondaryWeapon?.name || '（未装配）'}
              </td>
              <td className="py-1 font-mono font-bold">
                {secondaryWeapon?.damage ? `${proficiency}×(${secondaryWeapon.damage})` : '——'}
              </td>
              <td className="py-1 text-neutral-600">
                {secondaryWeapon?.trait || '通用'}
              </td>
              <td className="py-1 text-neutral-800">
                {secondaryWeapon?.feature || '——'}
              </td>
            </tr>
            <tr>
              <td className="py-1 font-bold">
                战术护甲: {armorSlot?.name || '（未装配）'}
              </td>
              <td className="py-1 font-mono font-bold">
                护甲+{armorSlot?.baseArmorMax || 0}
              </td>
              <td className="py-1 text-neutral-600">
                阈值: +{armorSlot?.baseThresholds?.minor || 0}/+{armorSlot?.baseThresholds?.major || 0}
              </td>
              <td className="py-1 text-neutral-800">
                {armorSlot?.feature || '——'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. 下部：核心行动特性与非法改装全文 */}
      <div className="border border-black rounded p-2 mb-2 bg-neutral-50 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="font-bold text-[10.5px] uppercase tracking-wider border-b border-neutral-300 pb-0.5 mb-1.5 flex justify-between">
          <span>行动特性与改装专长 (Features & Modifications)</span>
          {Boolean((cyberpunkData.illegalMods as any)?.enabled || (Array.isArray(cyberpunkData.illegalMods) && cyberpunkData.illegalMods[0]?.enabled)) && (
            <span className="text-red-600 font-bold text-[9.5px]">
              ⚠️ 已激活非法改装
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-[9.5px] leading-snug">
          <div>
            <div className="font-bold text-neutral-900 mb-0.5">
              职业特性: {professionCard?.name || sheetData.profession || '——'}
            </div>
            <div className="text-neutral-700">
              {professionCard?.description ? (
                <CardMarkdown>{professionCard.description}</CardMarkdown>
              ) : '基础战斗训练与战术行动专长。'}
            </div>

            {subclassCard && (
              <div className="mt-1.5">
                <div className="font-bold text-neutral-900 mb-0.5">
                  子职业特权: {subclassCard.name}
                </div>
                <div className="text-neutral-700">
                  <CardMarkdown>{subclassCard.description || ''}</CardMarkdown>
                </div>
              </div>
            )}
          </div>

          <div>
            {Boolean((cyberpunkData.illegalMods as any)?.enabled || (Array.isArray(cyberpunkData.illegalMods) && cyberpunkData.illegalMods[0]?.enabled)) ? (
              <div className="border-l-2 border-red-500 pl-1.5 bg-red-50/50 p-1 rounded">
                <div className="font-bold text-red-700">
                  非法改装: {(cyberpunkData.illegalMods as any)?.name || (Array.isArray(cyberpunkData.illegalMods) && cyberpunkData.illegalMods[0]?.name) || '军规神经超频'}
                </div>
                <div className="text-neutral-800 mt-0.5">
                  <CardMarkdown>{(cyberpunkData.illegalMods as any)?.bonus || (Array.isArray(cyberpunkData.illegalMods) && cyberpunkData.illegalMods[0]?.bonus) || '解锁额外义体槽位或极限作战超频。'}</CardMarkdown>
                </div>
                {((cyberpunkData.illegalMods as any)?.downside || (Array.isArray(cyberpunkData.illegalMods) && cyberpunkData.illegalMods[0]?.downside)) && (
                  <div className="text-red-600 italic text-[8.5px] mt-0.5">
                    风险/反噬: {(cyberpunkData.illegalMods as any)?.downside || (Array.isArray(cyberpunkData.illegalMods) && cyberpunkData.illegalMods[0]?.downside)}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="font-bold text-neutral-900 mb-0.5">
                  出身与社群特性: {communityCard?.name || sheetData.community || '——'}
                </div>
                <div className="text-neutral-700">
                  <CardMarkdown>{communityCard?.description || '独特的街头人脉与生存本能。'}</CardMarkdown>
                </div>
              </div>
            )}

            {ancestry1Card && (
              <div className="mt-1.5">
                <div className="font-bold text-neutral-900 mb-0.5">
                  血统专长: {ancestry1Card.name}
                </div>
                <div className="text-neutral-700">
                  <CardMarkdown>{ancestry1Card.description || ''}</CardMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. 底栏微缩速查 (战术休整维护 + 双骰判定与濒死抉择) */}
      <div className="border-t-2 border-black pt-1 flex items-center justify-between text-[8px] text-neutral-600 font-mono">
        <div>
          <strong>☕ 短休维护:</strong> 3项行动(清压力/修护甲/回1d4HP/换领域卡) | <strong>🛌 长休:</strong> 全状态复原
        </div>
        <div>
          <strong>🎲 双骰判定:</strong> 希望&gt;恐惧 得1希望 | 恐惧&gt;希望 GM得1恐惧 | <strong>💀 0HP濒死:</strong> 孤注一掷 / 避免死亡 / 英雄牺牲
        </div>
      </div>
    </div>
  )
}
