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
  Sliders,
  Download,
  Users,
  Compass,
  Palette
} from 'lucide-react'

// --- Hero 轮播幻灯片数据 ---
const HERO_SLIDES = [
  {
    id: 'cyberpunk',
    badge: '⚡ 核心升级 · 爽博朋克',
    title: '爽博朋克：渊边行者',
    subtitle: 'CYBERPUNK CHARACTER ARCHITECT',
    tagline: '身体 5 大区义体插槽 · 神经压力过载 · 黑市非法改造',
    description: '专为《爽博朋克》扩展打造的赛博车卡器。支持跨画风战利品直接编译安装、消耗品无限制堆叠记录，以及 A4 极简浅色 0 墨水线框打印。',
    ctaText: '进入赛博车卡器',
    ctaLink: '/cyberpunk',
    secondaryText: '浏览公共卡牌库',
    secondaryLink: '/vault',
    bgGradient: 'from-cyan-950/40 via-purple-950/30 to-rose-950/30',
    accentColor: 'text-cyan-400',
    borderGlow: 'hover:border-cyan-500/50',
    btnColor: 'bg-cyan-500 hover:bg-cyan-400 text-stone-950',
  },
  {
    id: 'workshop',
    badge: '🎴 33+ 模板 · 隐写术导出',
    title: '匕首心卡牌工坊 V3',
    subtitle: 'CARD WORKSHOP ARCHITECT V3',
    tagline: '全功能排版引擎 · 官方 d60 灵感抽取 · FVTT & CC 导出',
    description: '成熟强大的卡牌设计平台。支持武器、防具、敌人、环境、料理、赛博装备等 33 类卡牌，支持将数据隐写嵌入 PNG 图片与一键生成标准卡包。',
    ctaText: '开启卡牌工坊',
    ctaLink: '/workshop',
    secondaryText: '查阅卡包指南',
    secondaryLink: '/card-pack-guide',
    bgGradient: 'from-amber-950/40 via-orange-950/30 to-stone-950/30',
    accentColor: 'text-amber-400',
    borderGlow: 'hover:border-amber-500/50',
    btnColor: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
  },
  {
    id: 'campaign',
    badge: '📜 战役架构 · DPCGL 合规',
    title: '战役文档编辑器',
    subtitle: 'CAMPAIGN MODULE STUDIO',
    tagline: '大纲目录树 · 遭遇战斗板 · 环境险境 · 公共库直插',
    description: '专为 DM 与创作者设计的战役模组写作与排版神器。支持从公共库一键引入敌人与装备，内建 DPCGL 官方合规助手与多格式导出。',
    ctaText: '进入战役编辑器',
    ctaLink: '/campaign',
    secondaryText: '返回主站门户',
    secondaryLink: '/',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-stone-950/30',
    accentColor: 'text-emerald-400',
    borderGlow: 'hover:border-emerald-500/50',
    btnColor: 'bg-emerald-500 hover:bg-emerald-400 text-stone-950',
  },
  {
    id: 'vault',
    badge: '🗄️ 全离线中枢 · 120 官方种子',
    title: '公共本地卡牌库 (Vault)',
    subtitle: 'SHARED LOCAL CARD VAULT',
    tagline: 'IndexedDB 本地中枢 · 跨应用双向连携 · 批量打包导出',
    description: '实现「工坊制作 ➔ 角色卡直装 ➔ 战役模组引用」全链路闭环的数据中枢。内置 60 官方战利品与 60 消耗品，零服务器，100% 数据隐私安全。',
    ctaText: '管理卡牌库',
    ctaLink: '/vault',
    secondaryText: '开始标准车卡',
    secondaryLink: '/character/standard',
    bgGradient: 'from-indigo-950/40 via-violet-950/30 to-stone-950/30',
    accentColor: 'text-indigo-400',
    borderGlow: 'hover:border-indigo-500/50',
    btnColor: 'bg-indigo-500 hover:bg-indigo-400 text-white',
  }
];

