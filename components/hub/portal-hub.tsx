"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  Layers, 
  BookOpen, 
  Database, 
  ExternalLink, 
  Cpu, 
  ShieldCheck, 
  Dices,
  FileText,
  ArrowRight,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Share2,
  Zap,
  Globe,
  Compass,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react'

// --- Hero 海报数据（纯中文） ---
interface ToolShowcase {
  id: string
  name: string
  tag: string
  title: string
  slogan: string
  desc: string
  ctaText: string
  ctaLink: string
  badgeText: string
  themeColor: string
  glowClass: string
  btnColor: string
  imageSrc: string
  imageFitContain?: boolean
  badge: string
  authorCredit: string
  borderColor: string
  glowShadow: string
  tagBg: string
}

const SHOWCASE_LIST: ToolShowcase[] = [
  {
    id: 'cyberpunk',
    name: '爽博车卡',
    tag: '扩展规则',
    title: '爽博朋克车卡器',
    slogan: '5大区义体装配 · 压力与超载·非法改造',
    desc: '《爽博朋克：渊边行者》规则支持。义体插槽装配、战利品跨界直装、消耗品堆叠记录与 A4 线框打印。',
    ctaText: '进入车卡器',
    ctaLink: '/cyberpunk',
    badgeText: '爽博朋克扩展',
    themeColor: 'cyan',
    glowClass: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-stone-950 hover:shadow-[0_8px_24px_rgba(6,182,212,0.35)]',
    imageSrc: './images/shuangbopunk-cover.jpg',
    badge: '《爽博朋克》原画封面',
    authorCredit: '视觉渲染：狂炫巨大汉堡',
    borderColor: 'border-cyan-500/40 hover:border-cyan-400',
    glowShadow: 'shadow-[0_15px_45px_rgba(6,182,212,0.25)] hover:shadow-[0_20px_55px_rgba(6,182,212,0.35)]',
    tagBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  },
  {
    id: 'workshop',
    name: '卡牌工坊',
    tag: '制卡工具',
    title: '匕首心卡牌工坊',
    slogan: '33 款卡牌模版 · 官方 d60 灵感抽取 · 图片隐写导出',
    desc: '全品类制卡平台。支持武器、敌人、险境与料理，数据可隐写嵌入 PNG 图片，一键导出 FVTT 与标准卡包。',
    ctaText: '打开工坊',
    ctaLink: '/workshop',
    badgeText: '全功能制卡',
    themeColor: 'amber',
    glowClass: 'from-amber-500/20 via-orange-500/10 to-transparent',
    btnColor: 'bg-amber-500 hover:bg-amber-400 text-stone-950 hover:shadow-[0_8px_24px_rgba(245,158,11,0.35)]',
    imageSrc: './images/showcase-workshop.png',
    badge: '战利品卡牌 · 寂静银戒',
    authorCredit: '制作者：基德 · 万国图书馆',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    glowShadow: 'shadow-[0_15px_45px_rgba(245,158,11,0.25)] hover:shadow-[0_20px_55px_rgba(245,158,11,0.35)]',
    tagBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    id: 'campaign',
    name: '战役编辑',
    tag: '模组架构',
    title: '战役文档编辑器',
    slogan: '大纲目录树 · 遭遇战斗板 · 险境倒计时 · 官方协议助手',
    desc: '模组创作与排版工具。支持公共库一键引入遭遇与险境，内置朗读框与表格，支持导出 Markdown 与单页 HTML。',
    ctaText: '编写模组',
    ctaLink: '/campaign',
    badgeText: '模组排版',
    themeColor: 'emerald',
    glowClass: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)]',
    imageSrc: './images/showcase-campaign.png',
    badge: '模组创作者 · 写稿中',
    authorCredit: '不咕鸟战役写作工坊',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    glowShadow: 'shadow-[0_15px_45px_rgba(16,185,129,0.25)] hover:shadow-[0_20px_55px_rgba(16,185,129,0.35)]',
    tagBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  {
    id: 'vault',
    name: '公共卡库',
    tag: '数据中枢',
    title: '公共卡牌库 (Vault)',
    slogan: '120 官方种子物品 · 本地储存 · 跨功能双向连携',
    desc: '本地数据中枢。内置 60 战利品与 60 消耗品，打通工坊制作、角色卡直装与战役引用，支持打包导出卡包。',
    ctaText: '浏览卡牌库',
    ctaLink: '/vault',
    badgeText: '双向连携',
    themeColor: 'indigo',
    glowClass: 'from-indigo-500/20 via-violet-500/10 to-transparent',
    btnColor: 'bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-[0_8px_24px_rgba(99,102,241,0.35)]',
    imageSrc: './images/showcase-vault.jpg',
    badge: '万国藏书阁 · 资料中枢',
    authorCredit: '全生态数据储存',
    borderColor: 'border-indigo-500/40 hover:border-indigo-400',
    glowShadow: 'shadow-[0_15px_45px_rgba(99,102,241,0.25)] hover:shadow-[0_20px_55px_rgba(99,102,241,0.35)]',
    tagBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
  },
  {
    id: 'standard',
    name: '标准车卡',
    tag: '核心规则',
    title: '匕首心核心车卡器',
    slogan: '官方核心规则 · 9大职业与子职 · 领域卡组装配',
    desc: 'Daggerheart 原版车卡工具。支持全部职业、社群与领域卡实时装配升级，支持海豹骰导出与本地多存档。',
    ctaText: '开始车卡',
    ctaLink: '/character/standard',
    badgeText: '官方核心',
    themeColor: 'rose',
    glowClass: 'from-rose-500/20 via-pink-500/10 to-transparent',
    btnColor: 'bg-rose-500 hover:bg-rose-400 text-white hover:shadow-[0_8px_24px_rgba(244,63,94,0.35)]',
    imageSrc: './images/showcase-standard.png',
    imageFitContain: true,
    badge: 'Daggerheart 官方核心',
    authorCredit: '经典规则装配',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    glowShadow: 'shadow-[0_15px_45px_rgba(244,63,94,0.25)] hover:shadow-[0_20px_55px_rgba(244,63,94,0.35)]',
    tagBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  }
]

