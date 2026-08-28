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
  Terminal,
  Zap,
  Globe,
  Compass,
  ArrowUpRight,
  Flame,
  FileCode,
  Users
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
  poster: {
    category: string
    cardTitle: string
    cardSubtitle: string
    stats?: { label: string; val: string }[]
    tags: string[]
    flavor: string
    mechanics: string
    footerInfo: string
  }
}

const SHOWCASE_LIST: ToolShowcase[] = [
  {
    id: 'cyberpunk',
    name: '爽博朋克车卡器',
    tag: '赛博特化',
    title: '《爽博朋克：渊边行者》专属赛博车卡器',
    slogan: '身体 5 大区义体装配 · 神经压力超载判定 · 黑市非法改造',
    desc: '深度定制的赛博朋克规则车卡器。支持头部、躯干、上肢、下肢等插槽义体装配，跨画风战利品直接编译安装，同名消耗品自动堆叠记录，以及 A4 极简浅色 0 墨水线框打印。',
    ctaText: '开启赛博车卡',
    ctaLink: '/cyberpunk',
    badgeText: '推荐 · 爽博朋克特化',
    themeColor: 'cyan',
    poster: {
      category: '赛博义体 · 植入件',
      cardTitle: '「超光子」神经超频突触',
      cardSubtitle: 'NEURAL OVERCLOCK SYNAPSE · T3',
      stats: [
        { label: '部位', val: '头部 (Head)' },
        { label: '槽位', val: '1 槽' },
        { label: '压力消耗', val: '+2 神经压力' },
        { label: '手术费用', val: '8000 信用点' }
      ],
      tags: ['【黑市改造】', '【超频输出】', '【故障隐患】'],
      flavor: '“当你能在千分之一秒内思考三次，整个世界的子弹都慢得像蜗牛。” —— 义体黑医 老K',
      mechanics: '消耗 2 点神经压力开启突触超频，本轮灵巧检定掷骰结果额外增加 +1d8，若掷出 1 则承受 1 点严重伤害。',
      footerInfo: '已适配 A4 极简浅色线框打印与海豹骰数据导出'
    }
  },
  {
    id: 'workshop',
    name: '匕首心卡牌工坊',
    tag: '33+模板',
    title: '匕首心卡牌工坊 V3',
    slogan: '33 种卡牌模板 · 官方 d60 灵感抽取 · 图片隐写导出',
    desc: '全功能成熟的卡牌排版设计平台。涵盖武器、防具、敌人、环境险境、料理、赛博义体等全部卡牌类型，支持将工程数据无损隐写嵌入高清 PNG 图片，一键生成 FVTT 虚拟桌面与 CC 卡包。',
    ctaText: '开启卡牌工坊',
    ctaLink: '/workshop',
    badgeText: '成熟 · 隐写术导出',
    themeColor: 'amber',
    poster: {
      category: '战斗敌人卡 · 精英遭遇',
      cardTitle: '荒原裂隙漫游者',
      cardSubtitle: 'VOID RIFT WANDERER · T2',
      stats: [
        { label: '难度(DC)', val: '14' },
        { label: '生命(HP)', val: '12' },
        { label: '压力(Stress)', val: '5' },
        { label: '伤害阈值', val: '轻 6 / 重 12' }
      ],
      tags: ['【近战物理】', '【暗影裂隙】', '【精英敌人】'],
      flavor: '它穿梭于破碎的现实边缘，每一次呼吸都会引起周围空间的轻微坍塌。',
      mechanics: '动作：裂隙突袭（近距 / 伤害 2d8+3）。被动：当漫游者受到物理伤害时，可消耗 1 点压力向任意方向瞬间传送 30 尺。',
      footerInfo: '支持导出 FVTT 格式与 PNG 隐写数据卡'
    }
  },
  {
    id: 'campaign',
    name: '战役文档编辑器',
    tag: '大纲模组',
    title: '匕首心战役文档编辑器',
    slogan: '多级大纲目录树 · 遭遇战斗板 · 环境险境 · 官方协议合规',
    desc: '专为主持人（DM）与跑团创作者设计的战役模组排版工具。支持直接从公共库引入敌人、险境与装备，内置朗读框、属性检定表、数据表格、官方合规协议助手，并支持完美导出为标准 Markdown 与单页 HTML。',
    ctaText: '进入战役写作',
    ctaLink: '/campaign',
    badgeText: '全功能 · DPCGL合规',
    themeColor: 'emerald',
    poster: {
      category: '战役模组章节 · 第 2 章',
      cardTitle: '地下管道的伏击与抉择',
      cardSubtitle: 'ACT II: THE UNDERGROUND AMBUSH',
      stats: [
        { label: '环境险境', val: '废弃沉淀池 (DC 13)' },
        { label: '遭遇敌人', val: '生化拾荒者 × 4' },
        { label: '倒计时', val: '4 轮毒气蔓延' },
        { label: '奖励战利品', val: 'd60 随机抽取 × 2' }
      ],
      tags: ['【朗读框】', '【判定分支】', '【数据表格】'],
      flavor: '潮湿的水汽混合着刺鼻的机油味，锈蚀的铁栅栏后隐约传来某种金属碰撞的声音。',
      mechanics: '朗读框：请向玩家描述四周的警报红光。若调查检定成功（DC 12），发现隐藏的安全气阀，关闭可解除倒计时机制。',
      footerInfo: '已完美支持表格与块语法导出为 GitHub Markdown'
    }
  },
  {
    id: 'vault',
    name: '公共本地卡牌库',
    tag: '中枢连携',
    title: '公共本地卡牌库 (Vault)',
    slogan: 'IndexedDB 本地中枢 · 120 官方种子 · 跨应用双向连携',
    desc: '四合一系统的全生态数据持久化中枢。内置 60 官方战利品与 60 消耗品种子，打通「工坊制作 ➔ 角色卡直装 ➔ 战役模组引用」的全链路闭环，数据 100% 留存在浏览器，安全且完全支持断网离线。',
    ctaText: '管理公共卡牌库',
    ctaLink: '/vault',
    badgeText: '双向连携 · 全离线',
    themeColor: 'indigo',
    poster: {
      category: '官方预装种子库 · d60 战利品',
      cardTitle: '回音共鸣水晶',
      cardSubtitle: 'ECHO RESONANCE CRYSTAL · 遗宝 #24',
      stats: [
        { label: '分类', val: '官方战利品' },
        { label: '编号', val: 'd60 #24' },
        { label: '属性加成', val: '本能 +1' },
        { label: '跨界编译', val: '可转为躯干义体' }
      ],
      tags: ['【官方种子】', '【角色卡直装】', '【战役直插】'],
      flavor: '水晶内部封存着远古风暴的微弱回响，贴近耳边时能听见未来的低语。',
      mechanics: '当持有者进行本能检定掷出希望骰时，可额外清除 1 点压力。在爽博朋克车卡器中安装时自动转为「共鸣声纳发生器」。',
      footerInfo: '支持批量勾选打包导出卡包与全量 JSON 备份'
    }
  },
  {
    id: 'standard',
    name: '标准奇幻车卡器',
    tag: '经典规则',
    title: 'Daggerheart 标准奇幻车卡器',
    slogan: '官方经典规则车卡 · 9大职业与子职 · 领域卡组装配',
    desc: '基于官方 Daggerheart 规则的核心车卡工具。支持 9 大主职业与全部子职业、种族社群卡、领域卡组实时装配，经验点数加点升级，以及角色卡实时存档。',
    ctaText: '开启标准车卡',
    ctaLink: '/character/standard',
    badgeText: '官方核心 · 奇幻冒险',
    themeColor: 'rose',
    poster: {
      category: '核心职业卡 · 领域卡组',
      cardTitle: '利刃潜行者',
      cardSubtitle: 'ROGUE & MIDNIGHT DOMAIN',
      stats: [
        { label: '职业', val: '游荡者 (Rogue)' },
        { label: '领域', val: '午夜 / 灵巧' },
        { label: '敏捷', val: '+2' },
        { label: '回避值', val: '12' }
      ],
      tags: ['【暗影斗篷】', '【偷袭刺击】', '【精准爆发】'],
      flavor: '“在阴影中行动，在月光下消失。匕首所到之处，不留痕迹。”',
      mechanics: '装配午夜领域卡「暗影步」，消耗 1 点希望潜入阴影，下一次攻击对未防备目标额外造成 1d8 伤害。',
      footerInfo: '支持海豹骰格式导出与角色卡实时备份'
    }
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
                匕首心 & 爽博朋克 四合一跑团工作台
              </span>
              <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                v1.0 全离线版
              </span>
            </div>

            <div className="flex items-center gap-4 text-stone-400">
              <span className="hidden md:inline text-[11px]">创作交流群：<strong className="text-amber-300 font-mono">261751459</strong></span>
              <a
                href="https://github.com/jeffdyuyi/DH-IN-ONE"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeIdx === 0
                  ? 'bg-cyan-500 text-stone-950 shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>爽博车卡器</span>
            </button>

            <button
              onClick={() => setActiveIdx(1)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeIdx === 1
                  ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>卡牌工坊</span>
            </button>

            <button
              onClick={() => setActiveIdx(2)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeIdx === 2
                  ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>战役文档</span>
            </button>

            <button
              onClick={() => setActiveIdx(3)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeIdx === 3
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>公共卡牌库</span>
            </button>

            <button
              onClick={() => setActiveIdx(4)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeIdx === 4
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-105'
                  : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>标准奇幻车卡</span>
            </button>

          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-stone-400 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>本地存储 · 离线可用</span>
          </div>
        </div>
      </header>

      {/* ================= 核心内容主区域 ================= */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

        {/* 1. 海报滑动核心展区：左侧卡牌海报展示，右侧文本框说明 */}
        <section 
          className="relative rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900/90 via-stone-950/90 to-[#0d0f17] p-6 sm:p-10 shadow-2xl overflow-hidden backdrop-blur-xl"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {/* 背景光斑 */}
          <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20 transition-all duration-500 ${
            activeTool.themeColor === 'cyan' ? 'bg-cyan-500' :
            activeTool.themeColor === 'amber' ? 'bg-amber-500' :
            activeTool.themeColor === 'emerald' ? 'bg-emerald-500' :
            activeTool.themeColor === 'indigo' ? 'bg-indigo-500' : 'bg-rose-500'
          }`} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* 左侧：实体卡片/海报视觉展示区 (5列) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-2xl border border-stone-700/80 bg-[#161822] shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-6 space-y-4 relative group hover:border-amber-500/60 transition-all">
                
                {/* 卡牌顶栏 */}
                <div className="flex items-center justify-between border-b border-stone-700/60 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                    {activeTool.poster.category}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    DH-IN-ONE PREVIEW
                  </span>
                </div>

                {/* 卡牌标题 */}
                <div>
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {activeTool.poster.cardTitle}
                  </h3>
                  <p className="text-[11px] font-mono text-amber-400/80 tracking-wider">
                    {activeTool.poster.cardSubtitle}
                  </p>
                </div>

                {/* 属性数据框 */}
                {activeTool.poster.stats && (
                  <div className="grid grid-cols-2 gap-2 bg-stone-900/80 p-3 rounded-xl border border-stone-800">
                    {activeTool.poster.stats.map((st, i) => (
                      <div key={i} className="text-xs">
                        <span className="text-stone-500 block text-[10px]">{st.label}</span>
                        <span className="font-bold text-stone-200">{st.val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {activeTool.poster.tags.map((tg, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-stone-800/80 text-stone-300 border border-stone-700/50">
                      {tg}
                    </span>
                  ))}
                </div>

                {/* 效果机制说明 */}
                <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs text-stone-300 leading-relaxed space-y-1.5">
                  <div className="font-bold text-amber-400 text-[11px] flex items-center gap-1">
                    <span>⚡ 规则机制</span>
                  </div>
                  <p>{activeTool.poster.mechanics}</p>
                </div>

                {/* 风味文案 */}
                <p className="text-[11px] italic text-stone-400 leading-relaxed border-l-2 border-amber-500/50 pl-2.5">
                  {activeTool.poster.flavor}
                </p>

                {/* 卡牌页脚 */}
                <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-500 flex items-center justify-between">
                  <span>{activeTool.poster.footerInfo}</span>
                  <span className="text-amber-400">● 实时渲染</span>
                </div>

              </div>
            </div>

            {/* 右侧：文本框文字说明与快速操作区 (7列) */}
            <div className="lg:col-span-7 space-y-6">
              
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

              <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800 text-stone-300 text-sm leading-relaxed font-light">
                {activeTool.desc}
              </div>

              {/* 行动按钮 */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={activeTool.ctaLink}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xl shadow-amber-500/20 hover:scale-105 transition-all"
                >
                  <span>{activeTool.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>支持一键导入/导出与跨应用同步</span>
                </div>
              </div>

              {/* 底部滑动指示与翻页控件 */}
              <div className="pt-6 border-t border-stone-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {SHOWCASE_LIST.map((tool, idx) => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveIdx(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeIdx === idx ? 'w-8 bg-amber-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
                      }`}
                      title={tool.name}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveIdx((prev) => (prev - 1 + SHOWCASE_LIST.length) % SHOWCASE_LIST.length)}
                    className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
                    title="上一个功能"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveIdx((prev) => (prev + 1) % SHOWCASE_LIST.length)}
                    className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors"
                    title="下一个功能"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 2. 官方与自制双向连携链路展示（不重复放入口，只展示工作流逻辑） */}
        <section className="p-8 rounded-3xl border border-stone-800 bg-stone-900/40 backdrop-blur-md space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>全生态双向连携闭环流程</span>
            </h3>
            <p className="text-xs text-stone-400">
              各工具之间并非割裂存在，而是通过公共本地库（Vault）实现全自动数据流通
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <span>1. 卡牌工坊定制</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                在卡牌工坊制作武器、敌人、险境或赛博义体，保存时自动持久化写入公共卡牌库。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span>2. 角色卡一键直装</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                车卡器在插槽安装或消耗品栏中直接检索公共库，官方战利品与自制义体一键装配。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>3. 战役模组引用</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                战役编辑器点击「公共卡牌库」，直接将敌人遭遇或险境转换为战役排版块。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                <span>4. 多格式无损导出</span>
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                支持导出 GitHub Markdown 表格文档、FVTT 格式、海豹骰指令、图片隐写图与 HTML。
              </p>
            </div>

          </div>
        </section>

        {/* 3. 辅助指南与协议文档区（非重复功能入口，而是文档支持） */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>跑团指南与扩展协议支持</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <Link
              href="/seal-dice-guide"
              className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-cyan-500/40 transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-stone-200 group-hover:text-cyan-300 transition-colors">海豹骰格式指南</h4>
                <p className="text-[11px] text-stone-400">QQ 骰娘规则与掷骰指令接入说明</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>

            <Link
              href="/card-pack-guide"
              className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-stone-200 group-hover:text-emerald-300 transition-colors">自定义卡包指南</h4>
                <p className="text-[11px] text-stone-400">JSON Schema 结构与 AI 生成提示词</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>

            <Link
              href="/about"
              className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-purple-500/40 transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-stone-200 group-hover:text-purple-300 transition-colors">更新日志与致谢</h4>
                <p className="text-[11px] text-stone-400">爽博朋克车卡器更新史与贡献人员名单</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-stone-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </Link>
          </div>
        </section>

        {/* 4. 创作者社区、联系方式与开源致谢 Footer */}
        <section className="pt-8 border-t border-stone-800 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 左侧：不咕鸟（哈基米德）创作者联系与社群 */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-stone-900/70 border border-amber-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-stone-950 text-sm">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">爽博朋克战役框架作者：不咕鸟（哈基米德）</h4>
                  <p className="text-[11px] text-stone-400">欢迎直接联系或者加群讨论模组、规则、造轮子与反馈建议</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-300">
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>为作者加油（爱发电）</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <a
                  href="http://nogubird.top"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>俱乐部官网 (nogubird.top)</span>
                </a>
              </div>
            </div>

            {/* 右侧：开源致敬团队与协议 */}
            <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-stone-900/40 border border-stone-800 space-y-4 flex flex-col justify-between">
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
                Daggerheart 系统参考文档（SRD）版权归 Critical Role Productions, LLC. 与 Darrington Press 所有。本项目遵循 GPL-3.0 与 DPCGL 社区游戏许可。
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-light">
            <p>© 2026 匕首心 & 爽博朋克 四合一跑团工作台 · 纯客户端离线运行 · 免费开源</p>
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