export function PortalHub() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // 轮播自动播放
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-[#0a0c12] text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950 relative overflow-x-hidden">
      
      {/* 沉浸式星云微光背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-35 z-0">
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-600/15 via-blue-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-10 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600/15 via-rose-600/10 to-transparent rounded-full blur-[150px]" />
        {/* 精致微网格暗纹 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* 顶部顶级导航栏 (Top Nav) */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-[#0a0c12]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo 区域 */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center font-serif font-black text-stone-950 text-base shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              DH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold tracking-wider text-base sm:text-lg text-stone-100 group-hover:text-amber-400 transition-colors">
                  匕首心 & 爽博朋克
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  IN ONE
                </span>
              </div>
              <p className="text-[10px] text-stone-400 tracking-wider">OFFICIAL & CYBERPUNK DIGITAL TOOLSET</p>
            </div>
          </Link>

          {/* 导航快捷链接 */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-900/60 p-1.5 rounded-xl border border-white/10 text-xs font-semibold text-stone-300">
            <Link href="/cyberpunk" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>爽博车卡</span>
            </Link>
            <Link href="/character/standard" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>标准车卡</span>
            </Link>
            <Link href="/workshop" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              <span>卡牌工坊</span>
            </Link>
            <Link href="/campaign" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>战役文档</span>
            </Link>
            <Link href="/vault" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>公共库</span>
            </Link>
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/jeffdyuyi/DH-IN-ONE"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-stone-300 hover:text-white flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900/80 border border-stone-700 hover:border-stone-500 hover:bg-stone-800 transition shadow-xs"
            >
              <span>GitHub 开源</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>
        </div>
      </header>

      {/* 核心主区域 */}
      <main className="relative z-10">

        {/* 1. 大画幅沉浸式 Hero 展区 (Feature Showcase Hero) */}
        <section 
          className="relative min-h-[560px] md:min-h-[620px] flex items-center border-b border-white/10 overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* 背景渐变动画 */}
          <div className={`absolute inset-0 bg-gradient-to-r ${activeSlide.bgGradient} transition-all duration-700`} />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0a0c12]/60 to-[#0a0c12]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative z-10">
            <div className="max-w-3xl space-y-6">
              
              {/* Badge 标签 */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-stone-200 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeSlide.badge}</span>
              </div>

              {/* 大标题 */}
              <div>
                <p className="text-xs sm:text-sm font-mono tracking-widest text-stone-400 uppercase mb-2">
                  {activeSlide.subtitle}
                </p>
                <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight text-white leading-tight">
                  {activeSlide.title}
                </h1>
                <p className={`text-lg sm:text-xl font-medium mt-3 ${activeSlide.accentColor}`}>
                  {activeSlide.tagline}
                </p>
              </div>

              {/* 描述文案 */}
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-light">
                {activeSlide.description}
              </p>

              {/* 行动按钮群 */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={activeSlide.ctaLink}
                  className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 ${activeSlide.btnColor}`}
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={activeSlide.secondaryLink}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-stone-500 transition-all backdrop-blur-md"
                >
                  <span>{activeSlide.secondaryText}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 轮播指示器与切换按键 */}
          <div className="absolute bottom-6 right-6 sm:right-12 z-20 flex items-center gap-3 bg-stone-950/80 backdrop-blur-md p-2 rounded-2xl border border-white/10">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="上一个特性"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-1">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'w-8 bg-amber-400' 
                      : 'w-2 bg-stone-700 hover:bg-stone-500'
                  }`}
                  title={slide.title}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title="下一个特性"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* 2. 核心架构三大支柱 (Core Pillars - "Push Your Play - Without the Stress") */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              ALL-IN-ONE DIGITAL ECOSYSTEM
            </h2>
            <p className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
              畅玩跑团 · <span className="text-amber-400 italic">零繁琐门槛</span>
            </p>
            <p className="text-sm sm:text-base text-stone-400 font-light">
              无需配置服务器，无需网络依赖。所有规则数据、车卡、卡牌与战役设定均在你的本地浏览器安全运算与渲染。
            </p>
          </div>

          {/* 4 大核心工具矩阵卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 卡片 1: 爽博朋克车卡器 */}
            <Link
              href="/cyberpunk"
              className="group relative rounded-3xl border border-stone-800/80 bg-gradient-to-b from-stone-900/90 to-stone-950/90 p-8 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                    ⚡ 爽博朋克特化
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-cyan-300 transition-colors mb-3">
                  爽博朋克赛博车卡器
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed mb-6 font-light">
                  《爽博朋克：渊边行者》官方规则特化。涵盖头部/躯干/上肢/下肢义体插槽装配、神经压力超载判定、黑市非法改造、跨界战利品直装与 A4 极简浅色线框打印。
                </p>

                <div className="space-y-2 mb-8 text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>5 大身体部位义体插槽与黑市非法改造</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>无上限随身消耗品栏（同名堆叠5个）与一键清空</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>默认极简浅色主题 · 0 墨水浪费线框打印</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-sm font-bold text-cyan-400 group-hover:text-white transition-colors">
                <span>立即启动赛博车卡器</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            {/* 卡片 2: 卡牌工坊 V3 */}
            <Link
              href="/workshop"
              className="group relative rounded-3xl border border-stone-800/80 bg-gradient-to-b from-stone-900/90 to-stone-950/90 p-8 hover:border-amber-500/60 transition-all duration-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.15)] flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                    <Layers className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    33+ 卡牌类型 · 隐写导出
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors mb-3">
                  匕首心卡牌工坊 V3
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed mb-6 font-light">
                  成熟且功能完备的卡牌定制工坊。支持武器、防具、敌人、环境险境、料理、战术轮椅等 33 类卡牌，支持将数据隐写嵌入 PNG 图片与一键导出 FVTT/CC 格式。
                </p>

                <div className="space-y-2 mb-8 text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>33+ 种 TRPG 卡牌专属视觉模版与实时高精度渲染</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>图片隐写术导出：将工程数据无损编码进高清 PNG</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>自动同步写入公共卡牌库中枢 (Shared Vault)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-sm font-bold text-amber-400 group-hover:text-white transition-colors">
                <span>开启卡牌设计工坊</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            {/* 卡片 3: 战役文档编辑器 */}
            <Link
              href="/campaign"
              className="group relative rounded-3xl border border-stone-800/80 bg-gradient-to-b from-stone-900/90 to-stone-950/90 p-8 hover:border-emerald-500/60 transition-all duration-300 hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    大纲架构 · DPCGL 合规
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-emerald-300 transition-colors mb-3">
                  匕首心战役文档编辑器
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed mb-6 font-light">
                  305KB 完整引擎。支持多级大纲目录树、遭遇敌人板、环境险境块、朗读框（Read Aloud）、属性检定表、数据表格、官方 DPCGL 合规助手与 Markdown 导出。
                </p>

                <div className="space-y-2 mb-8 text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>支持从公共卡牌库一键将敌人与险境转化为章节块</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% 正确将编辑器表格序列化导出为标准 Markdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>内建官方 DPCGL 社区协议助手与单页 HTML 导出</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-sm font-bold text-emerald-400 group-hover:text-white transition-colors">
                <span>进入战役架构工作台</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

            {/* 卡片 4: 公共本地卡牌库 */}
            <Link
              href="/vault"
              className="group relative rounded-3xl border border-stone-800/80 bg-gradient-to-b from-stone-900/90 to-stone-950/90 p-8 hover:border-indigo-500/60 transition-all duration-300 hover:shadow-[0_0_35px_rgba(99,102,241,0.15)] flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                    <Database className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                    内置 120 官方物品种子
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-indigo-300 transition-colors mb-3">
                  公共本地卡牌库 (Vault)
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed mb-6 font-light">
                  四合一全生态的数据持久化中枢。内置官方 60 战利品与 60 消耗品种子，提供跨应用检索、批量勾选打包导出卡包、全量数据一键备份与旧版吸纳。
                </p>

                <div className="space-y-2 mb-8 text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>官方与自制双向连携：工坊 ➔ 角色卡 ➔ 战役模组</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>支持按武器、护甲、义体、敌人、环境多维筛选检索</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>基于 IndexedDB 本地持久化，支持全量 JSON 备份迁移</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-sm font-bold text-indigo-400 group-hover:text-white transition-colors">
                <span>进入卡牌库中枢</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

        {/* 3. 探索更多模块快速入口 (Explore Specialized Tools) */}
        <section className="py-12 border-t border-stone-800/80 bg-stone-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>快捷工具与扩展专区</span>
                </h3>
                <p className="text-xs text-stone-400">满足深度定制、老版数据迁移与特殊跑团场景的多维工具入口</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href="/character/standard" 
                className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-amber-500/40 transition-all flex items-center gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-200 group-hover:text-amber-300 transition-colors">标准奇幻车卡器</h4>
                  <p className="text-[11px] text-stone-400">Daggerheart 经典规则车卡</p>
                </div>
              </Link>

              <Link 
                href="/seal-dice-guide" 
                className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-cyan-500/40 transition-all flex items-center gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Dices className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-200 group-hover:text-cyan-300 transition-colors">海豹骰格式指南</h4>
                  <p className="text-[11px] text-stone-400">QQ 骰娘与指令接入规范</p>
                </div>
              </Link>

              <Link 
                href="/card-pack-guide" 
                className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-emerald-500/40 transition-all flex items-center gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-200 group-hover:text-emerald-300 transition-colors">自定义卡包指南</h4>
                  <p className="text-[11px] text-stone-400">JSON Schema 与 AI 提示词</p>
                </div>
              </Link>

              <Link 
                href="/about" 
                className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-purple-500/40 transition-all flex items-center gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-200 group-hover:text-purple-300 transition-colors">更新日志与致谢</h4>
                  <p className="text-[11px] text-stone-400">版本历史与开源作者</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. 底层技术保障条 (Technical Pillars) */}
        <section className="py-12 border-t border-stone-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-200">100% 本地隐私与断网可用</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    所有数据均保存在浏览器的 IndexedDB 与 localStorage 中，无需注册账号，断网也能流畅使用。
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-200">官方与自制双向连携</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    卡牌工坊制作的装备/敌人直接同步入库，角色卡支持一键装配，战役文档编辑器一键引用为编辑块。
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Share2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-stone-200">全生态开放格式导出</h4>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    支持导出海豹骰、FVTT 虚拟桌面、图片隐写术、标准 Markdown 表格与离线单页 HTML 文档。
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 5. 创作者社区与开源致敬 Studio Footer (Studio & Community) */}
        <section className="py-16 border-t border-stone-800 bg-[#08090e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 左侧：不咕鸟（哈基米德）创作者专区 (5列) */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-stone-900/60 border border-amber-500/20 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-stone-950 text-base">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">爽博朋克战役框架作者：不咕鸟（哈基米德）</h3>
                    <p className="text-xs text-stone-400">欢迎直接联系或者加群讨论模组、规则、造轮子与反馈建议</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-300">
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">微信 / 联系电话</span>
                    <span className="font-mono font-bold text-cyan-400 text-sm">13308009593</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">作者 QQ / 微信</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">QQ: 442348584</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">不咕鸟创作交流群</span>
                    <span className="font-mono font-bold text-stone-100 text-sm">261751459</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">成都秘密基地TRPG群</span>
                    <span className="font-mono font-bold text-stone-100 text-sm">691707475</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://ifdian.net/a/nogubird"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>为作者加油（爱发电）</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>

                  <a
                    href="http://nogubird.top"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>俱乐部官网 (nogubird.top)</span>
                  </a>
                </div>
              </div>

              {/* 右侧：开源致敬团队与版权 (6列) */}
              <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-stone-900/40 border border-stone-800 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">开源致谢：原版车卡器贡献团队</h3>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    车卡器核心基于 <a href="https://github.com/RidRisR/DaggerHeart-CharacterSheet" target="_blank" rel="noreferrer" className="text-amber-400 underline underline-offset-2 hover:text-white font-semibold">DHSheet 开源项目</a> 衍生重构。感谢原团队的开拓与中文本地化贡献：
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-stone-300">
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

                <div className="pt-4 border-t border-stone-800/80 text-[11px] text-stone-500 space-y-1">
                  <p>
                    Daggerheart 系统参考文档（SRD）版权归 Critical Role Productions, LLC. 与 Darrington Press 所有。本项目遵循 GPL-3.0 与 DPCGL 社区游戏许可。
                  </p>
                  <p className="font-mono text-[10px] text-stone-600">
                    OPEN SOURCE LICENSE: GNU GENERAL PUBLIC LICENSE V3.0
                  </p>
                </div>
              </div>

            </div>

            {/* 极简版权页底 */}
            <div className="pt-8 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
              <p>© 2026 匕首心 & 爽博朋克 in one · 纯客户端离线运行 · 免费开源</p>
              <div className="flex items-center gap-6">
                <Link href="/about" className="hover:text-stone-300 transition-colors">关于项目</Link>
                <Link href="/seal-dice-guide" className="hover:text-stone-300 transition-colors">海豹骰指南</Link>
                <Link href="/card-pack-guide" className="hover:text-stone-300 transition-colors">卡包规范</Link>
                <a href="https://github.com/jeffdyuyi/DH-IN-ONE" target="_blank" rel="noreferrer" className="hover:text-stone-300 transition-colors">GitHub</a>
              </div>
            </div>

          </div>
        </section>

      </main>

    </div>
  )
}