export function PortalHub() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const activeTool = SHOWCASE_LIST[activeIdx]

  useEffect(() => {
    if (!isAutoPlay) return
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SHOWCASE_LIST.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [isAutoPlay])

  const scrollToWorkflow = () => {
    const el = document.getElementById('workflow-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0f17] text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 relative overflow-x-hidden">
      
      {/* 沉浸式暗纹与环境星云微光 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/15 via-rose-600/10 to-transparent rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* ================= 顶端双层级导航栏 ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#0d0f17]/90 shadow-2xl">
        
        {/* 第 1 层：品牌标识与外链栏 */}
        <div className="border-b border-white/5 bg-black/25">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-stone-950 text-xs shadow-sm">
                DH
              </div>
              <span className="font-bold tracking-wider text-stone-200">
                匕首心 & 爽博朋克
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                离线工具箱
              </span>
            </div>

            <div className="flex items-center gap-4 text-stone-400">
              <span className="hidden md:inline text-[11px]">创作交流群：<strong className="text-amber-300 font-mono">261751459</strong></span>
              <a
                href="https://github.com/jeffdyuyi/DH-IN-ONE"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors hover:underline active:scale-[0.98]"
              >
                <span>GitHub 开源仓库</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* 第 2 层：更加宽松大气的工具目录栏 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 flex-nowrap shrink-0">
            
            <button
              onClick={() => setActiveIdx(0)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] active:scale-[0.98] cursor-pointer ${
                activeIdx === 0
                  ? 'bg-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800 hover:-translate-y-0.5'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>爽博车卡</span>
            </button>

            <button
              onClick={() => setActiveIdx(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] active:scale-[0.98] cursor-pointer ${
                activeIdx === 1
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800 hover:-translate-y-0.5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>卡牌工坊</span>
            </button>

            <button
              onClick={() => setActiveIdx(2)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] active:scale-[0.98] cursor-pointer ${
                activeIdx === 2
                  ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800 hover:-translate-y-0.5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>战役编辑</span>
            </button>

            <button
              onClick={() => setActiveIdx(3)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] active:scale-[0.98] cursor-pointer ${
                activeIdx === 3
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800 hover:-translate-y-0.5'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>公共卡库</span>
            </button>

            <button
              onClick={() => setActiveIdx(4)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] active:scale-[0.98] cursor-pointer ${
                activeIdx === 4
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800 hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>标准车卡</span>
            </button>

          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-stone-400 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>本地存储 · 离线可用</span>
          </div>
        </div>
      </header>

      {/* ================= 核心内容主区域 ================= */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* 1. 海报滑动核心展区：左侧统一尺寸海报展示，右侧文本框说明 */}
        <section 
          className="relative rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900/95 via-stone-950/95 to-[#0d0f17] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden backdrop-blur-xl transition-all"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {/* 背景光斑与渐变遮罩 */}
          <div className={`absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-25 transition-all duration-700 bg-gradient-to-br ${activeTool.glowClass}`} />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0d0f17]/40 to-[#0d0f17]/80 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* 左侧：统一版面大小的封面海报卡片 (5列，固定 max-w-[280px] sm:max-w-[320px]) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className={`w-full max-w-[280px] sm:max-w-[320px] rounded-2xl border ${activeTool.borderColor} bg-[#161822] ${activeTool.glowShadow} overflow-hidden relative group transition-all duration-500`}>
                
                {/* 统一宽高比图片容器 (aspect-[2/3] max-h-[400px]) */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-stone-950 max-h-[400px] flex items-center justify-center">
                  <img 
                    src={activeTool.imageSrc} 
                    alt={activeTool.title}
                    className={`w-full h-full ${activeTool.imageFitContain ? 'object-contain p-6' : 'object-cover'} group-hover:scale-105 transition-transform duration-700`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-40 pointer-events-none" />
                </div>

                {/* 底部统一精炼标注栏 */}
                <div className="px-3.5 py-2.5 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${activeTool.tagBg}`}>
                    {activeTool.badge}
                  </span>
                  <span className="text-[11px] font-mono text-stone-300 font-semibold bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800">
                    {activeTool.authorCredit}
                  </span>
                </div>

              </div>
            </div>

            {/* 右侧：文本框文字说明与快速操作区 (7列) */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-stone-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeTool.badgeText}</span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                  {activeTool.title}
                </h2>
                <p className="text-base sm:text-lg font-medium text-amber-400 mt-2">
                  {activeTool.slogan}
                </p>
              </div>

              {/* 增强对比度遮罩文本框 */}
              <div className="p-4.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-stone-300 text-sm leading-relaxed font-light backdrop-blur-md shadow-inner">
                {activeTool.desc}
              </div>

              {/* 行动按钮群 */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link
                  href={activeTool.ctaLink}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] min-h-[44px] cursor-pointer ${activeTool.btnColor}`}
                >
                  <span>{activeTool.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>支持一键导入/导出与跨应用同步</span>
                </div>
              </div>

              {/* 底部滑动指示与翻页控件 */}
              <div className="pt-5 border-t border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {SHOWCASE_LIST.map((tool, idx) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveIdx(idx)}
                      className={`h-2.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                        activeIdx === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-stone-700 hover:bg-stone-500'
                      }`}
                      title={tool.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveIdx((prev) => (prev - 1 + SHOWCASE_LIST.length) % SHOWCASE_LIST.length)}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    title="上一个功能"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveIdx((prev) => (prev + 1) % SHOWCASE_LIST.length)}
                    className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                    title="下一个功能"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* 首屏向下滚动引导提示 */}
          <div className="mt-6 pt-3 flex justify-center">
            <button
              onClick={scrollToWorkflow}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-400 transition-colors animate-bounce cursor-pointer"
              title="向下探索全生态双向连携流程"
            >
              <span>向下探索数据互通流程</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* 2. 官方与自制双向连携链路展示 */}
        <section id="workflow-section" className="p-6 sm:p-8 rounded-3xl border border-stone-800 bg-stone-900/40 backdrop-blur-md space-y-5">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>数据互通流程</span>
            </h3>
            <p className="text-xs text-stone-400">
              通过本地卡牌库（Vault）实现自制与官方数据的无缝流通
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1.5 hover:border-amber-500/40 transition-colors group">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
                <span>1. 工坊制卡</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                制作装备、敌人与险境，保存时自动持久化同步至本地卡牌库。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1.5 hover:border-cyan-500/40 transition-colors group">
              <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
                <span>2. 角色直装</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                车卡时直接在插槽中挑选库内卡牌与官方战利品，一键装配。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1.5 hover:border-emerald-500/40 transition-colors group">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
                <span>3. 战役引用</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                战役编辑器一键将库内敌人或险境转为章节结构块。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-1.5 hover:border-indigo-500/40 transition-colors group">
              <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform" />
                <span>4. 自由导出</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                支持导出 Markdown 表格、FVTT 格式、海豹骰与卡包。
              </p>
            </div>

          </div>
        </section>

        {/* 3. 辅助指南与协议文档区 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>跑团指南与扩展支持</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Link
              href="/seal-dice-guide"
              className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-cyan-500/40 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-stone-200 group-hover:text-cyan-300 transition-colors">海豹骰格式指南</h4>
                <p className="text-[11px] text-stone-400">QQ 骰娘指令与角色属性接入说明</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>

            <Link
              href="/card-pack-guide"
              className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-stone-200 group-hover:text-emerald-300 transition-colors">自定义卡包指南</h4>
                <p className="text-[11px] text-stone-400">JSON 结构规范与 AI 生成提示词</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>

            <Link
              href="/about"
              className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-purple-500/40 transition-all flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-stone-200 group-hover:text-purple-300 transition-colors">更新日志与致谢</h4>
                <p className="text-[11px] text-stone-400">版本历史与原版开源贡献团队</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        </section>

        {/* 4. 创作者社区、联系方式与开源致谢 Footer */}
        <section className="pt-6 border-t border-stone-800 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 左侧：不咕鸟（哈基米德）创作者联系与社群 */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-stone-900/70 border border-amber-500/20 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-stone-950 text-sm">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">爽博朋克战役框架作者：不咕鸟（哈基米德）</h4>
                  <p className="text-[11px] text-stone-400">欢迎直接联系或者加群讨论模组、规则与建议</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300">
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-500 block">微信 / 联系电话</span>
                  <span className="font-mono font-bold text-cyan-400 text-xs">13308009593</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-500 block">作者 QQ</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">442348584</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-500 block">不咕鸟创作交流群</span>
                  <span className="font-mono font-bold text-stone-100 text-xs">261751459</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-500 block">成都秘密基地TRPG群</span>
                  <span className="font-mono font-bold text-stone-100 text-xs">691707475</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="https://ifdian.net/a/nogubird"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all active:scale-95"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>为作者加油（爱发电）</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <a
                  href="http://nogubird.top"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-all active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>俱乐部官网 (nogubird.top)</span>
                </a>
              </div>
            </div>

            {/* 右侧：开源致敬团队与协议 */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-stone-900/40 border border-stone-800 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">开源致谢：原版车卡器贡献团队</h4>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed font-light">
                  车卡器核心基于 <a href="https://github.com/RidRisR/DaggerHeart-CharacterSheet" target="_blank" rel="noreferrer" className="text-amber-400 underline underline-offset-2 hover:text-white font-semibold">DHSheet 开源项目</a> 衍生重构。感谢原团队的开拓与翻译贡献：
                </p>

                <div className="grid grid-cols-3 gap-2 text-xs text-stone-300">
                  <div className="p-2 rounded-lg bg-stone-950/40 border border-stone-800/80">
                    <span className="text-[10px] text-stone-500 block">发起与开发</span>
                    <a href="https://github.com/RidRisR" target="_blank" rel="noreferrer" className="text-amber-400 font-bold hover:underline">RidRisR</a>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/40 border border-stone-800/80">
                    <span className="text-[10px] text-stone-500 block">翻译/校对</span>
                    <span className="font-medium text-stone-300">PolearmMaster</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/40 border border-stone-800/80">
                    <span className="text-[10px] text-stone-500 block">翻译/校对</span>
                    <span className="font-medium text-stone-300">末楔</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/40 border border-stone-800/80">
                    <span className="text-[10px] text-stone-500 block">翻译/校对</span>
                    <span className="font-medium text-stone-300">里予</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/40 border border-stone-800/80">
                    <span className="text-[10px] text-stone-500 block">翻译/校对</span>
                    <span className="font-medium text-stone-300">一得</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-950/40 border border-stone-800/80">
                    <span className="text-[10px] text-stone-500 block">原作主页</span>
                    <a href="https://dhsheet.site/" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">dhsheet.site</a>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800/80 text-[10px] text-stone-500">
                Daggerheart 系统参考文档（SRD）版权归 Critical Role Productions, LLC. 与 Darrington Press 所有。遵循 GPL-3.0 与 DPCGL 许可。
              </div>
            </div>

          </div>

          <div className="pt-5 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-light">
            <p>© 2026 匕首心 & 爽博朋克 · 纯客户端离线运行 · 免费开源</p>
            <div className="flex items-center gap-4">
              <Link href="/about" className="hover:text-stone-300 transition-colors">关于项目</Link>
              <Link href="/seal-dice-guide" className="hover:text-stone-300 transition-colors">海豹骰指南</Link>
              <Link href="/card-pack-guide" className="hover:text-stone-300 transition-colors">卡包规范</Link>
              <a href="https://github.com/jeffdyuyi/DH-IN-ONE" target="_blank" rel="noreferrer" className="hover:text-stone-300 transition-colors">GitHub</a>
            </div>
          </div>

        </section>

      </main>

    </div>
  )
}
