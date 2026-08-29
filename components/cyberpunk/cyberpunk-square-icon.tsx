"use client"

import React from 'react'

interface CyberpunkSquareIconProps {
  name: string
  icon?: string | null
  image?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'weapon' | 'armor' | 'cyberware' | 'external' | 'default'
  className?: string
}

// 智能清洗提取最多 4 个字符（优先提取汉字或英文字符）
export function extractFourChars(name: string): string[] {
  if (!name) return ['未', '知']
  
  // 去除括号及其中内容
  const clean = name.replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】/g, '').trim()
  // 提取汉字、英文字母或数字
  const matches = clean.match(/[\u4e00-\u9fa5a-zA-Z0-9]/g)
  if (!matches || matches.length === 0) {
    return [clean.slice(0, 2) || '义体']
  }

  // 取前 1~4 个字符
  return matches.slice(0, 4)
}

export function CyberpunkSquareIcon({
  name,
  icon,
  image,
  size = 'md',
  theme = 'cyberware',
  className = '',
}: CyberpunkSquareIconProps) {
  const imgSrc = icon || image
  const chars = extractFourChars(name)

  const sizeClasses = {
    sm: 'w-9 h-9 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-16 h-16 text-base',
  }[size]

  const themeClasses = {
    weapon: {
      border: 'border-[#F5F500]/60 hover:border-[#F5F500]',
      bg: 'bg-[#120e02]',
      text: 'text-[#F5F500]',
      shadow: 'shadow-[0_0_10px_rgba(245,245,0,0.2)]',
    },
    armor: {
      border: 'border-[#00FFA3]/60 hover:border-[#00FFA3]',
      bg: 'bg-[#01140e]',
      text: 'text-[#00FFA3]',
      shadow: 'shadow-[0_0_10px_rgba(0,255,163,0.2)]',
    },
    cyberware: {
      border: 'border-[#6C00FF]/60 hover:border-[#00FFA3]',
      bg: 'bg-[#0d041e]',
      text: 'text-[#00FFA3]',
      shadow: 'shadow-[0_0_10px_rgba(108,0,255,0.25)]',
    },
    external: {
      border: 'border-[#FF007F]/60 hover:border-[#FF007F]',
      bg: 'bg-[#18020e]',
      text: 'text-[#FF007F]',
      shadow: 'shadow-[0_0_10px_rgba(255,0,127,0.2)]',
    },
    default: {
      border: 'border-slate-600',
      bg: 'bg-[#0B0320]',
      text: 'text-slate-200',
      shadow: 'shadow-none',
    },
  }[theme]

  if (imgSrc) {
    return (
      <div
        className={`relative shrink-0 rounded-lg border-2 overflow-hidden flex items-center justify-center transition-all ${sizeClasses} ${themeClasses.border} ${themeClasses.bg} ${themeClasses.shadow} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>
    )
  }

  // 汉字印章渲染：按字数自适应排版
  const renderStampText = () => {
    if (chars.length === 1) {
      return <span className="font-black text-lg leading-none tracking-tighter">{chars[0]}</span>
    }
    if (chars.length === 2) {
      return (
        <div className="flex flex-col items-center justify-center leading-none font-black tracking-tight scale-95">
          <span>{chars[0]}</span>
          <span className="mt-0.5">{chars[1]}</span>
        </div>
      )
    }
    if (chars.length === 3) {
      return (
        <div className="flex flex-col items-center justify-center leading-none font-black scale-90">
          <div className="flex gap-0.5">
            <span>{chars[0]}</span>
            <span>{chars[1]}</span>
          </div>
          <span className="mt-0.5">{chars[2]}</span>
        </div>
      )
    }
    // 4 字: 2x2 网格印章
    return (
      <div className="grid grid-cols-2 gap-0.5 leading-none font-black text-center scale-90">
        <span>{chars[0]}</span>
        <span>{chars[1]}</span>
        <span>{chars[2]}</span>
        <span>{chars[3]}</span>
      </div>
    )
  }

  return (
    <div
      className={`relative shrink-0 rounded-lg border-2 flex items-center justify-center transition-all select-none p-1 font-mono ${sizeClasses} ${themeClasses.border} ${themeClasses.bg} ${themeClasses.text} ${themeClasses.shadow} ${className}`}
    >
      {/* 赛博网格微光背景纹理 */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />
      <div className="relative z-10">{renderStampText()}</div>
    </div>
  )
}
