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

        {/* 1. 海报滑动核心展区：左侧卡牌海报展示（适度缩放），右侧文本框说明 */}
        <section 
          className="relative rounded-3xl border border-stone-800 bg-gradient-to-b from-stone-900/95 via-stone-950/95 to-[#0d0f17] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden backdrop-blur-xl transition-all"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          {/* 背景光斑与渐变遮罩 */}
          <div className={`absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-25 transition-all duration-700 bg-gradient-to-br ${activeTool.glowClass}`} />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0d0f17]/40 to-[#0d0f17]/80 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* 左侧：实体卡片/海报视觉展示区 (5列，适度缩放至与右文对称) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              {activeTool.id === 'cyberpunk' ? (
                /* 爽博朋克专属封面海报（适度缩放 max-w-[280px] sm:max-w-[320px]） */
                <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-2xl border border-cyan-500/40 bg-[#161822] shadow-[0_15px_45px_rgba(6,182,212,0.25)] overflow-hidden relative group hover:border-cyan-400 hover:shadow-[0_20px_55px_rgba(6,182,212,0.35)] transition-all duration-500">
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-stone-950 max-h-[400px]">
                    <img 
                      src="./images/shuangbopunk-cover.jpg" 
                      alt="SHUANGBOPUNK 爽博朋克：渊边行者"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-50 pointer-events-none" />
                  </div>

                  {/* 底部精炼标注 */}
                  <div className="px-3.5 py-2.5 bg-stone-900/95 backdrop-blur-md border-t border-cyan-500/30 flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-bold text-[11px]">《爽博朋克》原画封面</span>
                    <span className="text-[11px] font-mono text-cyan-300 font-semibold bg-stone-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
                      视觉渲染：QQ 2077163152
                    </span>
                  </div>
                </div>
              ) : (
                /* 其他工具的结构化卡片排版展示（适度缩放） */
                <div className="w-full max-w-[320px] sm:max-w-[350px] rounded-2xl border border-stone-700/80 bg-[#161822] shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-5 space-y-3.5 relative group hover:border-amber-500/70 hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)] transition-all duration-300">
                  
                  {/* 卡牌顶栏 */}
                  <div className="flex items-center justify-between border-b border-stone-700/60 pb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700 group-hover:scale-105 transition-transform">
                      {activeTool.poster.category}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      DH-IN-ONE
                    </span>
                  </div>

                  {/* 卡牌标题 */}
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-amber-300 transition-colors">
                      {activeTool.poster.cardTitle}
                    </h3>
                    <p className="text-[10px] font-mono text-amber-400/80 tracking-wider">
                      {activeTool.poster.cardSubtitle}
                    </p>
                  </div>

                  {/* 属性数据框 */}
                  {activeTool.poster.stats && (
                    <div className="grid grid-cols-2 gap-1.5 bg-stone-900/80 p-2.5 rounded-xl border border-stone-800">
                      {activeTool.poster.stats.map((st, i) => (
                        <div key={i} className="text-xs">
                          <span className="text-stone-500 block text-[9px]">{st.label}</span>
                          <span className="font-bold text-stone-200 text-xs">{st.val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1">
                    {activeTool.poster.tags.map((tg, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-300 border border-stone-700/50">
                        {tg}
                      </span>
                    ))}
                  </div>

                  {/* 效果机制说明 */}
                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs text-stone-300 leading-relaxed space-y-1">
                    <div className="font-bold text-amber-400 text-[10px] flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>规则机制</span>
                    </div>
                    <p className="text-[11px] leading-snug">{activeTool.poster.mechanics}</p>
                  </div>

                  {/* 风味文案 */}
                  <p className="text-[10px] italic text-stone-400 leading-relaxed border-l-2 border-amber-500/50 pl-2">
                    {activeTool.poster.flavor}
                  </p>

                  {/* 卡牌页脚 */}
                  <div className="pt-2 border-t border-stone-800 text-[9px] text-stone-500 flex items-center justify-between">
                    <span>{activeTool.poster.footerInfo}</span>
                    <span className="text-amber-400">● 实时渲染</span>
                  </div>

                </div>
              )}
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
