"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  Layers, 
  BookOpen, 
  UserCheck, 
  Database, 
  ExternalLink, 
  Cpu, 
  ShieldCheck, 
  Dices,
  FileText,
  ArrowRight
} from 'lucide-react'

export function PortalHub() {
  const [themeMode, setThemeMode] = useState<'cyberpunk' | 'fantasy'>('cyberpunk')

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${
      themeMode === 'cyberpunk' 
        ? 'bg-[#0B0320] text-slate-100 selection:bg-[#FF007F] selection:text-white' 
        : 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black'
    }`}>
      {/* 顶部极光氛围背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        {themeMode === 'cyberpunk' ? (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#6C00FF] rounded-full blur-[128px]" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#FF007F] rounded-full blur-[128px]" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-[#00FFA3] rounded-full blur-[128px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/30 rounded-full blur-[128px]" />
            <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/30 rounded-full blur-[128px]" />
            <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/30 rounded-full blur-[128px]" />
          </>
        )}
      </div>

      {/* 顶部导航条 */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg ${
              themeMode === 'cyberpunk'
                ? 'bg-gradient-to-br from-[#00FFA3] to-[#6C00FF] text-black shadow-[#6C00FF]/20'
                : 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-amber-500/20'
            }`}>
              DH
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-lg">DH-IN-ONE</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-white/20 text-slate-400">
                v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 主题切换开关 */}
            <button
              onClick={() => setThemeMode(themeMode === 'cyberpunk' ? 'fantasy' : 'cyberpunk')}
              className={`flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                themeMode === 'cyberpunk'
                  ? 'border-[#00FFA3]/50 text-[#00FFA3] hover:bg-[#00FFA3]/10 shadow-[0_0_12px_rgba(0,255,163,0.2)]'
                  : 'border-amber-400/50 text-amber-300 hover:bg-amber-400/10 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              }`}
            >
              {themeMode === 'cyberpunk' ? <Cpu className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{themeMode === 'cyberpunk' ? '霓虹隧道模式' : '经典奇幻模式'}</span>
            </button>

            {/* GitHub 开源链接 */}
            <a
              href="https://github.com/jeffdyuyi/DH-IN-ONE"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        {/* Hero 标语区 */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border ${
            themeMode === 'cyberpunk'
              ? 'border-[#FF007F]/40 bg-[#FF007F]/10 text-[#FF007F]'
              : 'border-amber-400/40 bg-amber-400/10 text-amber-300'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daggerheart 匕首之心 · 全流程全规则多合一中枢</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            <span className="block">设计、编排与车卡</span>
            <span className={`block bg-clip-text text-transparent ${
              themeMode === 'cyberpunk'
                ? 'bg-gradient-to-r from-[#00FFA3] via-[#F5F500] to-[#FF007F]'
                : 'bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500'
            }`}>
              一体化本地跑团工作台
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            数据 100% 留存在你的本地浏览器，零服务器依赖。卡牌工坊、战役文档编辑器、双规则车卡器与公共本地卡牌库无缝连携。
          </p>
        </div>

        {/* 四大模块入口卡片矩阵 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {/* 卡片 1: 角色卡与车卡器 */}
          <Link
            href="/character"
            className={`group relative p-8 rounded-2xl border transition-all duration-300 backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] flex flex-col justify-between overflow-hidden ${
              themeMode === 'cyberpunk'
                ? 'border-white/10 hover:border-[#00FFA3]/60 hover:shadow-[0_0_30px_rgba(0,255,163,0.15)]'
                : 'border-white/10 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  themeMode === 'cyberpunk' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-amber-400/10 text-amber-400'
                }`}>
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 text-slate-400">
                  标准 & 爽博双模式
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-white transition">角色卡构建与车卡器</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                包含标准 9 职业角色卡生成与《爽博朋克：渊边行者》专属义体改装车卡器。支持多存档本地管理、自动规则分流、装备自动计算与 A4 竖版 0 墨水打印。
              </p>
            </div>
            <div className={`flex items-center text-sm font-semibold transition-colors ${
              themeMode === 'cyberpunk' ? 'text-[#00FFA3] group-hover:text-white' : 'text-amber-400 group-hover:text-white'
            }`}>
              <span>进入角色卡中心</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 卡片 2: 卡牌工坊 V3 */}
          <Link
            href="/workshop"
            className={`group relative p-8 rounded-2xl border transition-all duration-300 backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] flex flex-col justify-between overflow-hidden ${
              themeMode === 'cyberpunk'
                ? 'border-white/10 hover:border-[#F5F500]/60 hover:shadow-[0_0_30px_rgba(245,245,0,0.15)]'
                : 'border-white/10 hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  themeMode === 'cyberpunk' ? 'bg-[#F5F500]/10 text-[#F5F500]' : 'bg-emerald-400/10 text-emerald-400'
                }`}>
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 text-slate-400">
                  33+ 卡牌类型 · d60抽取
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-white transition">匕首心卡牌工坊 V3</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                支持武器、防具、敌人、环境、料理、赛博装备等 33 种卡牌设计。内嵌官方 d60 战利品/消耗品灵感抽取器，支持图片隐写导出与一键生成标准卡包 JSON。
              </p>
            </div>
            <div className={`flex items-center text-sm font-semibold transition-colors ${
              themeMode === 'cyberpunk' ? 'text-[#F5F500] group-hover:text-white' : 'text-emerald-400 group-hover:text-white'
            }`}>
              <span>打开卡牌工坊</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 卡片 3: 战役编辑器 */}
          <Link
            href="/campaign"
            className={`group relative p-8 rounded-2xl border transition-all duration-300 backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] flex flex-col justify-between overflow-hidden ${
              themeMode === 'cyberpunk'
                ? 'border-white/10 hover:border-[#FF007F]/60 hover:shadow-[0_0_30px_rgba(255,0,127,0.15)]'
                : 'border-white/10 hover:border-indigo-400/60 hover:shadow-[0_0_30px_rgba(129,140,248,0.15)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  themeMode === 'cyberpunk' ? 'bg-[#FF007F]/10 text-[#FF007F]' : 'bg-indigo-400/10 text-indigo-400'
                }`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 text-slate-400">
                  模块化模组排版
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-white transition">匕首心战役编辑器</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                专业跑团模组与战役设定排版工具。支持直接从公共库一键插入战斗敌人、环境险境、赛博装备与战利品清单，内建官方 DPCGL 合规许可声明。
              </p>
            </div>
            <div className={`flex items-center text-sm font-semibold transition-colors ${
              themeMode === 'cyberpunk' ? 'text-[#FF007F] group-hover:text-white' : 'text-indigo-400 group-hover:text-white'
            }`}>
              <span>进入战役编辑器</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 卡片 4: 公共本地卡牌库 */}
          <Link
            href="/vault"
            className={`group relative p-8 rounded-2xl border transition-all duration-300 backdrop-blur-xl bg-white/[0.03] hover:bg-white/[0.06] flex flex-col justify-between overflow-hidden ${
              themeMode === 'cyberpunk'
                ? 'border-white/10 hover:border-[#6C00FF]/60 hover:shadow-[0_0_30px_rgba(108,0,255,0.15)]'
                : 'border-white/10 hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  themeMode === 'cyberpunk' ? 'bg-[#6C00FF]/10 text-[#6C00FF]' : 'bg-cyan-400/10 text-cyan-400'
                }`}>
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 text-slate-400">
                  内置120官方物品
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 group-hover:text-white transition">公共本地卡牌库 (Vault)</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                三合一系统的本地存储中枢。内置官方 60 战利品与 60 消耗品种子，提供跨应用卡牌检索、批量勾选打包导出卡包、全量数据一键备份与旧版数据吸纳。
              </p>
            </div>
            <div className={`flex items-center text-sm font-semibold transition-colors ${
              themeMode === 'cyberpunk' ? 'text-[#6C00FF] group-hover:text-white' : 'text-cyan-400 group-hover:text-white'
            }`}>
              <span>管理卡牌库</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* 底部特性标语区 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold block text-slate-200">100% 本地隐私安全</span>
              <span className="text-slate-400">数据全部存于浏览器，支持断网离线使用</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Dices className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold block text-slate-200">官方与自制双向连携</span>
              <span className="text-slate-400">工坊制作 ➔ 角色卡直装 ➔ 战役模组引用</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold block text-slate-200">全生态导出链条</span>
              <span className="text-slate-400">支持海豹骰、FVTT、隐写卡牌图与标准卡包</span>
            </div>
          </div>
        </div>
      </main>

      {/* 合规与开源致谢页脚 */}
      <footer className="border-t border-white/10 bg-black/40 py-10 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-slate-300 font-semibold mb-1">
              DH-IN-ONE · Daggerheart 匕首之心多合一工具箱
            </p>
            <p className="text-slate-500">
              开源协议：GNU General Public License v3.0 (GPL-3.0) · 本项目非官方产品，遵循 Darrington Press 社区许可 (DPCGL)。
            </p>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <a
              href="https://github.com/jeffdyuyi/DH-IN-ONE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition underline underline-offset-4"
            >
              原创整合：jeffdyuyi
            </a>
            <span>•</span>
            <a
              href="https://darringtonpress.com/daggerheart/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition underline underline-offset-4"
            >
              Daggerheart 官方
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
