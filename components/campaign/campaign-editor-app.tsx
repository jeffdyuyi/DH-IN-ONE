"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  Plus, Trash2, MoveUp, MoveDown, LayoutTemplate, 
  Star, Italic, Type, Table as TableIcon, 
  Image as ImageIcon, Swords, Mountain, Minus, Heading, 
  AlignJustify, ArrowLeft, Edit3, Eye, Download,
  MessageSquareQuote, AlertCircle, ListChecks, X,
  ToggleLeft, ToggleRight, Layout, FileText,
  FileJson, Upload, FileCode, Palette, ImagePlus,
  ChevronDown, ChevronRight,
  GripVertical, BookOpen, XCircle, AlertTriangle, RefreshCw,
  Folder, Clock, Save, Bold, Strikethrough,
  Quote, List, ListOrdered, Code, Split, Highlighter, Copy,
  ShieldCheck, Scale, Check, CheckCircle2, Sparkles, FileCheck,
  Cpu
} from 'lucide-react';
import { 
  ProjectData, DynamicSection, DEFAULT_PROJECT,
  ContentBlock, BlockType, EnemyBlock, EnvironmentBlock, 
  OutcomeBlock, OutcomeEntry, ThemeType, Trait, CyberwareBlock,
  ProjectSettings, OutcomeTag, SavedProject, CoverPage, CreditsPage,
  DPCGLLogoType, DPCGLTemplateType, CopyrightSettings, LogoPosition, LogoSize
} from './types';
import { 
  DPCGL_LOGOS, DPCGL_TEMPLATES, getLogoUrl, getPositionClass, getSizeClass
} from './dpcglHelper';
import { SmartTextarea } from './components/SmartTextarea';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { SavedLibraryModal, LIBRARY_STORAGE_KEY } from './components/SavedLibraryModal';

// --- Constants & Styles ---

const Styles = {
  // Modern Input: Minimalist, bottom border focus
  modernInput: "w-full bg-transparent border-b border-stone-200 px-1 py-2 focus:border-amber-500 outline-none transition-colors font-sans text-sm text-stone-800 placeholder:text-stone-300",
  modernTextarea: "w-full bg-transparent border border-stone-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-sans text-sm leading-relaxed shadow-sm placeholder:text-stone-300 resize-y",
  
  // Labels & Headers
  label: "block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1",
  sectionHeader: "text-lg font-bold text-stone-800 mb-4 flex items-center gap-2",
  
  // Containers
  card: "bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-stone-100 p-6 transition-all hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)]",
  sectionCard: "bg-white rounded-xl border border-stone-100 p-4 flex items-center gap-5 transition-all hover:border-amber-300 hover:shadow-md cursor-pointer group relative overflow-hidden",
  
  // Buttons & Tools
  toolBtn: "w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all text-stone-600 hover:bg-amber-50 hover:text-amber-800 hover:shadow-sm",
  toolGroupLabel: "px-3 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest mt-2",
  
  // Block Wrappers
  blockWrapper: "group relative bg-white border border-transparent hover:border-stone-200 rounded-xl transition-all duration-200",
  blockHeader: "flex items-center justify-between px-4 py-2 bg-stone-50/50 border-b border-stone-100 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200",
  blockContent: "p-4 md:p-6",
  
  // Utility
  iconBtn: "p-1.5 rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors",
  deleteBtn: "p-1.5 rounded-md text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors",
  primaryBtn: "flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all font-medium text-sm",
  secondaryBtn: "flex items-center gap-2 bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm",
};

const THEMES: Record<ThemeType, any> = {
  default: { 
    name: '默认 (Daggerheart)', 
    fontHead: 'font-serif', 
    fontBody: 'font-sans', 
    bg: 'bg-white', 
    text: 'text-stone-900', 
    accent: 'text-amber-700', 
    border: 'border-stone-900', 
    metaBg: 'bg-stone-50', 
    card: { 
      isDark: false,
      bg: 'bg-[#f7f5ef]', 
      border: 'border-[#c2b49d]', 
      text: 'text-stone-900', 
      textMuted: 'text-stone-600',
      enemyBar: 'bg-[#8a1c1c]', 
      envBar: 'bg-[#1c538a]',
      nameText: 'text-stone-900',
      nameEnText: 'text-stone-500',
      badgeTier: 'bg-[#e5ded0] text-stone-800 border border-[#d3c9b8]',
      badgeTypeEnemy: 'bg-red-100 text-red-900 border border-red-200',
      badgeTypeEnv: 'bg-sky-100 text-sky-900 border border-sky-200',
      badgeNpc: 'bg-purple-100 text-purple-900 border border-purple-300',
      avatarBorder: 'border-[#8a1c1c]',
      metaBox: 'bg-[#eae3d5] border border-[#d6cbba]',
      metaLabelEnemy: 'text-red-900',
      metaLabelEnv: 'text-sky-900',
      metaText: 'text-stone-800',
      statBox: 'bg-[#ffffff] border border-[#d6cdbe]',
      statItem: 'bg-[#f9f7f2] border border-[#ebe4d6]',
      statLabel: 'text-stone-500',
      statVal: 'text-stone-900',
      statHpVal: 'text-red-700',
      statStressVal: 'text-amber-700',
      hpDot: 'border-red-600 bg-red-500/20',
      stressDot: 'border-amber-600 bg-amber-500/20',
      attackName: 'text-red-800',
      attackTypeMagic: 'bg-purple-100 text-purple-900',
      attackTypePhys: 'bg-stone-200 text-stone-800',
      attackStats: 'text-red-800',
      traitName: 'text-stone-900',
      traitDescBorder: 'border-[#c2b49d]',
      traitFlavor: 'text-stone-500',
      traitPassive: 'bg-[#e5ded0] text-stone-800',
      traitAction: 'bg-amber-100 text-amber-900',
      traitSpotlight: 'bg-red-100 text-red-900',
      traitReaction: 'bg-indigo-100 text-indigo-900',
      specialBox: 'bg-[#fef9c3]/70 border-2 border-dashed border-[#eab308]',
      specialTitle: 'text-[#854d0e]',
      specialTag: 'bg-[#fef08a] text-[#713f12]',
      specialText: 'text-stone-900',
      countdownBox: 'bg-[#f0f9ff] border border-[#7dd3fc]',
      countdownTitle: 'text-[#0369a1]',
      countdownBadge: 'bg-[#0284c7] text-white',
      countdownText: 'text-[#0c4a6e]',
      gmQuestionBox: 'bg-[#f0f7ff] border border-[#bae6fd]',
      gmQuestionTitle: 'text-[#0369a1]',
      gmQuestionText: 'text-[#0369a1]'
    } 
  },
  gothic: {
    name: '黑紫哥特 (Gothic)',
    fontHead: 'font-serif', 
    fontBody: 'font-serif',
    bg: 'bg-[#14121e]',
    text: 'text-[#f5edff]',
    accent: 'text-[#c084fc]',
    border: 'border-[#7e22ce]',
    metaBg: 'bg-[#1e192e]',
    card: { 
      isDark: true,
      bg: 'bg-[#181622]', 
      border: 'border-[#6b21a8]', 
      text: 'text-[#f3e8ff]', 
      textMuted: 'text-[#c084fc]',
      enemyBar: 'bg-[#ef4444]', 
      envBar: 'bg-[#a855f7]',
      nameText: 'text-[#faf5ff]',
      nameEnText: 'text-[#a855f7]',
      badgeTier: 'bg-[#2e1065] text-[#e9d5ff] border border-[#581c87]',
      badgeTypeEnemy: 'bg-[#450a0a] text-[#fca5a5] border border-[#991b1b]',
      badgeTypeEnv: 'bg-[#3b0764] text-[#d8b4fe] border border-[#7e22ce]',
      badgeNpc: 'bg-[#4c1d95] text-[#f3e8ff] border border-[#7c3aed]',
      avatarBorder: 'border-[#ef4444]',
      metaBox: 'bg-[#201c2e] border border-[#4c1d95]',
      metaLabelEnemy: 'text-[#fca5a5]',
      metaLabelEnv: 'text-[#d8b4fe]',
      metaText: 'text-[#e9d5ff]',
      statBox: 'bg-[#110e1a] border border-[#4c1d95]',
      statItem: 'bg-[#1d172b] border border-[#3b0764]',
      statLabel: 'text-[#c084fc]',
      statVal: 'text-[#faf5ff]',
      statHpVal: 'text-[#f87171]',
      statStressVal: 'text-[#fde047]',
      hpDot: 'border-red-400 bg-red-500/30',
      stressDot: 'border-yellow-400 bg-yellow-500/30',
      attackName: 'text-[#f87171]',
      attackTypeMagic: 'bg-[#581c87] text-[#f3e8ff]',
      attackTypePhys: 'bg-[#27272a] text-[#e4e4e7]',
      attackStats: 'text-[#fca5a5]',
      traitName: 'text-[#faf5ff]',
      traitDescBorder: 'border-[#6b21a8]',
      traitFlavor: 'text-[#c084fc]',
      traitPassive: 'bg-[#2e1065] text-[#e9d5ff]',
      traitAction: 'bg-[#701a75] text-[#fdf4ff]',
      traitSpotlight: 'bg-[#831843] text-[#ffe4e6]',
      traitReaction: 'bg-[#312e81] text-[#e0e7ff]',
      specialBox: 'bg-[#28153d] border-2 border-dashed border-[#c084fc]',
      specialTitle: 'text-[#fde047]',
      specialTag: 'bg-[#581c87] text-[#fde047]',
      specialText: 'text-[#f3e8ff]',
      countdownBox: 'bg-[#201533] border border-[#a855f7]',
      countdownTitle: 'text-[#e9d5ff]',
      countdownBadge: 'bg-[#7c3aed] text-white',
      countdownText: 'text-[#e9d5ff]',
      gmQuestionBox: 'bg-[#231738] border border-[#6b21a8]',
      gmQuestionTitle: 'text-[#d8b4fe]',
      gmQuestionText: 'text-[#d8b4fe]'
    }
  },
  fairytale: {
    name: '粉蓝童话 (Fairy Tale)',
    fontHead: 'font-sans', 
    fontBody: 'font-sans', 
    bg: 'bg-[#faf8f5]',
    text: 'text-[#1e293b]',
    accent: 'text-[#db2777]',
    border: 'border-[#f472b6]',
    metaBg: 'bg-white',
    card: { 
      isDark: false,
      bg: 'bg-[#ffffff]', 
      border: 'border-[#f472b6]', 
      text: 'text-[#334155]', 
      textMuted: 'text-[#64748b]',
      enemyBar: 'bg-[#f43f5e]', 
      envBar: 'bg-[#0284c7]',
      nameText: 'text-[#0f172a]',
      nameEnText: 'text-[#ec4899]',
      badgeTier: 'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
      badgeTypeEnemy: 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3]',
      badgeTypeEnv: 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]',
      badgeNpc: 'bg-[#fae8ff] text-[#86198f] border border-[#f0abfc]',
      avatarBorder: 'border-[#f43f5e]',
      metaBox: 'bg-[#fdf2f8] border border-[#fbcfe8]',
      metaLabelEnemy: 'text-[#be123c]',
      metaLabelEnv: 'text-[#0369a1]',
      metaText: 'text-[#334155]',
      statBox: 'bg-[#f8fafc] border border-[#e2e8f0]',
      statItem: 'bg-[#ffffff] border border-[#e2e8f0]',
      statLabel: 'text-[#64748b]',
      statVal: 'text-[#0f172a]',
      statHpVal: 'text-[#e11d48]',
      statStressVal: 'text-[#d97706]',
      hpDot: 'border-rose-500 bg-rose-500/20',
      stressDot: 'border-amber-500 bg-amber-500/20',
      attackName: 'text-[#e11d48]',
      attackTypeMagic: 'bg-purple-100 text-purple-900',
      attackTypePhys: 'bg-slate-100 text-slate-800',
      attackStats: 'text-[#e11d48]',
      traitName: 'text-[#0f172a]',
      traitDescBorder: 'border-[#f472b6]',
      traitFlavor: 'text-[#64748b]',
      traitPassive: 'bg-[#f1f5f9] text-[#475569]',
      traitAction: 'bg-[#fef3c7] text-[#92400e]',
      traitSpotlight: 'bg-[#ffe4e6] text-[#9f1239]',
      traitReaction: 'bg-[#e0e7ff] text-[#3730a3]',
      specialBox: 'bg-[#fff1f2] border-2 border-dashed border-[#fb7185]',
      specialTitle: 'text-[#be123c]',
      specialTag: 'bg-[#fecdd3] text-[#881337]',
      specialText: 'text-[#334155]',
      countdownBox: 'bg-[#f0f9ff] border border-[#38bdf8]',
      countdownTitle: 'text-[#0284c7]',
      countdownBadge: 'bg-[#0284c7] text-white',
      countdownText: 'text-[#0369a1]',
      gmQuestionBox: 'bg-[#f0f9ff] border border-[#bae6fd]',
      gmQuestionTitle: 'text-[#0284c7]',
      gmQuestionText: 'text-[#0284c7]'
    }
  },
  chinese: {
    name: '红黄中国 (Chinese)',
    fontHead: 'font-serif', 
    fontBody: 'font-serif',
    bg: 'bg-[#faf7f0]',
    text: 'text-[#1c1917]',
    accent: 'text-[#991b1b]',
    border: 'border-[#991b1b]',
    metaBg: 'bg-[#f5e6d3]',
    card: { 
      isDark: false,
      bg: 'bg-[#faf6ed]', 
      border: 'border-[#991b1b]', 
      text: 'text-[#292524]', 
      textMuted: 'text-[#78716c]',
      enemyBar: 'bg-[#991b1b]', 
      envBar: 'bg-[#065f46]',
      nameText: 'text-[#1c1917]',
      nameEnText: 'text-[#991b1b]',
      badgeTier: 'bg-[#e7dfcb] text-[#44403c] border border-[#d5cbaf]',
      badgeTypeEnemy: 'bg-[#fee2e2] text-[#7f1d1d] border border-[#fca5a5]',
      badgeTypeEnv: 'bg-[#d1fae5] text-[#064e3b] border border-[#a7f3d0]',
      badgeNpc: 'bg-[#fef3c7] text-[#78350f] border border-[#fcd34d]',
      avatarBorder: 'border-[#991b1b]',
      metaBox: 'bg-[#f0e8d6] border border-[#dfd3bc]',
      metaLabelEnemy: 'text-[#7f1d1d]',
      metaLabelEnv: 'text-[#064e3b]',
      metaText: 'text-[#292524]',
      statBox: 'bg-[#fffdf8] border border-[#d7cca2]',
      statItem: 'bg-[#f5efe1] border border-[#e4dbc8]',
      statLabel: 'text-[#78716c]',
      statVal: 'text-[#1c1917]',
      statHpVal: 'text-[#991b1b]',
      statStressVal: 'text-[#b45309]',
      hpDot: 'border-red-700 bg-red-700/20',
      stressDot: 'border-amber-700 bg-amber-700/20',
      attackName: 'text-[#991b1b]',
      attackTypeMagic: 'bg-purple-100 text-purple-900',
      attackTypePhys: 'bg-stone-200 text-stone-800',
      attackStats: 'text-[#991b1b]',
      traitName: 'text-[#1c1917]',
      traitDescBorder: 'border-[#991b1b]',
      traitFlavor: 'text-[#78716c]',
      traitPassive: 'bg-[#e7dfcb] text-[#292524]',
      traitAction: 'bg-[#ffedd5] text-[#9a3412]',
      traitSpotlight: 'bg-[#fee2e2] text-[#991b1b]',
      traitReaction: 'bg-[#e0e7ff] text-[#3730a3]',
      specialBox: 'bg-[#fefce8] border-2 border-dashed border-[#ca8a04]',
      specialTitle: 'text-[#991b1b]',
      specialTag: 'bg-[#fef08a] text-[#713f12]',
      specialText: 'text-[#292524]',
      countdownBox: 'bg-[#ecfdf5] border border-[#34d399]',
      countdownTitle: 'text-[#065f46]',
      countdownBadge: 'bg-[#047857] text-white',
      countdownText: 'text-[#064e3b]',
      gmQuestionBox: 'bg-[#fefce8] border border-[#fde047]',
      gmQuestionTitle: 'text-[#854d0e]',
      gmQuestionText: 'text-[#854d0e]'
    }
  },
  cyberpunk: {
    name: '电驭朋克 (Cyberpunk)',
    fontHead: 'font-sans',
    fontBody: 'font-sans',
    bg: 'bg-[#0a0a14]',
    text: 'text-[#f1f5f9]',
    accent: 'text-[#facc15]',
    border: 'border-[#facc15]',
    metaBg: 'bg-[#14142b]',
    card: { 
      isDark: true,
      bg: 'bg-[#0c0c1e]', 
      border: 'border-[#00e5ff]', 
      text: 'text-[#e2e8f0]', 
      textMuted: 'text-[#94a3b8]',
      enemyBar: 'bg-[#ff0055]', 
      envBar: 'bg-[#00e5ff]',
      nameText: 'text-[#f8fafc]',
      nameEnText: 'text-[#00e5ff]',
      badgeTier: 'bg-[#1b1b3a] text-[#00e5ff] border border-[#00e5ff]/50',
      badgeTypeEnemy: 'bg-[#4a0d24] text-[#ff99bb] border border-[#ff0055]/50',
      badgeTypeEnv: 'bg-[#083344] text-[#67e8f9] border border-[#00e5ff]/50',
      badgeNpc: 'bg-[#2e1065] text-[#c084fc] border border-[#a855f7]',
      avatarBorder: 'border-[#00e5ff]',
      metaBox: 'bg-[#12122c] border border-[#2d2d60]',
      metaLabelEnemy: 'text-[#ff6699]',
      metaLabelEnv: 'text-[#38bdf8]',
      metaText: 'text-[#e2e8f0]',
      statBox: 'bg-[#060612] border border-[#1e1e40]',
      statItem: 'bg-[#14142e] border border-[#282855]',
      statLabel: 'text-[#00e5ff]',
      statVal: 'text-[#f5e642]',
      statHpVal: 'text-[#ff0055]',
      statStressVal: 'text-[#f5e642]',
      hpDot: 'border-[#ff0055] bg-rose-500/30',
      stressDot: 'border-[#f5e642] bg-yellow-400/30',
      attackName: 'text-[#ff0055]',
      attackTypeMagic: 'bg-[#2e1065] text-[#c084fc]',
      attackTypePhys: 'bg-[#1e1e3f] text-[#cbd5e1]',
      attackStats: 'text-[#f5e642]',
      traitName: 'text-[#f8fafc]',
      traitDescBorder: 'border-[#00e5ff]',
      traitFlavor: 'text-[#94a3b8]',
      traitPassive: 'bg-[#1e1e3f] text-[#cbd5e1]',
      traitAction: 'bg-[#3f2b04] text-[#fde047]',
      traitSpotlight: 'bg-[#4c0519] text-[#fda4af]',
      traitReaction: 'bg-[#172554] text-[#93c5fd]',
      specialBox: 'bg-[#181328] border-2 border-dashed border-[#f5e642]',
      specialTitle: 'text-[#f5e642]',
      specialTag: 'bg-[#3b3207] text-[#fef08a]',
      specialText: 'text-[#f1f5f9]',
      countdownBox: 'bg-[#082030] border border-[#00e5ff]',
      countdownTitle: 'text-[#00e5ff]',
      countdownBadge: 'bg-[#00e5ff] text-[#0a0a14]',
      countdownText: 'text-[#bae6fd]',
      gmQuestionBox: 'bg-[#0e172a] border border-[#0284c7]',
      gmQuestionTitle: 'text-[#38bdf8]',
      gmQuestionText: 'text-[#38bdf8]'
    }
  },
  darkfantasy: {
    name: '深渊传奇 (Dark Fantasy)',
    fontHead: 'font-serif',
    fontBody: 'font-serif',
    bg: 'bg-[#140e06]',
    text: 'text-[#fef3c7]',
    accent: 'text-[#f59e0b]',
    border: 'border-[#b45309]',
    metaBg: 'bg-[#22170b]',
    card: { 
      isDark: true,
      bg: 'bg-[#1a140a]', 
      border: 'border-[#855a1e]', 
      text: 'text-[#e8d5b5]', 
      textMuted: 'text-[#a89270]',
      enemyBar: 'bg-[#dc2626]', 
      envBar: 'bg-[#16a34a]',
      nameText: 'text-[#fef3c7]',
      nameEnText: 'text-[#d97706]',
      badgeTier: 'bg-[#332210] text-[#fde68a] border border-[#5c4010]',
      badgeTypeEnemy: 'bg-[#450a0a] text-[#fecaca] border border-[#7f1d1d]',
      badgeTypeEnv: 'bg-[#14532d] text-[#bbf7d0] border border-[#166534]',
      badgeNpc: 'bg-[#3b2408] text-[#fde68a] border border-[#b45309]',
      avatarBorder: 'border-[#855a1e]',
      metaBox: 'bg-[#24190c] border border-[#4a3418]',
      metaLabelEnemy: 'text-[#f87171]',
      metaLabelEnv: 'text-[#86efac]',
      metaText: 'text-[#e8d5b5]',
      statBox: 'bg-[#0f0b05] border border-[#422e11]',
      statItem: 'bg-[#241a0d] border border-[#3d2b15]',
      statLabel: 'text-[#a89270]',
      statVal: 'text-[#fbbf24]',
      statHpVal: 'text-[#f87171]',
      statStressVal: 'text-[#fde047]',
      hpDot: 'border-red-400 bg-red-500/30',
      stressDot: 'border-yellow-400 bg-yellow-500/30',
      attackName: 'text-[#f87171]',
      attackTypeMagic: 'bg-[#2e1065] text-[#e9d5ff]',
      attackTypePhys: 'bg-[#2a1d0d] text-[#e8d5b5]',
      attackStats: 'text-[#fbbf24]',
      traitName: 'text-[#fef3c7]',
      traitDescBorder: 'border-[#855a1e]',
      traitFlavor: 'text-[#a89270]',
      traitPassive: 'bg-[#2a1d0d] text-[#e8d5b5]',
      traitAction: 'bg-[#451a03] text-[#fde047]',
      traitSpotlight: 'bg-[#4c0519] text-[#fecdd3]',
      traitReaction: 'bg-[#1e1b4b] text-[#c7d2fe]',
      specialBox: 'bg-[#291b0a] border-2 border-dashed border-[#d97706]',
      specialTitle: 'text-[#fbbf24]',
      specialTag: 'bg-[#451a03] text-[#fde68a]',
      specialText: 'text-[#fef3c7]',
      countdownBox: 'bg-[#142410] border border-[#4ade80]',
      countdownTitle: 'text-[#86efac]',
      countdownBadge: 'bg-[#15803d] text-white',
      countdownText: 'text-[#dcfce7]',
      gmQuestionBox: 'bg-[#22180c] border border-[#78531e]',
      gmQuestionTitle: 'text-[#fde68a]',
      gmQuestionText: 'text-[#fde68a]'
    }
  },
  blocky: {
    name: '砖石矿界 (Blocky)',
    fontHead: 'font-sans',
    fontBody: 'font-sans',
    bg: 'bg-[#262626]',
    text: 'text-[#f5f5f4]',
    accent: 'text-[#a3e635]',
    border: 'border-[#65a30d]',
    metaBg: 'bg-[#363636]',
    card: { 
      isDark: true,
      bg: 'bg-[#282828]', 
      border: 'border-[#65a30d]', 
      text: 'text-[#f0eee6]', 
      textMuted: 'text-[#a8a29e]',
      enemyBar: 'bg-[#ef4444]', 
      envBar: 'bg-[#84cc16]',
      nameText: 'text-[#fafaf9]',
      nameEnText: 'text-[#84cc16]',
      badgeTier: 'bg-[#3d3d3d] text-[#e7e5e4] border border-[#525252]',
      badgeTypeEnemy: 'bg-[#450a0a] text-[#fecaca] border border-[#7f1d1d]',
      badgeTypeEnv: 'bg-[#1a2e05] text-[#d9f99d] border border-[#365314]',
      badgeNpc: 'bg-[#292524] text-[#f5f5f4] border border-[#78716c]',
      avatarBorder: 'border-[#65a30d]',
      metaBox: 'bg-[#333333] border border-[#4d4d4d]',
      metaLabelEnemy: 'text-[#f87171]',
      metaLabelEnv: 'text-[#a3e635]',
      metaText: 'text-[#f0eee6]',
      statBox: 'bg-[#1a1a1a] border border-[#3f3f3f]',
      statItem: 'bg-[#333333] border border-[#4a4a4a]',
      statLabel: 'text-[#a8a29e]',
      statVal: 'text-[#f5f5f4]',
      statHpVal: 'text-[#f87171]',
      statStressVal: 'text-[#fde047]',
      hpDot: 'border-red-400 bg-red-500/30',
      stressDot: 'border-yellow-400 bg-yellow-500/30',
      attackName: 'text-[#ef4444]',
      attackTypeMagic: 'bg-[#2e1065] text-[#e9d5ff]',
      attackTypePhys: 'bg-[#3a3a3a] text-[#f5f5f4]',
      attackStats: 'text-[#a3e635]',
      traitName: 'text-[#fafaf9]',
      traitDescBorder: 'border-[#65a30d]',
      traitFlavor: 'text-[#a8a29e]',
      traitPassive: 'bg-[#3a3a3a] text-[#f5f5f4]',
      traitAction: 'bg-[#451a03] text-[#fde047]',
      traitSpotlight: 'bg-[#450a0a] text-[#fca5a5]',
      traitReaction: 'bg-[#1e1b4b] text-[#c7d2fe]',
      specialBox: 'bg-[#2e2b1e] border-2 border-dashed border-[#eab308]',
      specialTitle: 'text-[#fde047]',
      specialTag: 'bg-[#422006] text-[#fef08a]',
      specialText: 'text-[#fafaf9]',
      countdownBox: 'bg-[#1e2b1a] border border-[#84cc16]',
      countdownTitle: 'text-[#a3e635]',
      countdownBadge: 'bg-[#65a30d] text-white',
      countdownText: 'text-[#ecfccb]',
      gmQuestionBox: 'bg-[#202020] border border-[#57534e]',
      gmQuestionTitle: 'text-[#bef264]',
      gmQuestionText: 'text-[#bef264]'
    }
  },
  nightracer: {
    name: '极速深夜 (Night Racer)',
    fontHead: 'font-sans',
    fontBody: 'font-sans',
    bg: 'bg-[#080912]',
    text: 'text-[#f8fafc]',
    accent: 'text-[#ff6b00]',
    border: 'border-[#ff6b00]',
    metaBg: 'bg-[#121528]',
    card: { 
      isDark: true,
      bg: 'bg-[#080914]', 
      border: 'border-[#ff6b00]', 
      text: 'text-[#e2e8f0]', 
      textMuted: 'text-[#94a3b8]',
      enemyBar: 'bg-[#ff2a5f]', 
      envBar: 'bg-[#ff6b00]',
      nameText: 'text-[#f8fafc]',
      nameEnText: 'text-[#ff6b00]',
      badgeTier: 'bg-[#181d38] text-[#ffedd5] border border-[#2d325a]',
      badgeTypeEnemy: 'bg-[#4d091b] text-[#ffa3ba] border border-[#831843]',
      badgeTypeEnv: 'bg-[#4d2400] text-[#ffd099] border border-[#9a3412]',
      badgeNpc: 'bg-[#1e1b4b] text-[#c7d2fe] border border-[#6366f1]',
      avatarBorder: 'border-[#ff6b00]',
      metaBox: 'bg-[#0f1224] border border-[#262c52]',
      metaLabelEnemy: 'text-[#ff6b8b]',
      metaLabelEnv: 'text-[#ffaa40]',
      metaText: 'text-[#e2e8f0]',
      statBox: 'bg-[#05060d] border border-[#1e223d]',
      statItem: 'bg-[#101226] border border-[#262b4d]',
      statLabel: 'text-[#38bdf8]',
      statVal: 'text-[#ff9900]',
      statHpVal: 'text-[#ff3b6c]',
      statStressVal: 'text-[#ffb703]',
      hpDot: 'border-[#ff2a5f] bg-rose-500/30',
      stressDot: 'border-[#ffb703] bg-amber-500/30',
      attackName: 'text-[#ff2a5f]',
      attackTypeMagic: 'bg-[#1e1b4b] text-[#c7d2fe]',
      attackTypePhys: 'bg-[#181d38] text-[#cbd5e1]',
      attackStats: 'text-[#ff9900]',
      traitName: 'text-[#f8fafc]',
      traitDescBorder: 'border-[#ff6b00]',
      traitFlavor: 'text-[#94a3b8]',
      traitPassive: 'bg-[#181d38] text-[#cbd5e1]',
      traitAction: 'bg-[#422006] text-[#fed7aa]',
      traitSpotlight: 'bg-[#4c0519] text-[#fecdd3]',
      traitReaction: 'bg-[#082f49] text-[#bae6fd]',
      specialBox: 'bg-[#1f0d1a] border-2 border-dashed border-[#ff2a5f]',
      specialTitle: 'text-[#ff6b00]',
      specialTag: 'bg-[#3b0816] text-[#ffa3ba]',
      specialText: 'text-[#f1f5f9]',
      countdownBox: 'bg-[#0a1829] border border-[#38bdf8]',
      countdownTitle: 'text-[#38bdf8]',
      countdownBadge: 'bg-[#0284c7] text-white',
      countdownText: 'text-[#bae6fd]',
      gmQuestionBox: 'bg-[#101429] border border-[#ff6b00]',
      gmQuestionTitle: 'text-[#ffedd5]',
      gmQuestionText: 'text-[#ffedd5]'
    }
  },
};


// --- Utilities ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const cloneBlockWithNewIds = (block: any): any => {
  const cloned = JSON.parse(JSON.stringify(block));
  cloned.id = generateId();
  if (cloned.traits && Array.isArray(cloned.traits)) {
    cloned.traits = cloned.traits.map((t: any) => ({ ...t, id: generateId() }));
  }
  if (cloned.features && Array.isArray(cloned.features)) {
    cloned.features = cloned.features.map((f: any) => ({ ...f, id: generateId() }));
  }
  if (cloned.entries && Array.isArray(cloned.entries)) {
    cloned.entries = cloned.entries.map((e: any) => ({ ...e, id: generateId() }));
  }
  return cloned;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch(e) { 
      // silent fallback
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (e) {
        // silent catch
      }
    }
  }, [key, state]);

  return [state, setState];
}

const handleExportMarkdown = (data: ProjectData) => {
  let md = '';
  if (data.coverPage?.enabled) {
    md += `# ${data.coverPage.title || data.title}\n`;
    if (data.coverPage.subtitle) md += `*${data.coverPage.subtitle}*\n\n`;
    md += `**作者:** ${data.coverPage.authorLine || data.author}\n\n`;
    if (data.coverPage.footerText) md += `> ${data.coverPage.footerText}\n\n`;
    md += `---\n\n`;
  } else {
    md += `# ${data.title}\n**作者:** ${data.author}\n\n`;
  }
  if (data.settings.showConcept && data.concept) md += `*${data.concept}*\n\n`;
  if (data.settings.showIntroduction && data.introduction) md += `## 简介\n${data.introduction}\n\n`;
  if (data.settings.showSummary && data.summary) md += `## 概要\n${data.summary}\n\n`;
  if (data.settings.showPrologue && data.prologue) md += `## 序言\n${data.prologue}\n\n`;
  
  const tagMap: Record<string, string> = {
    critical: '关键成功',
    success: '成功',
    failure: '失败',
    hope: '希望',
    fear: '恐惧'
  };

  data.sections.forEach((s: DynamicSection) => {
    md += `${'#'.repeat(s.level + 1)} ${s.title}\n`;
    if (s.italicNote) md += `*${s.italicNote}*\n\n`;
    s.blocks.forEach((b: any) => {
      if (b.type === 'text') md += `${b.content}\n\n`;
      else if (b.type === 'subsection') md += `### ${b.title}\n\n`;
      else if (b.type === 'read_aloud') md += `> **朗读:** ${b.content}\n\n`;
      else if (b.type === 'callout') md += `> **[${b.title}]**\n> ${b.content}\n\n`;
      else if (b.type === 'enemy') md += `**敌人:** ${b.name} (难度 ${b.stats.difficulty})\n\n`;
      else if (b.type === 'environment') md += `**环境:** ${b.name} (难度 ${b.difficulty})\n\n`;
      else if (b.type === 'cyberware') {
        md += `### 赛博义体: ${b.name || '未命名义体'} ${b.tier ? `[${b.tier}]` : ''}\n`;
        const metaParts = [];
        if (b.cyberType) metaParts.push(`**类型:** ${b.cyberType}`);
        if (b.zone) metaParts.push(`**部位:** ${b.zone}`);
        if (b.slots) metaParts.push(`**槽位:** ${b.slots}`);
        if (metaParts.length > 0) md += `${metaParts.join(' | ')}\n\n`;
        if (b.restriction) md += `*限制:* ${b.restriction}\n\n`;
        if (b.effect) md += `**效果:**\n${b.effect}\n\n`;
        if (b.tag) md += `> **警告标签:** ${b.tag}\n\n`;
        if (b.compCost || b.surgCost) md += `*费用:* 元件 ${b.compCost || '未设定'} | 手术 ${b.surgCost || '未设定'}\n\n`;
        if (b.description) md += `*${b.description}*\n\n`;
      }
      else if (b.type === 'outcome') {
         if (b.entries) {
            b.entries.forEach((e: OutcomeEntry) => {
                const label = e.tags.map((t: string) => tagMap[t] || t).join('/');
                md += `**[${label}]**: ${e.content}\n\n`;
            });
         } else {
            // Legacy fallback
            if(b.hope) md += `**希望:** ${b.hope}\n\n`;
            if(b.fear) md += `**恐惧:** ${b.fear}\n\n`;
            if(b.failure) md += `**失败:** ${b.failure}\n\n`;
            if(b.critical) md += `**关键成功:** ${b.critical}\n\n`;
         }
      }
    });
  });

  if (data.creditsPage?.enabled) {
    if (data.creditsPage.creditsText) {
      md += `\n---\n\n## 鸣谢\n\n${data.creditsPage.creditsText}\n\n`;
    }
    if (data.creditsPage.copyright?.enabled !== false && data.creditsPage.copyright?.rawDeclarationText) {
      md += `\n---\n\n${data.creditsPage.copyright.rawDeclarationText}\n\n`;
    }
    if (data.creditsPage.footerText) md += `*${data.creditsPage.footerText}*\n\n`;
  } else if ((data.settings.showCopyright ?? true) && (data.copyrightPage?.enabled !== false)) {
    const rawCopyright = data.copyrightPage?.rawDeclarationText || 
      DPCGL_TEMPLATES[0].generateText({
        workTitle: data.copyrightPage?.workTitle || data.title,
        authorName: data.copyrightPage?.authorName || data.author,
        year: data.copyrightPage?.year || '2026',
        hasMod: !!data.copyrightPage?.hasModifications,
        modNote: data.copyrightPage?.modificationsNote,
        customNotice: data.copyrightPage?.customNotice
      });
    md += `\n---\n\n## DPCGL 版权与许可声明\n\n${rawCopyright}\n\n`;
  }
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title || 'project'}.md`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

// --- Error Boundary ---

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfcf8] p-4 font-sans text-stone-700">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-stone-200 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
               <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-stone-800">应用遇到了问题</h1>
              <p className="text-stone-500 leading-relaxed">这可能是由于本地缓存的数据与新版本不兼容，或者是部署环境的路径配置问题。</p>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-4 text-left overflow-auto max-h-40 border border-stone-100">
               <code className="text-xs text-stone-600 break-all font-mono">{this.state.error?.toString()}</code>
            </div>

            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }} 
              className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              清除缓存并重载
            </button>
            <p className="text-[10px] text-stone-400">如果点击后仍然白屏，请检查您的 GitHub Pages 路径配置 (homepage/base)。</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main App Component ---

const MainContent = () => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [projectData, setProjectData] = usePersistentState<ProjectData>('dh_project_v1', DEFAULT_PROJECT);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeSpecialPage, setActiveSpecialPage] = useState<'coverPage' | 'creditsPage' | 'copyrightPage' | null>(null);
  const [lastEditedSectionId, setLastEditedSectionId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<number | null>(null);
  const [autoSaveToast, setAutoSaveToast] = useState<string | null>(null);

  // Track last edited section ID so returning to outline centers on it
  useEffect(() => {
    if (activeSectionId) {
      setLastEditedSectionId(activeSectionId);
    }
  }, [activeSectionId]);

  // Ensure current project has a valid ID
  useEffect(() => {
    if (!projectData.id) {
      setProjectData(prev => ({
        ...prev,
        id: 'doc_' + Math.random().toString(36).substring(2, 10)
      }));
    }
  }, [projectData.id, setProjectData]);

  // Save current projectData into local saved library (same ID updates existing item)
  const saveToLibrary = useCallback((dataToSave?: ProjectData, isAuto = false, newTitleOverride?: string) => {
    const data = dataToSave || projectData;
    const targetId = data.id || ('doc_' + generateId());
    const title = newTitleOverride || data.title || '未命名战役';

    try {
      const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
      let library: SavedProject[] = raw ? JSON.parse(raw) : [];

      const updatedProjectData: ProjectData = {
        ...data,
        id: targetId,
        title: title,
      };

      const now = Date.now();
      const existingIndex = library.findIndex(item => item.id === targetId);

      const entry: SavedProject = {
        id: targetId,
        title: title,
        author: data.author,
        updatedAt: now,
        sectionCount: data.sections?.length || 0,
        concept: data.concept,
        data: updatedProjectData,
      };

      if (existingIndex >= 0) {
        library[existingIndex] = entry;
      } else {
        library.unshift(entry);
      }

      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(library));
      setLastAutoSaveTime(now);

      if (isAuto) {
        const timeStr = new Date(now).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        setAutoSaveToast(`5分钟自动保存成功 (${timeStr})`);
        setTimeout(() => setAutoSaveToast(null), 4000);
      }
    } catch (e) {
      console.error('Save to library failed:', e);
    }
  }, [projectData]);

  // 5-minute Auto-Save Timer
  useEffect(() => {
    const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

    const timer = setInterval(() => {
      saveToLibrary(undefined, true);
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [saveToLibrary]);

  const saveCurrentAsNew = useCallback((customTitle?: string) => {
    const newId = 'doc_' + generateId();
    const newTitle = customTitle || `${projectData.title} (副本)`;
    const newProj: ProjectData = {
      ...projectData,
      id: newId,
      title: newTitle,
    };
    setProjectData(newProj);
    saveToLibrary(newProj, false, newTitle);
  }, [projectData, saveToLibrary, setProjectData]);

  const overwriteCurrent = useCallback(() => {
    saveToLibrary(projectData, false);
  }, [projectData, saveToLibrary]);

  const updateField = useCallback((field: string, value: any) => {
    setProjectData((prev: any) => ({ ...prev, [field]: value }));
  }, [setProjectData]);
  
  const updateSettings = useCallback((key: keyof ProjectSettings, value: boolean) => {
    setProjectData((prev: any) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  }, [setProjectData]);

  const addSectionAt = useCallback((atIndex?: number, level: 1 | 2 | 3 | 4 | 5 = 3, columnMode?: 'full' | 'cols') => {
    const newSec: DynamicSection = { 
      id: generateId(), 
      title: "新章节", 
      level, 
      columnMode: columnMode || (level === 5 ? 'cols' : 'full'),
      blocks: [{ id: generateId(), type: 'text', content: "" }] 
    };
    setProjectData((prev: any) => {
      const newSections = [...prev.sections];
      if (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= newSections.length) {
        newSections.splice(atIndex, 0, newSec);
      } else {
        newSections.push(newSec);
      }
      return { ...prev, sections: newSections };
    });
    setActiveSectionId(newSec.id);
  }, [setProjectData]);

  const loadProject = useCallback((newData: ProjectData) => {
    setProjectData(newData);
    setActiveSectionId(null);
    setActiveSpecialPage(null);
    setViewMode('edit');
  }, [setProjectData]);

  const updateCoverPage = useCallback((updates: Partial<CoverPage>) => {
    setProjectData((prev: any) => ({
      ...prev,
      coverPage: { ...(prev.coverPage || { enabled: false }), ...updates }
    }));
  }, [setProjectData]);

  const updateCreditsPage = useCallback((updates: Partial<CreditsPage>) => {
    setProjectData((prev: any) => ({
      ...prev,
      creditsPage: { ...(prev.creditsPage || { enabled: false }), ...updates }
    }));
  }, [setProjectData]);

  const updateCopyrightPage = useCallback((updates: Partial<CopyrightSettings>) => {
    setProjectData((prev: any) => {
      const curCopyright = prev.copyrightPage || prev.creditsPage?.copyright || {
        enabled: true,
        template: 'dh_bilingual',
        year: '2026',
        showDPCGLLogo: true,
        dpcglLogo: 'dh_bottle_white_color'
      };
      const merged = { ...curCopyright, ...updates };
      return {
        ...prev,
        copyrightPage: merged,
        creditsPage: prev.creditsPage ? { ...prev.creditsPage, copyright: merged } : prev.creditsPage
      };
    });
  }, [setProjectData]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#fdfcf8] text-stone-800 font-sans flex flex-col print:h-auto print:w-auto print:bg-white print:overflow-visible">
      <Navbar 
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentData={projectData}
        updateField={updateField}
        loadProject={loadProject}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onSaveCurrent={overwriteCurrent}
        lastAutoSaveTime={lastAutoSaveTime}
      />

      {autoSaveToast && (
        <div className="fixed top-18 right-6 z-[90] bg-stone-900/90 backdrop-blur-md text-amber-300 text-xs px-4 py-2 rounded-xl shadow-lg border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>{autoSaveToast}</span>
        </div>
      )}

      <SavedLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        currentData={projectData}
        onLoadProject={loadProject}
        onSaveCurrentAsNew={saveCurrentAsNew}
        onOverwriteCurrent={overwriteCurrent}
        lastAutoSaveTime={lastAutoSaveTime}
      />

      <div className="flex-1 flex overflow-hidden relative print:block print:h-auto print:overflow-visible">
        {viewMode === 'preview' ? (
          <div id="main-scroll" className="flex-1 overflow-y-auto bg-stone-200/50 p-4 md:p-8 scroll-smooth print:p-0 print:m-0 print:bg-white print:overflow-visible print:h-auto print:block">
            <PreviewView data={projectData} activeSectionId={activeSectionId} />
          </div>
        ) : activeSpecialPage === 'coverPage' ? (
          <CoverPageEditor
            coverPage={projectData.coverPage || { enabled: false }}
            projectTitle={projectData.title}
            projectAuthor={projectData.author}
            theme={projectData.theme}
            updateCoverPage={updateCoverPage}
            goBack={() => setActiveSpecialPage(null)}
          />
        ) : activeSpecialPage === 'copyrightPage' ? (
          <CopyrightPageEditor
            copyrightPage={projectData.copyrightPage || projectData.creditsPage?.copyright || {
              enabled: true,
              template: 'dh_bilingual',
              year: '2026',
              showDPCGLLogo: true,
              dpcglLogo: 'dh_bottle_white_color'
            }}
            showCopyrightSetting={projectData.settings.showCopyright ?? true}
            updateSettings={updateSettings}
            updateCopyrightPage={updateCopyrightPage}
            goBack={() => setActiveSpecialPage(null)}
            projectTitle={projectData.title}
            projectAuthor={projectData.author}
            theme={projectData.theme}
          />
        ) : activeSpecialPage === 'creditsPage' ? (
          <CreditsPageEditor
            creditsPage={projectData.creditsPage || { enabled: false }}
            updateCreditsPage={updateCreditsPage}
            goBack={() => setActiveSpecialPage(null)}
            projectTitle={projectData.title}
            projectAuthor={projectData.author}
          />
        ) : activeSectionId ? (
          <SectionDetailView 
            projectData={projectData}
            sections={projectData.sections} 
            updateSection={(id: string, u: any) => updateField('sections', projectData.sections.map(s => s.id === id ? { ...s, ...u } : s))}
            updateAllSections={(newSections: DynamicSection[]) => updateField('sections', newSections)}
            activeId={activeSectionId} 
            goBack={() => setActiveSectionId(null)}
            onAddSectionAt={addSectionAt}
          />
        ) : (
          <Overview 
            data={projectData} 
            updateField={updateField} 
            updateSettings={updateSettings}
            onSelect={setActiveSectionId} 
            onAdd={(level?: 1 | 2 | 3 | 4 | 5) => addSectionAt(undefined, level || 3)}
            onAddSectionAt={addSectionAt}
            lastActiveId={lastEditedSectionId}
            onEditCoverPage={() => setActiveSpecialPage('coverPage')}
            onEditCopyrightPage={() => setActiveSpecialPage('copyrightPage')}
            onEditCreditsPage={() => setActiveSpecialPage('creditsPage')}
          />
        )}
      </div>

      <div className="fixed bottom-0 right-4 z-[100] pointer-events-none print:hidden">
        <div className="bg-stone-900/80 backdrop-blur-sm text-stone-300 text-[10px] px-3 py-1.5 rounded-t-lg shadow-lg hover:bg-stone-900 transition-all duration-300 pointer-events-auto select-text cursor-default font-medium tracking-wide border-t border-x border-stone-700">
          不咕鸟（基德）  创作群：261751459  QQ：442348584  WX：jeffyuyi
        </div>
      </div>
    </div>
  );
};

export function CampaignEditorApp() {
  return (
    <ErrorBoundary>
      <MainContent />
    </ErrorBoundary>
  );
}

export default CampaignEditorApp;

// --- Layout Components ---

const Navbar = React.memo(({ viewMode, setViewMode, currentData, updateField, loadProject, onOpenLibrary, onSaveCurrent, lastAutoSaveTime }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(currentData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.title || 'project'}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.sections) { 
          loadProject(json); 
          alert("项目导入成功！"); 
        } else if (json && (json.type === 'cyberware' || (json.data && json.data.type === 'cyberware'))) {
          // 单张卡牌工坊赛博义体卡
          const cd = json.data || json;
          const cyberBlock: CyberwareBlock = {
            id: generateId(),
            type: 'cyberware',
            name: cd.name || '赛博义体',
            tier: cd.tier || 'T1',
            cyberType: cd.cyberType || '植入体 (Implant)',
            zone: cd.zone || '',
            slots: cd.slots || '1',
            restriction: cd.restriction || '',
            effect: cd.effect || '',
            tag: cd.tag || '',
            compCost: cd.compCost || '',
            surgCost: cd.surgCost || '',
            description: cd.description || '',
            creator: cd.creator || 'GM',
            owner: cd.owner || '-'
          };
          const sections = currentData.sections ? [...currentData.sections] : [];
          if (sections.length > 0) {
            sections[0] = {
              ...sections[0],
              blocks: [...sections[0].blocks, cyberBlock]
            };
            loadProject({ ...currentData, sections });
            alert(`已识别来自《卡牌工坊V3》的赛博义体「${cyberBlock.name}」，已成功导入到章节「${sections[0].title}」中！`);
          } else {
            const newSec: DynamicSection = {
              id: generateId(),
              title: "赛博装备与义体",
              level: 3,
              blocks: [cyberBlock]
            };
            loadProject({ ...currentData, sections: [newSec] });
            alert(`已识别来自《卡牌工坊V3》的赛博义体「${cyberBlock.name}」，已新建章节并导入！`);
          }
        } else if (Array.isArray(json)) {
          // 卡牌库数组
          const cyberBlocks: CyberwareBlock[] = [];
          json.forEach((item: any) => {
            const cd = item.data || item;
            if (cd && (cd.type === 'cyberware' || cd.cyberType || cd.surgCost)) {
              cyberBlocks.push({
                id: generateId(),
                type: 'cyberware',
                name: cd.name || '赛博义体',
                tier: cd.tier || 'T1',
                cyberType: cd.cyberType || '植入体 (Implant)',
                zone: cd.zone || '',
                slots: cd.slots || '1',
                restriction: cd.restriction || '',
                effect: cd.effect || '',
                tag: cd.tag || '',
                compCost: cd.compCost || '',
                surgCost: cd.surgCost || '',
                description: cd.description || '',
                creator: cd.creator || 'GM',
                owner: cd.owner || '-'
              });
            }
          });
          if (cyberBlocks.length > 0) {
            const sections = currentData.sections ? [...currentData.sections] : [];
            if (sections.length > 0) {
              sections[0] = {
                ...sections[0],
                blocks: [...sections[0].blocks, ...cyberBlocks]
              };
              loadProject({ ...currentData, sections });
              alert(`已成功从卡牌工坊库导入 ${cyberBlocks.length} 张赛博义体卡牌到章节「${sections[0].title}」中！`);
            } else {
              const newSec: DynamicSection = {
                id: generateId(),
                title: "赛博装备与义体库",
                level: 3,
                blocks: cyberBlocks
              };
              loadProject({ ...currentData, sections: [newSec] });
              alert(`已成功从卡牌工坊库导入 ${cyberBlocks.length} 张赛博义体卡牌！`);
            }
          } else {
            alert("未能识别出有效的战役项目或赛博卡牌数据。");
          }
        } else { 
          alert("无效的项目或卡牌文件格式。"); 
        }
      } catch (err) { console.error(err); alert("文件解析失败。"); }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateField('backgroundImage', base64);
      alert('背景图已更新');
    } catch (err) { console.error(err); alert("图片读取失败"); }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  const handleExportHTML = () => {
    if (viewMode !== 'preview') { alert("请先切换到预览模式 (Preview) 以导出 HTML。"); return; }
    const contentElement = document.getElementById('preview-content');
    if (!contentElement) { alert("无法找到预览内容，请稍后重试。"); return; }
    const coverElement = document.getElementById('preview-cover-page');
    const copyrightElement = document.getElementById('preview-copyright-page');
    const creditsElement = document.getElementById('preview-credits-page');

    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${currentData.title || '战役文档'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['"Noto Serif SC"', '"Merriweather"', 'serif'],
            sans: ['"Noto Sans SC"', '"Inter"', 'sans-serif'],
          },
          colors: {
            stone: { 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917' },
            amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 1000: '#b45309' },
            emerald: { 50: '#ecfdf5', 200: '#a7f3d0', 700: '#047857', 800: '#065f46', 900: '#064e3b' }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700;900&family=Inter:wght@400;500;600&family=Merriweather:ital,wght@0,400;0,700;0,900;1,400&display=swap" rel="stylesheet">
  <style>
     @media print { @page { margin: 0; size: auto; } body { -webkit-print-color-adjust: exact; } }
     body { background-color: #f5f5f4; min-height: 100vh; padding: 40px; }
     #preview-wrapper { margin: 0 auto; display: flex; flex-direction: column; gap: 24px; align-items: center; }
  </style>
</head>
<body>
  <div id="preview-wrapper" style="max-width: 210mm;">
    ${coverElement ? coverElement.outerHTML : ''}
    ${contentElement.outerHTML}
    ${copyrightElement ? copyrightElement.outerHTML : ''}
    ${creditsElement ? creditsElement.outerHTML : ''}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.title || 'project'}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  };

  return (
    <nav className="sticky top-0 z-50 bg-stone-900 text-stone-100 shadow-lg h-16 flex items-center px-4 justify-between print:hidden gap-4">
      <input type="file" ref={fileInputRef} onChange={handleImportJSON} className="hidden" accept=".json" />
      <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
      
      {/* Left: Logo & Menu */}
      <div className="flex items-center gap-3">
        <a 
          href="/" 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700"
          title="返回主站门户"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">主站门户</span>
        </a>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="group relative flex items-center justify-center p-1.5 rounded-xl transition-all hover:bg-stone-800 outline-none"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-lg flex items-center justify-center text-white ring-1 ring-stone-900 group-focus:ring-amber-500/50">
                <LayoutTemplate className="w-5 h-5" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-3 w-64 bg-white text-stone-800 rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-[70] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">作品库与存档</div>
                    <button onClick={() => { onOpenLibrary(); setIsMenuOpen(false); }} className={Styles.toolBtn}>
                        <Folder className="w-4 h-4 text-amber-600" />
                        <span>本地作品库 / 存档</span>
                    </button>
                    <button onClick={() => { onSaveCurrent(); setIsMenuOpen(false); }} className={Styles.toolBtn}>
                        <Save className="w-4 h-4 text-emerald-600" />
                        <span>保存当前作品</span>
                    </button>

                    <div className="my-1 border-t border-stone-100"></div>

                    <div className="px-3 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">文件操作</div>
                    <button onClick={() => { fileInputRef.current?.click(); setIsMenuOpen(false); }} className={Styles.toolBtn}>
                        <Upload className="w-4 h-4 text-stone-400" /> 
                        <span>导入项目 <span className="text-xs text-stone-400 font-normal ml-1">(.json)</span></span>
                    </button>
                    <button onClick={() => { handleExportJSON(); setIsMenuOpen(false); }} className={Styles.toolBtn}>
                        <FileJson className="w-4 h-4 text-stone-400" /> 
                        <span>导出项目 <span className="text-xs text-stone-400 font-normal ml-1">(.json)</span></span>
                    </button>
                    
                    <div className="my-1 border-t border-stone-100"></div>
                    
                    <div className="px-3 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">导出文档</div>
                    <button onClick={() => { handleExportMarkdown(currentData); setIsMenuOpen(false); }} className={Styles.toolBtn}>
                        <Download className="w-4 h-4 text-stone-400" /> 导出 Markdown
                    </button>
                    <button 
                      onClick={() => { handleExportHTML(); setIsMenuOpen(false); }} 
                      disabled={viewMode !== 'preview'}
                      className={`${Styles.toolBtn} ${viewMode !== 'preview' ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-stone-600' : ''}`}
                    >
                        <FileCode className="w-4 h-4 text-stone-400" /> 
                        <div className="flex flex-col text-left leading-tight">
                          <span>导出 HTML</span>
                          <span className="text-[10px] text-stone-400 font-normal">需在预览模式下使用</span>
                        </div>
                    </button>

                    <div className="my-1 border-t border-stone-100"></div>
                    
                    <div className="px-3 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">资源设置</div>
                    <button onClick={() => { bgInputRef.current?.click(); setIsMenuOpen(false); }} className={Styles.toolBtn}>
                        <ImagePlus className="w-4 h-4 text-stone-400" /> 上传背景图
                    </button>
                </div>
            </div>
          )}
        </div>
        <div className="hidden md:block">
          <h1 className="font-serif font-bold text-lg tracking-wide text-stone-200">不咕鸟匕心写作模板</h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
         {/* Library Button */}
         <button 
            onClick={onOpenLibrary}
            className="flex items-center gap-1.5 bg-amber-700/80 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer border border-amber-600/50"
            title="打开本地作品库 (按ID进行存档管理)"
         >
            <Folder className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">作品库</span>
         </button>

         {lastAutoSaveTime && (
            <span className="text-[10px] text-amber-400/90 font-mono hidden lg:inline bg-stone-800/80 px-2 py-1 rounded border border-stone-700/50" title="上次自动保存时间 (每5分钟自动保存)">
               已自动保存 {new Date(lastAutoSaveTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
            </span>
         )}

         {/* Theme Selector */}
         <div className="flex items-center gap-2 bg-stone-800 rounded-lg p-1.5 px-3 border border-stone-700/50 hover:border-stone-600 transition-colors">
            <Palette className="w-4 h-4 text-stone-400" />
            <select 
               className="bg-transparent text-xs text-stone-300 font-bold outline-none cursor-pointer hover:text-white border-none focus:ring-0 w-28 appearance-none"
               value={currentData.theme}
               onChange={(e) => updateField('theme', e.target.value)}
            >
               {Object.entries(THEMES).map(([k, v]: any) => <option key={k} value={k} className="bg-stone-800 text-stone-300">{v.name}</option>)}
            </select>
         </div>

         <div className="h-6 w-px bg-stone-800"></div>

         {/* View Toggle */}
         <div className="flex bg-stone-800 p-1 rounded-lg gap-1 border border-stone-700/50">
            <button onClick={() => setViewMode('edit')} title="编辑视图" className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${viewMode==='edit'?'bg-stone-700 text-white shadow-sm ring-1 ring-stone-600':'text-stone-400 hover:text-stone-200 hover:bg-stone-800'}`}>
               <Edit3 className="w-3.5 h-3.5" />
               <span className="text-xs font-bold hidden md:inline">编辑</span>
            </button>
            <button onClick={() => setViewMode('preview')} title="预览视图" className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${viewMode==='preview'?'bg-amber-700 text-white shadow-sm ring-1 ring-amber-600':'text-stone-400 hover:text-stone-200 hover:bg-stone-800'}`}>
               <Eye className="w-3.5 h-3.5" />
               <span className="text-xs font-bold hidden md:inline">预览</span>
            </button>
         </div>
      </div>
    </nav>
  );
});

// --- Overview Components ---

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!checked)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border w-full justify-between group ${checked ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'}`}>
    <span>{label}</span>
    {checked ? <ToggleRight className="w-4 h-4 text-amber-500" /> : <ToggleLeft className="w-4 h-4 text-stone-300 group-hover:text-stone-400" />}
  </button>
);

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-stone-50/50 hover:bg-stone-50 transition-colors">
        <div className="flex items-center gap-2 font-bold text-stone-700 text-sm">
          {Icon && <Icon className="w-4 h-4 text-stone-400" />}
          {title}
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
      </button>
      {isOpen && <div className="p-5 border-t border-stone-100">{children}</div>}
    </div>
  );
};

const Overview = React.memo(({ data, updateField, updateSettings, onSelect, onAdd, onAddSectionAt, lastActiveId, onEditCoverPage, onEditCopyrightPage, onEditCreditsPage }: any) => {
  useEffect(() => {
    if (lastActiveId) {
      const timer = setTimeout(() => {
        const target = document.getElementById(`overview-section-${lastActiveId}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
          setTimeout(() => {
            target.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
          }, 1800);
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [lastActiveId]);

  const isCopyrightActive = (data.settings.showCopyright ?? true) && (data.copyrightPage?.enabled ?? true);
  const currentCopyrightTmpl = DPCGL_TEMPLATES.find(t => t.id === (data.copyrightPage?.template || 'dh_bilingual'));

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-12 max-w-5xl mx-auto w-full space-y-8 pb-32 scroll-smooth">
    
    {/* Title Area */}
    <div className="text-center space-y-4 py-8">
       <input 
        className="text-4xl md:text-5xl font-serif font-black text-center bg-transparent border-none outline-none placeholder:text-stone-200 text-stone-800 w-full"
        value={data.title}
        onChange={e => updateField('title', e.target.value)}
        placeholder="输入战役标题"
       />
       <div className="flex items-center justify-center gap-2 text-stone-500">
         <span className="text-sm font-medium">By</span>
         <input 
           className="bg-transparent border-b border-transparent hover:border-stone-300 focus:border-amber-400 outline-none text-center w-32 text-sm font-medium transition-colors"
           value={data.author}
           onChange={e => updateField('author', e.target.value)}
         />
       </div>
    </div>

    {/* Setup Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="space-y-6">
        <CollapsibleSection title="战役元数据" icon={BookOpen} defaultOpen={true}>
          <div className="space-y-4">
            {data.settings.showConcept && (
              <SmartTextarea 
                label="核心概念 (High Concept)" 
                value={data.concept} 
                onChangeValue={v => updateField('concept', v)} 
                minRows={3} 
              />
            )}
             <div className="grid grid-cols-2 gap-4">
                {data.settings.showComplexity && (
                   <div className="space-y-1">
                      <label className={Styles.label}>复杂度</label>
                      <div className="flex gap-1 py-1">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => updateField('complexity', n)} className={`transition-all hover:scale-110 ${data.complexity >= n ? 'text-amber-500' : 'text-stone-200'}`}><Star className="w-5 h-5 fill-current" /></button>
                        ))}
                      </div>
                   </div>
                )}
                {data.settings.showLevelRange && (
                   <div className="space-y-1"><label className={Styles.label}>适用等级</label><input className={Styles.modernInput} value={data.levelRange} onChange={e => updateField('levelRange', e.target.value)} /></div>
                )}
             </div>
             {data.settings.showToneThemes && (
               <div className="space-y-3 pt-2">
                  <div className="space-y-1"><label className={Styles.label}>基调</label><input className={Styles.modernInput} value={data.tone} onChange={e => updateField('tone', e.target.value)} /></div>
                  <div className="space-y-1"><label className={Styles.label}>主题</label><input className={Styles.modernInput} value={data.themes} onChange={e => updateField('themes', e.target.value)} /></div>
                  <div className="space-y-1"><label className={Styles.label}>灵感</label><input className={Styles.modernInput} value={data.inspiration} onChange={e => updateField('inspiration', e.target.value)} /></div>
               </div>
             )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="版面显示设置" icon={Layout}>
          <p className="text-xs text-stone-400 mb-4">选择要在预览文档中显示的元数据板块：</p>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="1. 核心概念" checked={data.settings.showConcept} onChange={v => updateSettings('showConcept', v)} />
            <Toggle label="2. 复杂度" checked={data.settings.showComplexity} onChange={v => updateSettings('showComplexity', v)} />
            <Toggle label="3. 适用等级" checked={data.settings.showLevelRange} onChange={v => updateSettings('showLevelRange', v)} />
            <Toggle label="4. 简介" checked={data.settings.showIntroduction} onChange={v => updateSettings('showIntroduction', v)} />
            <Toggle label="5. 概要" checked={data.settings.showSummary} onChange={v => updateSettings('showSummary', v)} />
            <Toggle label="6. 序言" checked={data.settings.showPrologue} onChange={v => updateSettings('showPrologue', v)} />
            <Toggle label="7. 基调/主题" checked={data.settings.showToneThemes} onChange={v => updateSettings('showToneThemes', v)} />
            <Toggle label="8. DPCGL 版权声明" checked={data.settings.showCopyright ?? true} onChange={v => updateSettings('showCopyright', v)} />
          </div>
        </CollapsibleSection>
      </div>

      <div className="space-y-6">
         <CollapsibleSection title="前言文本" icon={FileText} defaultOpen={true}>
           <div className="space-y-4">
             {data.settings.showIntroduction && (
               <SmartTextarea 
                 label="简介 (Introduction)" 
                 value={data.introduction} 
                 onChangeValue={v => updateField('introduction', v)} 
                 minRows={5} 
               />
             )}
             {data.settings.showSummary && (
               <SmartTextarea 
                 label="概要 (Summary)" 
                 value={data.summary} 
                 onChangeValue={v => updateField('summary', v)} 
                 minRows={3} 
               />
             )}
             {data.settings.showPrologue && (
               <SmartTextarea 
                 label="序言 (Prologue)" 
                 value={data.prologue} 
                 onChangeValue={v => updateField('prologue', v)} 
                 minRows={5} 
               />
             )}
           </div>
         </CollapsibleSection>
      </div>
    </div>

    {/* Section List */}
    <div className="pt-8">

      {/* Cover Page Card */}
      <div
        onClick={onEditCoverPage}
        className="mb-4 rounded-xl border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-4 flex items-center gap-4 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        title="编辑封面页"
      >
        <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-lg shadow-sm ${ data.coverPage?.enabled ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600' }`}>
          🎨
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">封面页</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ data.coverPage?.enabled ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500' }`}>
              { data.coverPage?.enabled ? '已启用' : '未启用' }
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5 truncate">
            { data.coverPage?.enabled
              ? `标题: ${data.coverPage?.title || data.title} · 作者: ${data.coverPage?.authorLine || data.author}`
              : '添加封面图、标题、图标与作者信息，打造精美首页'
            }
          </p>
        </div>
        <button className="flex items-center gap-1.5 bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all shadow-sm">
          编辑 <ArrowLeft className="w-3 h-3 rotate-180" />
        </button>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-amber-600" /> 章节结构与大纲
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            支持 H1~H5 5级结构树，可灵活选择单栏/双栏排版模式，通过 ↑↓ 快速调序或插入子章节。
          </p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => (onAddSectionAt ? onAddSectionAt(undefined, 1) : onAdd(1))} className={Styles.secondaryBtn}>
             <Plus className="w-4 h-4 text-amber-700" /> + 新建大章节 (H1)
           </button>
           <button onClick={() => (onAddSectionAt ? onAddSectionAt(undefined, 3) : onAdd(3))} className={Styles.primaryBtn}>
             <Plus className="w-4 h-4" /> + 新建子章节
           </button>
        </div>
      </div>

      <div className="space-y-3">
         {data.sections.map((s: any, i: number) => {
            const level = s.level || 3;
            const indentClass = 
               level === 1 ? 'ml-0 font-bold border-l-4 border-amber-500 bg-white' : 
               level === 2 ? 'ml-3 md:ml-6 border-l-4 border-stone-400 bg-stone-50/80' : 
               level === 3 ? 'ml-6 md:ml-12 border-l-2 border-teal-500 bg-teal-50/30' :
               level === 4 ? 'ml-9 md:ml-18 border-l-2 border-indigo-400 bg-indigo-50/20' :
               'ml-12 md:ml-24 border-l border-stone-300 bg-stone-50/10';

            const effectiveColMode = s.columnMode || (level === 5 ? 'cols' : 'full');

            return (
               <div 
                  key={s.id} 
                  id={`overview-section-${s.id}`}
                  onClick={() => onSelect(s.id)} 
                  className={`rounded-xl border border-stone-200/80 p-3 md:p-4 flex flex-wrap md:flex-nowrap items-center gap-3 transition-all hover:border-amber-400 hover:shadow-md cursor-pointer group relative ${indentClass}`}
               >
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5" onClick={e => e.stopPropagation()}>
                     <button
                        onClick={() => {
                           if (i > 0) {
                              const newSecs = [...data.sections];
                              [newSecs[i], newSecs[i - 1]] = [newSecs[i - 1], newSecs[i]];
                              updateField('sections', newSecs);
                           }
                        }}
                        disabled={i === 0}
                        className={`p-1 rounded transition-colors ${i === 0 ? 'text-stone-200 cursor-not-allowed' : 'text-stone-400 hover:bg-stone-200 hover:text-stone-700 cursor-pointer'}`}
                        title="向上移动章节"
                     >
                        <MoveUp size={13} />
                     </button>
                     <button
                        onClick={() => {
                           if (i < data.sections.length - 1) {
                              const newSecs = [...data.sections];
                              [newSecs[i], newSecs[i + 1]] = [newSecs[i + 1], newSecs[i]];
                              updateField('sections', newSecs);
                           }
                        }}
                        disabled={i === data.sections.length - 1}
                        className={`p-1 rounded transition-colors ${i === data.sections.length - 1 ? 'text-stone-200 cursor-not-allowed' : 'text-stone-400 hover:bg-stone-200 hover:text-stone-700 cursor-pointer'}`}
                        title="向下移动章节"
                     >
                        <MoveDown size={13} />
                     </button>
                  </div>

                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-stone-100 text-stone-500 rounded-md font-serif text-sm font-black border border-stone-200">
                     {i + 1}
                  </div>

                  <div className="flex-1 min-w-0 py-0.5">
                     <div className="font-bold text-stone-800 text-base md:text-lg truncate group-hover:text-amber-700 transition-colors flex items-center gap-2">
                        <span>{s.title || "未命名章节"}</span>
                        {s.italicNote && <span className="text-xs font-normal italic text-stone-400 truncate">({s.italicNote})</span>}
                     </div>
                     <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                        {/* Direct Level Selector (H1 - H5) */}
                        <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded border border-stone-200" onClick={e => e.stopPropagation()}>
                           {[ { l: 1, label: 'H1 卷' }, { l: 2, label: 'H2 幕' }, { l: 3, label: 'H3 场' }, { l: 4, label: 'H4 节' }, { l: 5, label: 'H5 附' } ].map(opt => (
                              <button
                                 key={opt.l}
                                 onClick={() => {
                                    const newSecs = data.sections.map((sec: any) => sec.id === s.id ? { ...sec, level: opt.l } : sec);
                                    updateField('sections', newSecs);
                                 }}
                                 className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${level === opt.l ? 'bg-amber-700 text-white shadow-xs' : 'text-stone-500 hover:bg-stone-200'}`}
                              >
                                 {opt.label}
                              </button>
                           ))}
                        </div>

                        {/* Direct Column Mode Toggle */}
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              const newMode = effectiveColMode === 'full' ? 'cols' : 'full';
                              const newSecs = data.sections.map((sec: any) => sec.id === s.id ? { ...sec, columnMode: newMode } : sec);
                              updateField('sections', newSecs);
                           }}
                           className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 transition-all cursor-pointer ${effectiveColMode === 'cols' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'}`}
                           title="切换单栏全宽 / 双列分栏排版"
                        >
                           {effectiveColMode === 'cols' ? '📰 双列分栏' : '📄 单栏全宽'}
                        </button>

                        <span className="text-xs text-stone-400 flex items-center gap-1">
                           <AlignJustify className="w-3 h-3" /> {s.blocks.length} 区块
                        </span>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-90 md:opacity-0 group-hover:opacity-100 transition-all">
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           if (onAddSectionAt) {
                              onAddSectionAt(i + 1, Math.min((level + 1) as any, 5));
                           }
                        }}
                        className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-1 rounded text-xs font-bold transition-colors cursor-pointer"
                        title="在此章节下方插入子章节"
                     >
                        <Plus size={12} /> 插入子章节
                     </button>
                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           if(confirm('确定删除此章节？')) updateField('sections', data.sections.filter((x:any)=>x.id!==s.id));
                        }}
                        className={Styles.deleteBtn}
                        title="删除章节"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <button className="flex items-center gap-1 bg-stone-800 text-white border border-transparent px-3 py-1 rounded-lg text-xs font-bold hover:bg-stone-700 transition-colors shadow-sm">
                        编辑 <ArrowLeft className="w-3 h-3 rotate-180" />
                     </button>
                  </div>
               </div>
            );
         })}
         {data.sections.length === 0 && (
            <div className="text-center py-16 text-stone-300 border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
               <p className="mb-3 font-medium">当前战役还没有建立任何章节。</p>
               <button onClick={() => (onAddSectionAt ? onAddSectionAt(0, 1) : onAdd(1))} className={Styles.primaryBtn}>
                  <Plus className="w-4 h-4" /> 创建第一个大章节
               </button>
            </div>
         )}
      </div>

      {/* DPCGL Copyright Page Card (Standalone) */}
      <div
        onClick={onEditCopyrightPage}
        className="mt-6 rounded-xl border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50/70 to-orange-50/40 p-4 flex items-center gap-4 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        title="编辑 DPCGL 版权与出版许可声明页"
      >
        <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-lg shadow-sm ${ isCopyrightActive ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-600' }`}>
          ⚖️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">DPCGL 版权与许可声明页</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ isCopyrightActive ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500' }`}>
              { isCopyrightActive ? '已启用 (即使无封面尾页亦独立展示)' : '未启用' }
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-amber-800 border border-amber-200">
              {currentCopyrightTmpl?.badge || 'DPCGL 2.0'}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5 truncate">
            { data.copyrightPage?.rawDeclarationText
              ? data.copyrightPage.rawDeclarationText.substring(0, 75) + '...'
              : '独立配置 DPCGL 法律条款、原创权利声明、修改说明及官方合规徽标（即使无封面尾页也可独立展示）'
            }
          </p>
        </div>
        <button className="flex items-center gap-1.5 bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all shadow-sm">
          编辑 <ArrowLeft className="w-3 h-3 rotate-180" />
        </button>
      </div>

      {/* Credits Page Card */}
      <div
        onClick={onEditCreditsPage}
        className="mt-4 rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-4 flex items-center gap-4 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group"
        title="编辑尾页鸣谢"
      >
        <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-lg shadow-sm ${ data.creditsPage?.enabled ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-600' }`}>
          🙏
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">尾页鸣谢</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ data.creditsPage?.enabled ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-500' }`}>
              { data.creditsPage?.enabled ? '已启用' : '未启用' }
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5 truncate">
            { data.creditsPage?.enabled && data.creditsPage?.creditsText
              ? data.creditsPage.creditsText.substring(0, 60) + (data.creditsPage.creditsText.length > 60 ? '...' : '')
              : '添加背景图与鸣谢文本，为作品画上完美句号'
            }
          </p>
        </div>
        <button className="flex items-center gap-1.5 bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-all shadow-sm">
          编辑 <ArrowLeft className="w-3 h-3 rotate-180" />
        </button>
      </div>

    </div>
  </main>
  );
});

// --- Cover Page & Credits Page Editors ---

const CoverPageEditor: React.FC<{
  coverPage: CoverPage;
  projectTitle: string;
  projectAuthor: string;
  theme: ThemeType;
  updateCoverPage: (updates: Partial<CoverPage>) => void;
  goBack: () => void;
}> = ({ coverPage, projectTitle, projectAuthor, updateCoverPage, goBack }) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const customLogoInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { updateCoverPage({ coverImage: await fileToBase64(file) }); } catch { alert('图片读取失败'); }
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { updateCoverPage({ iconImage: await fileToBase64(file) }); } catch { alert('图片读取失败'); }
    if (iconInputRef.current) iconInputRef.current.value = '';
  };

  const handleCustomLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateCoverPage({ dpcglLogo: 'custom', customLogoUrl: base64 });
    } catch { alert('图片读取失败'); }
    if (customLogoInputRef.current) customLogoInputRef.current.value = '';
  };

  const displayTitle = coverPage.title ?? projectTitle;
  const displayAuthor = coverPage.authorLine ?? projectAuthor;
  const currentLogo = coverPage.dpcglLogo || 'dh_bottle_white_color';
  const logoPosition = coverPage.dpcglLogoPosition || 'top-right';
  const logoSize = coverPage.dpcglLogoSize || 'md';
  const logoUrl = getLogoUrl(currentLogo, coverPage.customLogoUrl);
  const posClass = getPositionClass(logoPosition);
  const sizeClass = getSizeClass(logoSize);

  return (
    <div className="flex flex-col w-full h-full bg-[#fdfcf8] overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> 大纲
            </button>
            <div className="h-4 w-px bg-stone-200" />
            <span className="text-sm font-bold text-stone-700 flex items-center gap-2">
              🎨 封面页与 DPCGL 徽标配置
            </span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-stone-500">启用封面页</span>
            <button
              onClick={() => updateCoverPage({ enabled: !coverPage.enabled })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shadow-inner ${ coverPage.enabled ? 'bg-amber-500' : 'bg-stone-300' }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${ coverPage.enabled ? 'translate-x-4' : 'translate-x-0.5' }`} />
            </button>
          </label>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div className="w-full lg:w-1/2 border-r border-stone-200/90 h-full overflow-y-auto p-6 md:p-8 space-y-6">
          <input type="file" ref={coverInputRef} onChange={handleCoverUpload} className="hidden" accept="image/*" />
          <input type="file" ref={iconInputRef} onChange={handleIconUpload} className="hidden" accept="image/*" />
          <input type="file" ref={customLogoInputRef} onChange={handleCustomLogoUpload} className="hidden" accept="image/*" />

          {/* DPCGL Compliance Tip Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5 shadow-2xs">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>DPCGL 官方封面与命名合规指引 (Darrington Press CGL)</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              • <strong>商业与公开出版</strong>：封面上应呈现 Darrington Press 社区内容徽标（Daggerheart 须使用炼金药瓶图样）。<br/>
              • <strong>命名红线</strong>：作品主标题<strong>不能</strong>直接命名为 "DAGGERHEART" 或以此作为大字封面，可使用 "Compatible with Daggerheart" 形式标明兼容性。
            </p>
          </div>

          {/* 1. DPCGL Logo Selection */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> DPCGL 官方合规徽标 (Logo)
              </label>
              {currentLogo !== 'none' && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  已启用合规徽标
                </span>
              )}
            </div>

            {/* Logo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DPCGL_LOGOS.map(logo => {
                const isSelected = currentLogo === logo.id;
                return (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() => updateCoverPage({ dpcglLogo: logo.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs' 
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40 hover:bg-white'
                    }`}
                  >
                    <div className="h-12 w-full rounded-lg bg-stone-900/90 flex items-center justify-center p-1.5 overflow-hidden">
                      {logo.previewUrl ? (
                        <img src={logo.previewUrl} alt={logo.name} className="h-full object-contain" />
                      ) : (
                        <span className="text-[11px] text-stone-400 font-medium">无徽标</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-stone-800 truncate flex items-center justify-between">
                        <span>{logo.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-600" />}
                      </div>
                      <div className="text-[9px] text-stone-400 line-clamp-1">{logo.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Logo Upload option */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => customLogoInputRef.current?.click()}
                className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentLogo === 'custom' 
                    ? 'border-amber-500 bg-amber-50 text-amber-900' 
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <ImagePlus className="w-3.5 h-3.5" /> 上传自定义徽标
              </button>
              {currentLogo === 'custom' && coverPage.customLogoUrl && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ 自定义徽标已就绪</span>
              )}
            </div>

            {/* Logo Positioning & Size (Only if logo active) */}
            {currentLogo !== 'none' && (
              <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Position */}
                <div className="space-y-1">
                  <label className={Styles.label}>徽标位置</label>
                  <select
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 outline-none font-bold text-stone-700 cursor-pointer"
                    value={logoPosition}
                    onChange={e => updateCoverPage({ dpcglLogoPosition: e.target.value as LogoPosition })}
                  >
                    <option value="top-right">右上角 (推荐经典位置)</option>
                    <option value="top-left">左上角</option>
                    <option value="center-top">居中顶部</option>
                    <option value="bottom-right">右下角</option>
                    <option value="bottom-left">左下角</option>
                    <option value="center-bottom">居中底部</option>
                  </select>
                </div>

                {/* Size */}
                <div className="space-y-1">
                  <label className={Styles.label}>徽标尺寸</label>
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    {[
                      { id: 'sm', label: '小 (70px)' },
                      { id: 'md', label: '中 (95px)' },
                      { id: 'lg', label: '大 (140px)' },
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updateCoverPage({ dpcglLogoSize: s.id as LogoSize })}
                        className={`text-[11px] font-bold py-1 px-1.5 rounded-md border text-center transition-all cursor-pointer ${
                          logoSize === s.id
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Cover Image Upload */}
          <div className="space-y-2">
            <label className={Styles.label}>封面主视觉图 (Background Artwork)</label>
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative w-full h-48 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden shadow-2xs"
            >
              {coverPage.coverImage ? (
                <>
                  <img src={coverPage.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-85" alt="封面图" />
                  <div className="relative z-10 bg-black/60 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold backdrop-blur-xs">点击更换封面图</div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-stone-300 mb-2" />
                  <p className="text-xs text-stone-400 font-medium">点击上传封面背景画</p>
                  <p className="text-[10px] text-stone-300 mt-1">支持 JPG / PNG / WebP</p>
                </>
              )}
            </div>
            {coverPage.coverImage && (
              <button onClick={() => updateCoverPage({ coverImage: undefined })} className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-colors">× 移除封面图</button>
            )}
          </div>

          {/* 3. Custom Logo / Seal Upload */}
          <div className="space-y-2">
            <label className={Styles.label}>作品徽标 / 个人印章 (Personal/Studio Seal)</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => iconInputRef.current?.click()}
                className="w-16 h-16 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden flex-shrink-0"
              >
                {coverPage.iconImage ? (
                  <img src={coverPage.iconImage} className="w-full h-full object-contain" alt="图标" />
                ) : (
                  <ImagePlus className="w-5 h-5 text-stone-300 group-hover:text-amber-500 transition-colors" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs text-stone-500">上传作者工作室或战役专属印章，将作为中心标志呈现在封面。</p>
                {coverPage.iconImage && (
                  <button onClick={() => updateCoverPage({ iconImage: undefined })} className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-colors">× 移除印章</button>
                )}
              </div>
            </div>
          </div>

          {/* 4. Text Fields */}
          <div className="space-y-3.5 bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className={Styles.label}>主标题 (Campaign Title)</label>
                <span className="text-[10px] text-stone-400">留空则自动使用项目标题</span>
              </div>
              <input
                className={Styles.modernInput}
                value={coverPage.title ?? ''}
                onChange={e => updateCoverPage({ title: e.target.value })}
                placeholder={projectTitle || "输入主标题..."}
              />
            </div>

            <div className="space-y-1">
              <label className={Styles.label}>副标题 / 宣传语 (Tagline / Subtitle)</label>
              <input
                className={Styles.modernInput}
                value={coverPage.subtitle ?? ''}
                onChange={e => updateCoverPage({ subtitle: e.target.value })}
                placeholder="例如: 一个关于复仇、暗影与救赎的 Daggerheart 兼容战役框架"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className={Styles.label}>作者署名 (Author / Creator Line)</label>
                <span className="text-[10px] text-stone-400">留空则自动使用项目作者</span>
              </div>
              <input
                className={Styles.modernInput}
                value={coverPage.authorLine ?? ''}
                onChange={e => updateCoverPage({ authorLine: e.target.value })}
                placeholder={projectAuthor || "输入作者署名..."}
              />
            </div>

            <div className="space-y-1">
              <label className={Styles.label}>底部脚标说明 (Footer Note)</label>
              <input
                className={Styles.modernInput}
                value={coverPage.footerText ?? ''}
                onChange={e => updateCoverPage({ footerText: e.target.value })}
                placeholder="例如: 依据 DPCGL 社区游戏许可协议创作 · 本作品版权归作者所有"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:flex w-1/2 h-full flex-col overflow-hidden bg-stone-950">
          <div className="flex-shrink-0 px-4 py-2 border-b border-stone-700/60 bg-stone-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400/90">封面排版预览</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">210mm × 297mm (A4 标准)</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div
              className="w-full max-w-sm aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col select-none"
              style={coverPage.coverImage ? { backgroundImage: `url(${coverPage.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(145deg, #1c1917 0%, #292524 60%, #44403c 100%)' }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

              {/* DPCGL Official Compliance Logo */}
              {logoUrl && (
                <div className={`absolute z-20 ${posClass}`}>
                  <img
                    src={logoUrl}
                    alt="DPCGL Logo"
                    className={`${sizeClass.width} object-contain drop-shadow-md`}
                  />
                </div>
              )}

              {/* Custom Seal / Icon */}
              {coverPage.iconImage && (
                <div className="relative z-10 pt-16 flex justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden shadow-xl bg-white/10 backdrop-blur-xs">
                    <img src={coverPage.iconImage} className="w-full h-full object-contain" alt="seal" />
                  </div>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Text Area */}
              <div className="relative z-10 px-8 pb-10 text-white text-center space-y-2.5">
                {coverPage.subtitle && (
                  <p className="text-[11px] font-medium text-white/70 uppercase tracking-[0.25em]">{coverPage.subtitle}</p>
                )}
                <h1 className="text-3xl font-black tracking-tight leading-tight drop-shadow-lg font-serif">
                  {displayTitle || '战役标题'}
                </h1>
                <p className="text-xs text-white/80 font-medium tracking-wider">
                  By {displayAuthor || '作者'}
                </p>
                {coverPage.footerText && (
                  <p className="text-[10px] text-white/40 border-t border-white/20 pt-2.5 mt-2.5 leading-relaxed">{coverPage.footerText}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreditsPageEditor: React.FC<{
  creditsPage: CreditsPage;
  updateCreditsPage: (updates: Partial<CreditsPage>) => void;
  goBack: () => void;
  projectTitle: string;
  projectAuthor: string;
}> = ({ creditsPage, updateCreditsPage, goBack, projectTitle, projectAuthor }) => {
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'credits' | 'copyright'>('credits');
  const [showComplianceTips, setShowComplianceTips] = useState(false);

  // Initialize copyright default settings if not set
  const copyright = creditsPage.copyright || {
    enabled: true,
    template: 'dh_bilingual' as DPCGLTemplateType,
    workTitle: projectTitle,
    authorName: projectAuthor,
    year: '2026',
    hasModifications: false,
    modificationsNote: '',
    customNotice: '',
    showDPCGLLogo: true,
    dpcglLogo: 'dh_bottle_white_color' as DPCGLLogoType,
  };

  const updateCopyright = (updates: Partial<CopyrightSettings>) => {
    const updatedCopyright = { ...copyright, ...updates };
    updateCreditsPage({ copyright: updatedCopyright });
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { updateCreditsPage({ backgroundImage: await fileToBase64(file) }); } catch { alert('图片读取失败'); }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  // Compile standard template into markdown text
  const applyTemplate = (templateType: DPCGLTemplateType) => {
    const tmpl = DPCGL_TEMPLATES.find(t => t.id === templateType);
    if (tmpl) {
      const generated = tmpl.generateText({
        workTitle: copyright.workTitle || projectTitle,
        authorName: copyright.authorName || projectAuthor,
        year: copyright.year || '2026',
        hasMod: !!copyright.hasModifications,
        modNote: copyright.modificationsNote,
        customNotice: copyright.customNotice,
      });
      updateCopyright({
        template: templateType,
        rawDeclarationText: generated,
      });
    }
  };

  // If rawDeclarationText is empty, initialize it with default template
  useEffect(() => {
    if (!creditsPage.copyright?.rawDeclarationText) {
      const defaultTmpl = DPCGL_TEMPLATES.find(t => t.id === (copyright.template || 'dh_bilingual'));
      if (defaultTmpl) {
        const text = defaultTmpl.generateText({
          workTitle: copyright.workTitle || projectTitle,
          authorName: copyright.authorName || projectAuthor,
          year: copyright.year || '2026',
          hasMod: !!copyright.hasModifications,
          modNote: copyright.modificationsNote,
          customNotice: copyright.customNotice,
        });
        updateCopyright({ rawDeclarationText: text });
      }
    }
  }, [projectTitle, projectAuthor]);

  return (
    <div className="flex flex-col w-full h-full bg-[#fdfcf8] overflow-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> 大纲
            </button>
            <div className="h-4 w-px bg-stone-200" />
            <span className="text-sm font-bold text-stone-700 flex items-center gap-2">
              🙏 尾页鸣谢与 DPCGL 版权声明
            </span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-stone-500">启用尾页</span>
            <button
              onClick={() => updateCreditsPage({ enabled: !creditsPage.enabled })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shadow-inner ${ creditsPage.enabled ? 'bg-indigo-500' : 'bg-stone-300' }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${ creditsPage.enabled ? 'translate-x-4' : 'translate-x-0.5' }`} />
            </button>
          </label>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Editor */}
        <div className="w-full lg:w-1/2 border-r border-stone-200/90 h-full overflow-y-auto p-6 md:p-8 space-y-6">
          <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />

          {/* Sub Tabs */}
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1 border border-stone-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('credits')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'credits'
                  ? 'bg-white text-indigo-950 shadow-xs border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>🙏 鸣谢致辞与视觉背景</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('copyright')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'copyright'
                  ? 'bg-white text-indigo-950 shadow-xs border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>⚖️ DPCGL 版权声明栏位</span>
            </button>
          </div>

          {activeTab === 'credits' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Background Image Upload */}
              <div className="space-y-2">
                <label className={Styles.label}>尾页背景图片</label>
                <div
                  onClick={() => bgInputRef.current?.click()}
                  className="relative w-full h-40 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden shadow-2xs"
                >
                  {creditsPage.backgroundImage ? (
                    <>
                      <img src={creditsPage.backgroundImage} className="absolute inset-0 w-full h-full object-cover opacity-70" alt="背景图" />
                      <div className="relative z-10 bg-black/50 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold">点击更换背景图</div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-stone-300 mb-2" />
                      <p className="text-xs text-stone-400 font-medium">点击上传背景图片</p>
                      <p className="text-[10px] text-stone-300 mt-1">支持任意尺寸纹理或暗色插画</p>
                    </>
                  )}
                </div>
                {creditsPage.backgroundImage && (
                  <button onClick={() => updateCreditsPage({ backgroundImage: undefined })} className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-colors">× 移除背景图</button>
                )}
              </div>

              {/* Credits Text */}
              <div className="space-y-2">
                <label className={Styles.label}>鸣谢正文致辞 (支持 Markdown)</label>
                <textarea
                  className={`${Styles.modernTextarea} min-h-[220px] font-sans`}
                  value={creditsPage.creditsText ?? ''}
                  onChange={e => updateCreditsPage({ creditsText: e.target.value })}
                  placeholder={`## 特别鸣谢\n\n感谢所有参与内测、跑团试玩以及提供宝贵反馈的玩家们！\n\n**规则系统:** 匕首之心 (Daggerheart)\n**创作排版:** 不咕鸟匕心写作模板\n\n---\n\n*愿骰子指引你们的光辉命运。*`}
                />
                <p className="text-[10px] text-stone-400">支持 Markdown 语法（加粗 **文字**、斜体 *文字*、标题 ## 与分割线 ---）。</p>
              </div>

              {/* Footer Text */}
              <div className="space-y-1">
                <label className={Styles.label}>底部附注 (Footer Note)</label>
                <input
                  className={Styles.modernInput}
                  value={creditsPage.footerText ?? ''}
                  onChange={e => updateCreditsPage({ footerText: e.target.value })}
                  placeholder="例如: © 2026 作者名  ·  保留所有权利"
                />
              </div>
            </div>
          )}

          {activeTab === 'copyright' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Toggle copyright box */}
              <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-200/80 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    在尾页渲染 DPCGL 法律版权声明栏位
                  </span>
                  <p className="text-[10px] text-indigo-700/80 mt-0.5">
                    根据 Darrington Press 协议，公开分享与出版物必须包含合法署名与版权免责声明。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateCopyright({ enabled: !copyright.enabled })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shadow-inner shrink-0 ${ copyright.enabled ? 'bg-indigo-600' : 'bg-stone-300' }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${ copyright.enabled ? 'translate-x-4' : 'translate-x-0.5' }`} />
                </button>
              </div>

              {/* 1. Template Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className={Styles.label}>1. 选择适用的许可声明条款 (Templates)</label>
                  <button
                    type="button"
                    onClick={() => applyTemplate(copyright.template)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    title="依据下方填写的属于您的作品与作者信息，重新生成标准声明"
                  >
                    <RefreshCw className="w-3 h-3" /> 依据当前信息重新生成
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DPCGL_TEMPLATES.map(t => {
                    const isSelected = copyright.template === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          updateCopyright({ template: t.id });
                          applyTemplate(t.id);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs text-indigo-950'
                            : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/60 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs leading-snug">{t.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-stone-100 text-stone-600 border border-stone-200/80'}`}>
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">{t.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Creator Custom Information Form (Explicit Guidance) */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3.5 shadow-xs">
                <div className="border-b border-stone-100 pb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    2. 填写属于您的作品信息 (专属参数自动套入)
                  </span>
                  <span className="text-[10px] text-stone-400">修改后点击上方重新生成生效</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Work Title */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className={Styles.label}>【作品名称】(Work Title)</label>
                    <input
                      className={Styles.modernInput}
                      value={copyright.workTitle ?? ''}
                      onChange={e => updateCopyright({ workTitle: e.target.value })}
                      placeholder={projectTitle || "输入原创战役名称"}
                    />
                  </div>

                  {/* Year */}
                  <div className="space-y-1">
                    <label className={Styles.label}>【版权年份】(Year)</label>
                    <input
                      className={Styles.modernInput}
                      value={copyright.year ?? ''}
                      onChange={e => updateCopyright({ year: e.target.value })}
                      placeholder="2026"
                    />
                  </div>
                </div>

                {/* Author Name */}
                <div className="space-y-1">
                  <label className={Styles.label}>【作者 / 工作室名称】(Author Name)</label>
                  <input
                    className={Styles.modernInput}
                    value={copyright.authorName ?? ''}
                    onChange={e => updateCopyright({ authorName: e.target.value })}
                    placeholder={projectAuthor || "输入作者署名"}
                  />
                </div>

                {/* Modification clause */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer">
                      <span>对公共游戏规则 (DHSRD) 是否有修改或拓展？</span>
                    </label>
                    <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => updateCopyright({ hasModifications: false })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${!copyright.hasModifications ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-400'}`}
                      >
                        无修改
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCopyright({ hasModifications: true })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${copyright.hasModifications ? 'bg-indigo-600 text-white shadow-2xs' : 'text-stone-400'}`}
                      >
                        有自定义改动
                      </button>
                    </div>
                  </div>

                  {copyright.hasModifications && (
                    <div className="space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <label className="text-[10px] font-bold text-indigo-900">
                        【修改说明】(依据 DPCGL 4.1(e) 条，注明具体改动范围)
                      </label>
                      <input
                        className={Styles.modernInput}
                        value={copyright.modificationsNote ?? ''}
                        onChange={e => updateCopyright({ modificationsNote: e.target.value })}
                        placeholder="例如: 为本战役定制了 3 个新敌人属性栏、自创了 1 处环境倒计时机制。"
                      />
                    </div>
                  )}
                </div>

                {/* Custom Notice */}
                <div className="space-y-1 pt-1">
                  <label className={Styles.label}>【原创内容权利说明】(保留作者独占剧情/角色/地图等版权)</label>
                  <input
                    className={Styles.modernInput}
                    value={copyright.customNotice ?? ''}
                    onChange={e => updateCopyright({ customNotice: e.target.value })}
                    placeholder="例如: 本作品中的原创剧情、世界观设定、NPC角色及视觉插画版权均归作者独占所有。"
                  />
                </div>
              </div>

              {/* 3. Generated Markdown Disclaimer Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={Styles.label}>3. 声明正文编辑 (Markdown 实时生效)</label>
                  <span className="text-[10px] text-stone-400">可直接手写或增删任何段落</span>
                </div>
                <textarea
                  className={`${Styles.modernTextarea} min-h-[180px] font-mono text-xs`}
                  value={copyright.rawDeclarationText ?? ''}
                  onChange={e => updateCopyright({ rawDeclarationText: e.target.value })}
                  placeholder="版权声明正文..."
                />
              </div>

              {/* 4. DPCGL Logo display on Copyright Box */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    在尾页版权框附带 DPCGL 官方许可徽标
                  </span>
                  <p className="text-[10px] text-stone-400">
                    呈现官方药瓶徽标与 Critical Role 经许可使用说明
                  </p>
                </div>
                <select
                  className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 outline-none font-bold text-stone-700 cursor-pointer"
                  value={copyright.dpcglLogo || 'dh_bottle_white_color'}
                  onChange={e => updateCopyright({ dpcglLogo: e.target.value as DPCGLLogoType })}
                >
                  <option value="dh_bottle_white_color">白字全彩药瓶</option>
                  <option value="dh_bottle_color">黑字全彩药瓶</option>
                  <option value="dh_bottle_white">单色纯白药瓶</option>
                  <option value="dh_compatible_badge">Compatible 黑金徽章</option>
                  <option value="candela_gold">Candela 金黑徽标</option>
                  <option value="none">不显示徽标</option>
                </select>
              </div>

              {/* 5. Collapsible Checklist */}
              <div className="border border-stone-200 rounded-xl overflow-hidden bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setShowComplianceTips(!showComplianceTips)}
                  className="w-full flex items-center justify-between p-3 bg-stone-50/70 hover:bg-stone-50 font-bold text-stone-700 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    DPCGL 创作者合规自检速查清单 (点击折叠/展开)
                  </span>
                  {showComplianceTips ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
                </button>
                {showComplianceTips && (
                  <div className="p-4 space-y-2.5 border-t border-stone-100 text-stone-600 text-[11px] leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓ 允许使用</span>
                      <span>DHSRD 2.0 / 1.0 的游戏机制、属性栏格式、Domain 图标、职业/种族/怪物在 SRD 范围内的名称与数值。</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">✗ 严禁包含</span>
                      <span>核心规则书原文整段抄录、Critical Role 官方节目剧情/角色（Exandria、Mighty Nein 等）、官方插画美术素材。</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">⚠️ 商标要求</span>
                      <span>不得暗示官方背书；作品主标题不能写 `DAGGERHEART`；营销文案提及名称时须加标 `Compatible`。</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:flex w-1/2 h-full flex-col overflow-hidden bg-stone-950">
          <div className="flex-shrink-0 px-4 py-2 border-b border-stone-700/60 bg-stone-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400/90">尾页排版预览</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">210mm × 297mm (A4 标准)</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div
              className="w-full max-w-sm min-h-[440px] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col select-none"
              style={creditsPage.backgroundImage ? { backgroundImage: `url(${creditsPage.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)' }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90" />

              {/* Content */}
              <div className="relative z-10 flex-1 p-6 text-white space-y-4 flex flex-col">
                {/* Header */}
                <div className="text-center pt-2">
                  <div className="text-2xl mb-1">🙏</div>
                  <h2 className="text-base font-black text-white/90 uppercase tracking-[0.25em] font-serif">鸣谢</h2>
                </div>

                {/* Credits Body */}
                {creditsPage.creditsText ? (
                  <div className="text-xs text-white/80 leading-relaxed space-y-2 text-center flex-1">
                    <MarkdownRenderer content={creditsPage.creditsText} />
                  </div>
                ) : (
                  <div className="text-center text-white/30 text-xs italic py-4 border border-white/10 rounded-lg flex-1 flex items-center justify-center">
                    在此处呈现鸣谢致辞...
                  </div>
                )}

                {/* DPCGL Copyright Box */}
                {copyright.enabled && (
                  <div className="mt-auto bg-black/45 border border-white/15 rounded-xl p-3 text-[10px] text-white/75 space-y-2 backdrop-blur-xs shadow-inner">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                      <span className="font-bold text-amber-300/90 uppercase tracking-wider flex items-center gap-1 text-[9px]">
                        <ShieldCheck className="w-3 h-3 text-amber-400" /> DPCGL 版权与许可声明
                      </span>
                      {copyright.showDPCGLLogo && copyright.dpcglLogo && copyright.dpcglLogo !== 'none' && (
                        <img
                          src={getLogoUrl(copyright.dpcglLogo)}
                          alt="DPCGL"
                          className="h-5 object-contain"
                        />
                      )}
                    </div>
                    <div className="leading-relaxed opacity-90 text-[9px] text-stone-300">
                      <MarkdownRenderer content={copyright.rawDeclarationText || ''} />
                    </div>
                  </div>
                )}

                {/* Footer Note */}
                {creditsPage.footerText && (
                  <div className="text-center text-[9px] text-white/40 border-t border-white/10 pt-2">
                    {creditsPage.footerText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CopyrightPageEditor: React.FC<{
  copyrightPage: CopyrightSettings;
  showCopyrightSetting: boolean;
  updateSettings: (key: keyof ProjectSettings, value: boolean) => void;
  updateCopyrightPage: (updates: Partial<CopyrightSettings>) => void;
  goBack: () => void;
  projectTitle: string;
  projectAuthor: string;
  theme: ThemeType;
}> = ({
  copyrightPage,
  showCopyrightSetting,
  updateSettings,
  updateCopyrightPage,
  goBack,
  projectTitle,
  projectAuthor,
}) => {
  const [showComplianceTips, setShowComplianceTips] = useState(false);

  // If rawDeclarationText is empty, initialize it with current template
  useEffect(() => {
    if (!copyrightPage.rawDeclarationText) {
      const tmpl = DPCGL_TEMPLATES.find(t => t.id === (copyrightPage.template || 'dh_bilingual')) || DPCGL_TEMPLATES[0];
      const text = tmpl.generateText({
        workTitle: copyrightPage.workTitle || projectTitle,
        authorName: copyrightPage.authorName || projectAuthor,
        year: copyrightPage.year || '2026',
        hasMod: !!copyrightPage.hasModifications,
        modNote: copyrightPage.modificationsNote,
        customNotice: copyrightPage.customNotice,
      });
      updateCopyrightPage({ rawDeclarationText: text });
    }
  }, [projectTitle, projectAuthor]);

  const handleTemplateChange = (templateType: DPCGLTemplateType) => {
    const tmpl = DPCGL_TEMPLATES.find(t => t.id === templateType);
    if (tmpl) {
      const generated = tmpl.generateText({
        workTitle: copyrightPage.workTitle || projectTitle,
        authorName: copyrightPage.authorName || projectAuthor,
        year: copyrightPage.year || '2026',
        hasMod: !!copyrightPage.hasModifications,
        modNote: copyrightPage.modificationsNote,
        customNotice: copyrightPage.customNotice,
      });
      updateCopyrightPage({
        template: templateType,
        rawDeclarationText: generated,
      });
    }
  };

  const handleRegenerate = () => {
    const tmpl = DPCGL_TEMPLATES.find(t => t.id === (copyrightPage.template || 'dh_bilingual')) || DPCGL_TEMPLATES[0];
    const generated = tmpl.generateText({
      workTitle: copyrightPage.workTitle || projectTitle,
      authorName: copyrightPage.authorName || projectAuthor,
      year: copyrightPage.year || '2026',
      hasMod: !!copyrightPage.hasModifications,
      modNote: copyrightPage.modificationsNote,
      customNotice: copyrightPage.customNotice,
    });
    updateCopyrightPage({ rawDeclarationText: generated });
  };

  const isEnabled = showCopyrightSetting && (copyrightPage.enabled !== false);

  const toggleEnabled = () => {
    const nextVal = !isEnabled;
    updateSettings('showCopyright', nextVal);
    updateCopyrightPage({ enabled: nextVal });
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#fdfcf8] overflow-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2.5 gap-3">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> 大纲
            </button>
            <div className="h-4 w-px bg-stone-200" />
            <span className="text-sm font-bold text-stone-700 flex items-center gap-2">
              ⚖️ DPCGL 版权与出版许可声明页编辑
            </span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-stone-500">启用版权声明页</span>
            <button
              type="button"
              onClick={toggleEnabled}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shadow-inner ${ isEnabled ? 'bg-amber-600' : 'bg-stone-300' }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${ isEnabled ? 'translate-x-4' : 'translate-x-0.5' }`} />
            </button>
          </label>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Settings & Text Form */}
        <div className="w-full lg:w-1/2 border-r border-stone-200/90 h-full overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Tip card */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>独立版权声明页说明</span>
            </div>
            <p className="text-stone-600 leading-relaxed text-[11px]">
              即使您的战役文档<strong>未开启封面或尾页</strong>，开启本项后仍会作为独立的标准法律声明页在全书预览、打印（自动分页）与 HTML / Markdown 导出中完整呈现，助您从容符合 Darrington Press Community Gaming License 规范。
            </p>
          </div>

          {/* 1. Template Switcher */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className={Styles.label}>1. 选择 DPCGL 许可条款模板</label>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="依据当前填写的作品与作者信息重新套用模板"
              >
                <RefreshCw className="w-3 h-3" /> 重新生成
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DPCGL_TEMPLATES.map((tmpl) => {
                const isSelected = (copyrightPage.template || 'dh_bilingual') === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tmpl.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-500/20 text-amber-950'
                        : 'border-stone-200 hover:border-amber-300 bg-white hover:bg-amber-50/20 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs leading-snug">{tmpl.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 border border-stone-200/80'}`}>
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">{tmpl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Creator Form */}
          <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-600" /> 2. 填写您的专属作品信息（将自动注入条款中）
              </span>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100/70 hover:bg-amber-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="依据当前填写的标题、作者等信息重新生成下方声明文本"
              >
                <RefreshCw className="w-3 h-3" /> 重新注入
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className={Styles.label}>【作品名称】</label>
                <input
                  className={Styles.modernInput}
                  value={copyrightPage.workTitle ?? projectTitle}
                  onChange={e => updateCopyrightPage({ workTitle: e.target.value })}
                  placeholder="战役/作品名称"
                />
              </div>
              <div className="space-y-1">
                <label className={Styles.label}>【版权年份】</label>
                <input
                  className={Styles.modernInput}
                  value={copyrightPage.year || '2026'}
                  onChange={e => updateCopyrightPage({ year: e.target.value })}
                  placeholder="如: 2026"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={Styles.label}>【作者 / 创作者团队名称】</label>
              <input
                className={Styles.modernInput}
                value={copyrightPage.authorName ?? projectAuthor}
                onChange={e => updateCopyrightPage({ authorName: e.target.value })}
                placeholder="创作者或团队署名"
              />
            </div>

            {/* Modifications Toggle */}
            <div className="pt-2 border-t border-stone-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-700">是否包含对 DPCGL 规则机制的修改？</span>
                  <p className="text-[10px] text-stone-400">依据 DPCGL 4.1(e) 条，如修改了 SRD 核心数值/流程，需予以简要说明</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateCopyrightPage({ hasModifications: !copyrightPage.hasModifications })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shadow-inner cursor-pointer ${ copyrightPage.hasModifications ? 'bg-amber-500' : 'bg-stone-300' }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${ copyrightPage.hasModifications ? 'translate-x-4' : 'translate-x-0.5' }`} />
                </button>
              </div>

              {copyrightPage.hasModifications && (
                <div className="space-y-1 animate-in fade-in">
                  <label className={Styles.label}>规则修改说明 (Modifications Note)</label>
                  <textarea
                    rows={2}
                    className={Styles.modernTextarea}
                    value={copyrightPage.modificationsNote || ''}
                    onChange={e => updateCopyrightPage({ modificationsNote: e.target.value })}
                    placeholder="例如：修改了部分恐惧点获得机制；增加了自定义领域卡牌等..."
                  />
                </div>
              )}
            </div>

            {/* Original Content Note */}
            <div className="space-y-1 pt-1">
              <label className={Styles.label}>原创版权保留声明 (Custom Original Rights Notice)</label>
              <input
                className={Styles.modernInput}
                value={copyrightPage.customNotice || ''}
                onChange={e => updateCopyrightPage({ customNotice: e.target.value })}
                placeholder="例如：本作品中的原创剧情、世界观及 NPC 角色设定均归作者所有。"
              />
            </div>
          </div>

          {/* 3. Live Declaration Text Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className={Styles.label}>3. 声明正文编辑 (Markdown 格式，实时生效)</label>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-[10px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                重置为模板默认文本
              </button>
            </div>
            <textarea
              rows={8}
              className={`${Styles.modernTextarea} font-mono text-xs`}
              value={copyrightPage.rawDeclarationText || ''}
              onChange={e => updateCopyrightPage({ rawDeclarationText: e.target.value })}
              placeholder="在此处微调或编写法律声明 Markdown 文本..."
            />
          </div>

          {/* 4. DPCGL Logo Selector */}
          <div className="bg-stone-50/80 border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> 4. 版权声明页徽标 (DPCGL Icon)
              </span>
              <button
                type="button"
                onClick={() => updateCopyrightPage({ showDPCGLLogo: copyrightPage.showDPCGLLogo === false ? true : false })}
                className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                  copyrightPage.showDPCGLLogo !== false ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {copyrightPage.showDPCGLLogo !== false ? '已开启徽标显示' : '已隐藏徽标'}
              </button>
            </div>

            {copyrightPage.showDPCGLLogo !== false && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {DPCGL_LOGOS.map((logo) => {
                  const isSelected = (copyrightPage.dpcglLogo || 'dh_bottle_white_color') === logo.id;
                  const logoUrl = getLogoUrl(logo.id);
                  return (
                    <button
                      key={logo.id}
                      type="button"
                      onClick={() => updateCopyrightPage({ dpcglLogo: logo.id })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className="w-full h-12 flex items-center justify-center bg-stone-900 rounded-lg p-1">
                        {logoUrl ? (
                          <img src={logoUrl} alt={logo.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-stone-400">无徽标</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-stone-700 truncate w-full">{logo.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Collapsible Checklist */}
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white text-xs">
            <button
              type="button"
              onClick={() => setShowComplianceTips(!showComplianceTips)}
              className="w-full flex items-center justify-between p-3 bg-stone-50/70 hover:bg-stone-50 font-bold text-stone-700 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                DPCGL 创作者合规自检速查清单 (点击折叠/展开)
              </span>
              {showComplianceTips ? <ChevronDown className="w-4 h-4 text-stone-400" /> : <ChevronRight className="w-4 h-4 text-stone-400" />}
            </button>
            {showComplianceTips && (
              <div className="p-4 space-y-2.5 border-t border-stone-100 text-stone-600 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓ 允许使用</span>
                  <span>DHSRD 2.0 / 1.0 的游戏机制、属性栏格式、Domain 图标、职业/种族/怪物在 SRD 范围内的名称与数值。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗ 严禁包含</span>
                  <span>核心规则书原文整段抄录、Critical Role 官方节目剧情/角色（Exandria、Mighty Nein 等）、官方插画美术素材。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">⚠️ 商标要求</span>
                  <span>不得暗示官方背书；作品主标题不能写 `DAGGERHEART`；营销文案提及名称时须加标 `Compatible`。</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live A4 Preview */}
        <div className="hidden lg:flex w-1/2 h-full flex-col overflow-hidden bg-stone-950">
          <div className="flex-shrink-0 px-4 py-2 border-b border-stone-800 bg-stone-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">版权声明页独立排版预览</span>
            </div>
            <span className="text-[10px] text-stone-500 font-mono">210mm × 297mm (A4 标准)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="w-full max-w-sm min-h-[460px] rounded-2xl shadow-2xl overflow-hidden relative flex flex-col justify-between select-none bg-gradient-to-br from-[#181614] via-[#151413] to-[#100f0e] border border-stone-800 p-6 text-stone-200">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">DPCGL 版权与许可声明</h3>
                    <p className="text-[9px] text-stone-400">Darrington Press Community Content</p>
                  </div>
                </div>

                {copyrightPage.showDPCGLLogo !== false && getLogoUrl(copyrightPage.dpcglLogo || 'dh_bottle_white_color') && (
                  <img
                    src={getLogoUrl(copyrightPage.dpcglLogo || 'dh_bottle_white_color')}
                    alt="DPCGL"
                    className="h-8 object-contain"
                  />
                )}
              </div>

              {/* Body */}
              <div className="flex-1 text-[10px] text-stone-300 leading-relaxed space-y-2 overflow-hidden">
                <MarkdownRenderer content={copyrightPage.rawDeclarationText || ''} />
              </div>

              {/* Bottom Copyright */}
              <div className="mt-4 pt-3 border-t border-stone-800 text-center text-[9px] text-stone-500 font-mono">
                {copyrightPage.workTitle || projectTitle} © {copyrightPage.year || '2026'} {copyrightPage.authorName || projectAuthor}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Block Creation & Configuration ---

const createDefaultBlock = (type: BlockType): ContentBlock => {
  let b: any = { id: generateId(), type };
  if (type === 'text') b.content = '在此输入文本 (支持 Markdown 格式与表格)...';
  if (type === 'subsection') b.title = '小节标题';
  if (type === 'read_aloud') b.content = '在此输入朗读给玩家的文本...';
  if (type === 'callout') { b.title = '提示标题'; b.content = '内容...'; b.variant = 'info'; }
  if (type === 'enemy') { 
      b.name = '新敌人'; b.englishName = 'NEW ENEMY'; b.tier = 1; b.enemyType = '标准'; b.tactics = ''; 
      b.isNpcMode = false; b.avatarUrl = ''; b.avatarShape = 'circle'; b.healthDisplay = 'both';
      b.flavor = ''; b.experiences = '';
      b.stats = { difficulty: 12, hp: 5, stress: 3, thresholdMinor: 5, thresholdMajor: 10 }; 
      b.attack = { name: '普通攻击', modifier: '+0', damage: 'd8', damageType: 'physical', range: '近战范围' }; 
      b.traits = []; 
  }
  if (type === 'environment') { 
      b.name = '新环境'; b.englishName = 'NEW ENVIRONMENT'; b.difficulty = 12; b.features = []; b.tier = 1; 
      b.imageUrl = ''; b.description = '环境描述...'; b.envType = '险境'; b.trend = ''; b.potentialEnemies = ''; 
  }
  if (type === 'cyberware') {
    b.name = '微型皮下线圈';
    b.tier = 'T1';
    b.cyberType = '植入体 (Implant)';
    b.zone = '上肢 (Arms)';
    b.slots = '1';
    b.restriction = '需要灵巧 +1 以上';
    b.effect = '你的徒手近战攻击视为具有【迅捷】特性（标记 1 压力点可额外攻击一个射程内的目标）。';
    b.tag = '';
    b.compCost = '1.5w 信用点';
    b.surgCost = '5000 信用点';
    b.description = '精密的皮下微型伺服电机与神经脉冲传导线圈，能大幅度提升肢体肌肉的瞬时爆发速率。';
    b.creator = 'GM';
    b.owner = '-';
  }
  if (type === 'table') { b.headers = ['列1', '列2']; b.rows = [['A', 'B']]; }
  if (type === 'outcome') { b.entries = [{ id: generateId(), tags: ['success', 'hope'], content: '玩家动作成功，并带来了希望。' }]; }
  if (type === 'divider') { /* no extra fields */ }
  if (type === 'image') { b.url = ''; b.caption = ''; }
  return b;
};

const BLOCK_TYPE_CONFIGS: { type: BlockType; label: string; icon: any; color: string }[] = [
  { type: 'text', label: '正文', icon: Type, color: 'text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200' },
  { type: 'subsection', label: '小节', icon: Heading, color: 'text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200' },
  { type: 'read_aloud', label: '朗读', icon: MessageSquareQuote, color: 'text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100' },
  { type: 'callout', label: 'GM提示', icon: AlertCircle, color: 'text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100' },
  { type: 'enemy', label: '敌人卡', icon: Swords, color: 'text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100' },
  { type: 'environment', label: '环境卡', icon: Mountain, color: 'text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100' },
  { type: 'cyberware', label: '赛博义体', icon: Cpu, color: 'text-yellow-700 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100' },
  { type: 'outcome', label: '检定', icon: ListChecks, color: 'text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100' },
  { type: 'table', label: '数据表', icon: TableIcon, color: 'text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100' },
  { type: 'image', label: '图片', icon: ImageIcon, color: 'text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100' },
  { type: 'divider', label: '分割线', icon: Minus, color: 'text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200' },
];

const InsertBlockDivider = ({ onInsert }: { onInsert: (type: BlockType) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative py-1.5 group/divider my-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-transparent group-hover/divider:bg-amber-300/70 transition-colors" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs ${
            isOpen 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
              : 'opacity-0 group-hover/divider:opacity-100 bg-white text-stone-500 border-stone-200 hover:border-amber-400 hover:text-amber-700 hover:shadow-sm'
          }`}
          title="在此处插入新内容区块"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isOpen ? '收起选项' : '+ 在此插入内容'}</span>
        </button>
        <div className="flex-1 h-px bg-transparent group-hover/divider:bg-amber-300/70 transition-colors" />
      </div>

      {isOpen && (
        <div className="mt-2.5 p-3 bg-white border border-amber-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-1 z-10 space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <Plus className="w-3 h-3 text-amber-600" /> 选择要插入的内容类型:
            </span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 text-[11px] font-bold cursor-pointer"
            >
              ✕ 关闭
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-start items-center">
            {BLOCK_TYPE_CONFIGS.map(cfg => {
              const Icon = cfg.icon;
              return (
                <button
                  key={cfg.type}
                  type="button"
                  onClick={() => {
                    onInsert(cfg.type);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-transparent hover:border-stone-200/80 transition-all cursor-pointer shadow-2xs ${cfg.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const SectionHeaderNavbar: React.FC<{
  section: DynamicSection;
  updateSection: (u: any) => void;
  goBack: () => void;
  onAddNextSection?: () => void;
  viewLayout: 'split' | 'edit' | 'preview';
  setViewLayout: (m: 'split' | 'edit' | 'preview') => void;
}> = ({
  section,
  updateSection,
  goBack,
  onAddNextSection,
  viewLayout,
  setViewLayout,
}) => {
  const currentLevel = section.level || 3;
  const currentColMode = section.columnMode || (currentLevel === 5 ? 'cols' : 'full');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs select-none flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between px-3 md:px-4 py-2 gap-2">
        {/* Left: Back & Section Title & Level */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={goBack} 
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            title="返回战役大纲"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>大纲</span>
          </button>

          <div className="h-4 w-px bg-stone-200" />

          {/* H1-H5 Direct Level Badges */}
          <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg">
            <span className="text-[10px] font-black text-stone-400 uppercase px-1">层级:</span>
            {[
              { l: 1, label: 'H1 卷' },
              { l: 2, label: 'H2 幕' },
              { l: 3, label: 'H3 场' },
              { l: 4, label: 'H4 节' },
              { l: 5, label: 'H5 附' },
            ].map(opt => (
              <button
                key={opt.l}
                onClick={() => updateSection({ level: opt.l })}
                className={`text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  currentLevel === opt.l
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200'
                }`}
                title={`设为 ${opt.label}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Column Mode Selector */}
          <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg">
            <button
              onClick={() => updateSection({ columnMode: 'full' })}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                currentColMode === 'full' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="单栏全宽排版"
            >
              📄 单栏
            </button>
            <button
              onClick={() => updateSection({ columnMode: 'cols' })}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                currentColMode === 'cols' ? 'bg-white text-indigo-700 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="双列分栏排版"
            >
              📰 双栏
            </button>
          </div>
        </div>

        {/* Right: View Mode 3-Way Switcher & Add Section */}
        <div className="flex items-center gap-2">
          {/* View Mode Toggle: [ ✏️ 纯编辑 | ↔️ 双栏分屏 (默认) | 👁️ 实时预览 ] */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 shadow-2xs">
            <button
              onClick={() => setViewLayout('edit')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'edit' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="纯编辑模式 (100% 宽度专注编辑)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">纯编辑</span>
            </button>
            <button
              onClick={() => setViewLayout('split')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'split' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="实时双栏分屏 (左编辑 + 右出版排版实时同步)"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">双栏分屏</span>
            </button>
            <button
              onClick={() => setViewLayout('preview')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewLayout === 'preview' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="实时全屏预览"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">纯预览</span>
            </button>
          </div>

          {onAddNextSection && (
            <button
              onClick={onAddNextSection}
              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="在当前章节下方新建下一小节"
            >
              <Plus size={13} />
              <span className="hidden md:inline">新建小节</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const LeftEditorToolbar: React.FC<{
  onFormatText: (prefix: string, suffix?: string, defaultPlaceholder?: string) => void;
  onInsertBlock: (type: BlockType) => void;
}> = ({ onFormatText, onInsertBlock }) => {
  const handleBtnMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleSelectSnippet = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      onFormatText(val, '', '');
      e.target.value = '';
    }
  };

  return (
    <div className="bg-stone-50/95 rounded-2xl border border-stone-200/90 p-3.5 space-y-2.5 shadow-2xs">
      {/* Row 1: Text Formats */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-700">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider w-14 shrink-0">✏️ 格式:</span>
        <div className="flex flex-wrap items-center gap-1 flex-1">
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('**', '**', '加粗文本')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="加粗 **文本**"
          >
            <Bold size={12} /> 粗体
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('*', '*', '斜体描述')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 italic transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="斜体 *文本*"
          >
            <Italic size={12} /> 斜体
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('==', '==', '高亮内容')}
            className="px-2 py-1 bg-amber-100/70 hover:bg-amber-200 text-amber-950 rounded-md border border-amber-300 font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="高亮 ==文本=="
          >
            <Highlighter size={12} /> 高亮
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('~~', '~~', '删除文本')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 line-through transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="删除线 ~~文本~~"
          >
            <Strikethrough size={12} /> 删除
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('## ', '', '二级标题')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
            title="插入二级标题 ##"
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('### ', '', '三级标题')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
            title="插入三级标题 ###"
          >
            H3
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('> ', '', '朗读或引文内容')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="引用段落 >"
          >
            <Quote size={12} /> 引用
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('- ', '', '列表要点')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="无序列表"
          >
            <List size={12} /> 列表
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('1. ', '', '有序步骤')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="有序列表"
          >
            <ListOrdered size={12} /> 序号
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('`', '`', '代码或标记')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 font-mono transition-colors shadow-2xs cursor-pointer flex items-center gap-1 text-[11px]"
            title="行内代码"
          >
            <Code size={12} /> 代码
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('\n| 标题 1 | 标题 2 | 标题 3 |\n| :--- | :--- | :--- |\n| 条目 1 | 描述说明 | 检定效果 |\n| 条目 2 | 描述说明 | 检定效果 |\n', '', '')}
            className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-stone-200 flex items-center gap-1 text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
            title="插入 Markdown 表格"
          >
            <TableIcon size={12} /> 表格
          </button>
        </div>
      </div>

      {/* Row 2: TRPG Rules & Terms */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-700 pt-1.5 border-t border-stone-200/60">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider w-14 shrink-0">🎲 规则:</span>
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('【花费 1 希望点】', '', '')}
            className="px-2.5 py-1 bg-amber-100/80 hover:bg-amber-200 text-amber-900 rounded-md border border-amber-300 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
            title="插入希望点描述"
          >
            +花费希望
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('【花费 1 恐惧点】', '', '')}
            className="px-2.5 py-1 bg-purple-100/80 hover:bg-purple-200 text-purple-900 rounded-md border border-purple-300 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
            title="插入恐惧点描述"
          >
            +花费恐惧
          </button>
          <button
            type="button"
            onMouseDown={handleBtnMouseDown}
            onClick={() => onFormatText('【标记 1 压力点】', '', '')}
            className="px-2.5 py-1 bg-yellow-100/80 hover:bg-yellow-200 text-yellow-900 rounded-md border border-yellow-300 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
            title="插入压力点描述"
          >
            +标记压力
          </button>

          <select
            onChange={handleSelectSnippet}
            defaultValue=""
            className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-md text-[11px] text-stone-700 outline-none hover:border-amber-400 font-sans cursor-pointer transition-colors shadow-2xs"
            title="插入官方术语"
          >
            <option value="" disabled>🏷️ 官方术语库...</option>
            <optgroup label="希望与恐惧">
              <option value="【花费 1 希望点】">【花费 1 希望点】</option>
              <option value="【获得 1 希望点】">【获得 1 希望点】</option>
              <option value="【花费 1 恐惧点】">【花费 1 恐惧点】</option>
              <option value="【获得 1 恐惧点】">【获得 1 恐惧点】</option>
              <option value="【清除 1 恐惧点】">【清除 1 恐惧点】</option>
            </optgroup>
            <optgroup label="生命、压力与护甲">
              <option value="【标记 1 压力点】">【标记 1 压力点】</option>
              <option value="【清除 1 压力点】">【清除 1 压力点】</option>
              <option value="【标记 1 生命点】">【标记 1 生命点】</option>
              <option value="【恢复 1 生命点】">【恢复 1 生命点】</option>
              <option value="【标记 1 护甲槽】">【标记 1 护甲槽】</option>
              <option value="【清除 1 护甲槽】">【清除 1 护甲槽】</option>
            </optgroup>
            <optgroup label="距离与范围">
              <option value="【近战范围】">【近战范围】</option>
              <option value="【邻近范围】">【邻近范围】</option>
              <option value="【近距离范围】">【近距离范围】</option>
              <option value="【远距离范围】">【远距离范围】</option>
              <option value="【极远范围】">【极远范围】</option>
            </optgroup>
          </select>

          <select
            onChange={handleSelectSnippet}
            defaultValue=""
            className="px-2 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-md text-[11px] text-stone-700 outline-none hover:border-amber-400 font-sans cursor-pointer transition-colors shadow-2xs"
            title="选择插入规则描述常用句式"
          >
            <option value="" disabled>📝 规则常用句式...</option>
            <option value="对近距离范围内的一个目标进行一次敏捷掷骰（难度 12）。">敏捷掷骰 (难度 12)</option>
            <option value="成功时，目标处于【脆弱】状态；失败时，游戏主持人获得 1 恐惧点。">成功/失败分歧模板</option>
            <option value="造成 1d8+3 点物理伤害。">造成 1d8+3 物理伤害</option>
            <option value="造成 2d6 点魔法伤害，并将其击退至近距离范围处。">造成 2d6 魔法伤害并击退</option>
            <option value="在其下一次动作掷骰中获得优势。">下次动作掷骰获得优势</option>
            <option value="标记 1 压力点以少标记 1 生命点。">标记 1 压力以少标记 1 生命</option>
            <option value="与游戏主持人一起描述该物品并将其加入物品栏。">与GM共创确定物品句式</option>
          </select>
        </div>
      </div>

      {/* Row 3: Insert Blocks */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-700 pt-1.5 border-t border-stone-200/60">
        <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider w-14 shrink-0">🧩 插入:</span>
        <div className="flex flex-wrap items-center gap-1 flex-1">
          {BLOCK_TYPE_CONFIGS.map(cfg => {
            const Icon = cfg.icon;
            return (
              <button
                key={cfg.type}
                type="button"
                onClick={() => onInsertBlock(cfg.type)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border border-stone-200 hover:border-stone-300 transition-all cursor-pointer shadow-2xs ${cfg.color}`}
                title={`在小节末尾插入 ${cfg.label}`}
              >
                <Icon size={12} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SectionDetailView = ({ projectData, sections, updateSection, updateAllSections, activeId, goBack, onAddSectionAt }: any) => {
  const section = sections.find((s: any) => s.id === activeId);
  const [viewLayout, setViewLayout] = useState<'split' | 'edit' | 'preview'>('split');
  const [previewMode, setPreviewMode] = useState<'single' | 'full'>('single');
  
  // Track last focused input or textarea across the entire editor
  const activeInputRef = useRef<{
    getElement: () => HTMLTextAreaElement | HTMLInputElement | null;
    setValue: (v: string) => void;
  } | null>(null);

  const handleRegisterFocus = useCallback((
    target: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null> | HTMLTextAreaElement | HTMLInputElement,
    setValue: (v: string) => void
  ) => {
    activeInputRef.current = {
      getElement: () => {
        if (!target) return null;
        if ('current' in target) return target.current;
        return target as (HTMLTextAreaElement | HTMLInputElement);
      },
      setValue,
    };
  }, []);

  if (!section) return null;

  const updateBlock = (bid: string, u: any) =>
    updateSection(activeId, {
      blocks: section.blocks.map((b: any) => (b.id === bid ? { ...b, ...u } : b)),
    });

  const handleInsertBlockAt = (idx: number, type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    const newBlocks = [...section.blocks];
    newBlocks.splice(idx, 0, newBlock);
    updateSection(activeId, { blocks: newBlocks });
  };

  // 1. Move block out of current section and into target section (Atomic Multi-Section Update)
  const handleMoveBlockToSection = (blockId: string, targetSectionId: string) => {
    const blockToMove = section.blocks.find((b: any) => b.id === blockId);
    if (!blockToMove) return;
    const targetSection = sections.find((s: any) => s.id === targetSectionId);
    if (!targetSection) return;

    if (updateAllSections) {
      const newSections = sections.map((s: any) => {
        if (s.id === activeId) {
          return {
            ...s,
            blocks: s.blocks.filter((b: any) => b.id !== blockId),
          };
        }
        if (s.id === targetSectionId) {
          return {
            ...s,
            blocks: [...s.blocks, blockToMove],
          };
        }
        return s;
      });
      updateAllSections(newSections);
    } else {
      // Fallback
      updateSection(activeId, { blocks: section.blocks.filter((b: any) => b.id !== blockId) });
    }
  };

  // 2. Duplicate block in-place (below current block) with new unique IDs
  const handleDuplicateBlockInPlace = (blockId: string) => {
    const idx = section.blocks.findIndex((b: any) => b.id === blockId);
    if (idx === -1) return;
    const cloned = cloneBlockWithNewIds(section.blocks[idx]);
    const newBlocks = [...section.blocks];
    newBlocks.splice(idx + 1, 0, cloned);
    updateSection(activeId, { blocks: newBlocks });
  };

  // 3. Copy block clone to another section (keeps original in current section)
  const handleCopyBlockToSection = (blockId: string, targetSectionId: string) => {
    const blockToCopy = section.blocks.find((b: any) => b.id === blockId);
    if (!blockToCopy) return;
    const targetSection = sections.find((s: any) => s.id === targetSectionId);
    if (!targetSection) return;

    const cloned = cloneBlockWithNewIds(blockToCopy);
    if (updateAllSections) {
      const newSections = sections.map((s: any) => {
        if (s.id === targetSectionId) {
          return {
            ...s,
            blocks: [...s.blocks, cloned],
          };
        }
        return s;
      });
      updateAllSections(newSections);
    }
  };

  const handleFormatText = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const el = activeInputRef.current?.getElement();
    if (el && activeInputRef.current?.setValue) {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const currentText = el.value || '';

      const selectedText = currentText.substring(start, end) || defaultPlaceholder;
      const replacement = `${prefix}${selectedText}${suffix}`;

      const newText = currentText.substring(0, start) + replacement + currentText.substring(end);
      activeInputRef.current.setValue(newText);

      const newStart = start + prefix.length;
      const newEnd = start + prefix.length + selectedText.length;

      requestAnimationFrame(() => {
        if (el) {
          el.focus({ preventScroll: true });
          try {
            el.setSelectionRange(newStart, newEnd);
          } catch (e) {}
        }
      });
    } else {
      // If no input/textarea is currently targeted, insert/append to the first text block or create one
      const textBlockIdx = section.blocks.findIndex((b: any) => b.type === 'text');
      if (textBlockIdx >= 0) {
        const tb = section.blocks[textBlockIdx];
        const updated = (tb.content ? tb.content + '\n' : '') + `${prefix}${defaultPlaceholder}${suffix}`;
        updateBlock(tb.id, { content: updated });
      } else {
        const nb: any = createDefaultBlock('text');
        nb.content = `${prefix}${defaultPlaceholder}${suffix}`;
        handleInsertBlockAt(section.blocks.length, 'text');
      }
    }
  };

  const curIdx = sections.findIndex((s: any) => s.id === activeId);

  return (
    <div className="flex flex-col w-full h-full bg-[#fdfcf8] overflow-hidden print:hidden">
      {/* 1. Global Navigation Bar */}
      <SectionHeaderNavbar 
        section={section}
        updateSection={(u: any) => updateSection(activeId, u)}
        goBack={goBack}
        onAddNextSection={onAddSectionAt ? () => onAddSectionAt(curIdx >= 0 ? curIdx + 1 : sections.length, section.level) : undefined}
        viewLayout={viewLayout}
        setViewLayout={setViewLayout}
      />

      {/* 2. Responsive Split / Edit / Live Preview Pane with Independent Scrollbars */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Dedicated Column with Pinned Toolbar & Independent Scrollable Editor */}
        {(viewLayout === 'edit' || viewLayout === 'split') && (
          <div className={`${viewLayout === 'split' ? 'w-full lg:w-1/2 border-r border-stone-200/90' : 'w-full'} h-full flex flex-col overflow-hidden bg-[#fdfcf8]`}>
            {/* 📌 Pinned Top Toolbar for Left Editor */}
            <div className="flex-shrink-0 z-20 bg-[#fdfcf8] border-b border-stone-200/80 px-4 md:px-6 py-2.5 shadow-2xs">
              <div className="max-w-3xl mx-auto">
                <LeftEditorToolbar 
                  onFormatText={handleFormatText}
                  onInsertBlock={(type: BlockType) => handleInsertBlockAt(section.blocks.length, type)}
                />
              </div>
            </div>

            {/* 📜 Scrollable Edit Content */}
            <div 
              id="left-editor-scroll" 
              className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
            >
              <div className="max-w-3xl mx-auto space-y-6 pb-36">
                {/* Section Title & Subtitle Area */}
                <div className="space-y-3 pt-2">
                  <input
                    className="text-3xl md:text-4xl font-serif font-black text-stone-800 bg-transparent border-none outline-none w-full placeholder:text-stone-300"
                    value={section.title}
                    onChange={(e) => updateSection(activeId, { title: e.target.value })}
                    onFocus={(e) => handleRegisterFocus(e.currentTarget, (val: string) => updateSection(activeId, { title: val }))}
                    placeholder="输入章节标题..."
                  />
                  <div className="flex items-center gap-2 group">
                    <Italic className="w-4 h-4 text-stone-300 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      className="bg-transparent w-full text-sm outline-none text-stone-500 italic placeholder:text-stone-300"
                      value={section.italicNote || ''}
                      onChange={(e) => updateSection(activeId, { italicNote: e.target.value })}
                      onFocus={(e) => handleRegisterFocus(e.currentTarget, (val: string) => updateSection(activeId, { italicNote: val }))}
                      placeholder="添加副标题或场景备注 (可选)..."
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-stone-200/70" />

                {/* Blocks Editor */}
                <BlockListEditor
                  blocks={section.blocks}
                  updateBlock={updateBlock}
                  updateSectionBlocks={(newBlocks: any) => updateSection(activeId, { blocks: newBlocks })}
                  allSections={sections}
                  currentSectionId={activeId}
                  onInsertBlockAt={handleInsertBlockAt}
                  onRegisterFocus={handleRegisterFocus}
                  onMoveBlockToSection={handleMoveBlockToSection}
                  onDuplicateBlockInPlace={handleDuplicateBlockInPlace}
                  onCopyBlockToSection={handleCopyBlockToSection}
                />

                {/* Bottom Quick Navigation */}
                <div className="py-6 border border-amber-200/60 rounded-2xl bg-amber-50/20 p-5 text-center space-y-4 my-8">
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4 text-amber-600" /> 章节续写与大纲导航
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {onAddSectionAt && (
                      <>
                        <button
                          onClick={() => onAddSectionAt(curIdx >= 0 ? curIdx + 1 : sections.length, section.level)}
                          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> 在此下方新建同级章节
                        </button>
                        <button
                          onClick={() => onAddSectionAt(curIdx >= 0 ? curIdx + 1 : sections.length, Math.min(((section.level || 3) + 1) as any, 5))}
                          className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-600" /> 新建下级子章节
                        </button>
                      </>
                    )}
                    <button
                      onClick={goBack}
                      className="flex items-center gap-1.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-stone-400" /> 返回大纲概览
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Dedicated Column with Pinned Scope Switcher & Independent Scrollable Live Preview */}
        {(viewLayout === 'preview' || viewLayout === 'split') && (
          <div className={`${viewLayout === 'split' ? 'w-full lg:w-1/2' : 'w-full'} h-full flex flex-col overflow-hidden bg-stone-950`}>
            {/* 📌 Pinned Top Scope Bar for Right Preview */}
            <div className="flex-shrink-0 z-20 px-4 md:px-6 py-2 border-b border-stone-700/60 bg-stone-900 shadow-xs flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400/90 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" /> 实时渲染预览
                </span>
                <span className="text-[11px] text-stone-500 font-mono">
                  {previewMode === 'single' ? `· 当前正在编辑: ${section.title || '当前小节'}` : '· 全篇连贯预览'}
                </span>
              </div>
              
              {/* Scope Switcher */}
              <div className="flex items-center gap-1 bg-stone-800 p-0.5 rounded-lg border border-stone-700">
                <button
                  type="button"
                  onClick={() => setPreviewMode('single')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    previewMode === 'single'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="仅同步展示左侧正在精细修改的当前章节"
                >
                  🎯 当前小节排版
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('full')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    previewMode === 'full'
                      ? 'bg-amber-500 text-stone-950 shadow-2xs font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="展示包括作品简介、大纲和全部章节的完整排版视图"
                >
                  📖 全篇连贯视图
                </button>
              </div>
            </div>

            {/* 📜 Scrollable Preview Content */}
            <div 
              id="right-preview-scroll" 
              className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth"
            >
              <div className="max-w-3xl mx-auto">
                <PreviewView 
                  data={projectData} 
                  activeSectionId={previewMode === 'single' ? activeId : undefined} 
                  hideTopBar={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BlockListEditor = ({ 
  blocks, 
  updateBlock, 
  updateSectionBlocks, 
  allSections, 
  currentSectionId, 
  onMoveBlockToSection, 
  onDuplicateBlockInPlace,
  onCopyBlockToSection,
  onInsertBlockAt, 
  onRegisterFocus 
}: any) => (
  <div className="space-y-3">
    {blocks.length > 0 && <InsertBlockDivider onInsert={(type) => onInsertBlockAt(0, type)} />}
    
    {blocks.map((b: ContentBlock, idx: number) => (
        <React.Fragment key={b.id}>
          <div className={Styles.blockWrapper}>
            <div className={Styles.blockHeader}>
                <div className="flex items-center gap-2">
                   <GripVertical className="w-3 h-3 text-stone-300" />
                   <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{b.type}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* 1. Duplicate in current section (e.g. duplicate tables, enemy cards, callouts) */}
                    <button 
                      type="button"
                      onClick={() => onDuplicateBlockInPlace && onDuplicateBlockInPlace(b.id)}
                      className="flex items-center gap-1 text-[10px] font-bold text-stone-600 hover:text-amber-800 bg-white hover:bg-amber-50 px-2 py-0.5 rounded border border-stone-200 hover:border-amber-300 transition-colors shadow-2xs cursor-pointer"
                      title="在当前章节就地下方复制一份（含表格、数据与卡片）"
                    >
                      <Copy className="w-2.5 h-2.5 text-amber-600" />
                      <span>复制</span>
                    </button>

                    {/* 2. Move to another section */}
                    {allSections && allSections.length > 1 && (
                       <select 
                          className="text-[10px] bg-white border border-stone-200 rounded px-1.5 py-0.5 outline-none text-stone-600 hover:text-amber-800 font-sans cursor-pointer transition-colors shadow-2xs"
                          value=""
                          onChange={(e) => {
                             if (e.target.value && onMoveBlockToSection) {
                                onMoveBlockToSection(b.id, e.target.value);
                             }
                             e.target.value = '';
                          }}
                          title="将此区块从当前章节移出并放入目标章节"
                       >
                          <option value="" disabled>🚚 移动至章节...</option>
                          {allSections.map((s: any) => (
                             s.id !== currentSectionId ? (
                                <option key={s.id} value={s.id}>
                                   ➡️ 移到: {s.title || '未命名章节'}
                                </option>
                             ) : null
                          ))}
                       </select>
                    )}

                    {/* 3. Copy to another section */}
                    {allSections && allSections.length > 1 && (
                       <select 
                          className="text-[10px] bg-white border border-stone-200 rounded px-1.5 py-0.5 outline-none text-stone-600 hover:text-amber-800 font-sans cursor-pointer transition-colors shadow-2xs"
                          value=""
                          onChange={(e) => {
                             if (e.target.value && onCopyBlockToSection) {
                                onCopyBlockToSection(b.id, e.target.value);
                             }
                             e.target.value = '';
                          }}
                          title="复制一份副本发送到目标章节（当前小节内容保留）"
                       >
                          <option value="" disabled>📋 复制至章节...</option>
                          {allSections.map((s: any) => (
                             s.id !== currentSectionId ? (
                                <option key={s.id} value={s.id}>
                                   ➕ 复制到: {s.title || '未命名章节'}
                                </option>
                             ) : null
                          ))}
                       </select>
                    )}

                    <div className="w-px h-3 bg-stone-200 mx-0.5"></div>
                    <button onClick={() => { const nb=[...blocks]; if(idx>0){[nb[idx],nb[idx-1]]=[nb[idx-1],nb[idx]]; updateSectionBlocks(nb);} }} className={Styles.iconBtn} title="上移"><MoveUp className="w-3 h-3" /></button>
                    <button onClick={() => { const nb=[...blocks]; if(idx<nb.length-1){[nb[idx],nb[idx+1]]=[nb[idx+1],nb[idx]]; updateSectionBlocks(nb);} }} className={Styles.iconBtn} title="下移"><MoveDown className="w-3 h-3" /></button>
                    <div className="w-px h-3 bg-stone-200 mx-0.5"></div>
                    <button onClick={() => { if(confirm('删除此区块？')) updateSectionBlocks(blocks.filter((x:any)=>x.id!==b.id)) }} className={Styles.deleteBtn} title="删除"><Trash2 className="w-3 h-3" /></button>
                </div>
            </div>
            <div className={`${Styles.blockContent} ${b.type === 'text' ? 'pt-2' : ''}`}>
                <BlockEditor block={b} updateBlock={updateBlock} onRegisterFocus={onRegisterFocus} />
            </div>
          </div>

          <InsertBlockDivider onInsert={(type) => onInsertBlockAt(idx + 1, type)} />
        </React.Fragment>
    ))}
    
    {blocks.length === 0 && (
      <div className="text-center py-16 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50 space-y-4">
        <p className="font-serif text-sm font-bold text-stone-600">当前小节暂无内容，点击下方类型即可快速创建：</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto px-4">
          {BLOCK_TYPE_CONFIGS.map(cfg => {
            const Icon = cfg.icon;
            return (
              <button
                key={cfg.type}
                type="button"
                onClick={() => onInsertBlockAt(0, cfg.type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-stone-200 transition-all cursor-pointer shadow-xs ${cfg.color}`}
              >
                <Icon className="w-4 h-4" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

const BlockEditor = ({ block, updateBlock, onRegisterFocus }: { block: ContentBlock, updateBlock: (id: string, d: any) => void, onRegisterFocus?: (ref: React.RefObject<HTMLTextAreaElement | null>, setValue: (v: string) => void) => void }) => {
  const u = (d: any) => updateBlock(block.id, d);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        u({ url: base64 });
      } catch(err) { alert('图片上传失败'); }
    }
  };

  switch (block.type) {
    case 'text': 
      return (
        <div className="w-full group">
          <SmartTextarea 
            value={block.content} 
            onChangeValue={val => u({ content: val })} 
            onRegisterFocus={onRegisterFocus}
            placeholder="在此输入正文内容 (支持 Markdown 语法与便捷格式工具)..." 
            minRows={block.content.length > 200 ? 8 : 4} 
          />
        </div>
      );
    case 'subsection': return <div className="w-full"><input className="font-bold text-xl text-stone-800 w-full border-b border-transparent hover:border-stone-200 focus:border-amber-500 py-2 outline-none transition-all placeholder:text-stone-300" value={block.title} onChange={e => u({ title: e.target.value })} placeholder="小节标题" /></div>;
    case 'divider': return <div className="h-4 flex items-center justify-center"><div className="w-full border-t border-stone-200 border-dashed"></div></div>;
    case 'image': 
      return (
        <div className="space-y-4">
          <div className="bg-stone-50 h-56 rounded-lg flex flex-col items-center justify-center overflow-hidden border border-stone-100 relative group">
            {block.url ? <img src={block.url} className="h-full object-contain" /> : <div className="text-center text-stone-300"><ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" /><span>暂无图片</span></div>}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <label className="bg-white text-stone-800 px-4 py-2 rounded-lg cursor-pointer text-xs font-bold hover:bg-amber-50">
                    更换图片 <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input className={Styles.modernInput} value={block.url} onChange={e => u({ url: e.target.value })} placeholder="或输入图片 URL" />
             <input className={Styles.modernInput} value={block.caption} onChange={e => u({ caption: e.target.value })} placeholder="图片说明 (可选)" />
          </div>
        </div>
      );
    case 'read_aloud': 
      return (
        <div className="flex gap-4">
          <div className="w-1 bg-indigo-300 rounded-full"></div>
          <div className="flex-1">
            <SmartTextarea 
              label="向玩家朗读" 
              value={block.content} 
              onChangeValue={val => u({ content: val })} 
              onRegisterFocus={onRegisterFocus}
              placeholder="输入朗读文本..." 
              minRows={4} 
            />
          </div>
        </div>
      );
    case 'callout': 
      return (
        <div className={`p-4 rounded-lg border space-y-3 ${block.variant==='warning'?'bg-red-50/50 border-red-100':block.variant==='tip'?'bg-amber-50/50 border-amber-100':'bg-stone-50/50 border-stone-100'}`}>
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold opacity-40 uppercase">GM 提示</div>
            <div className="flex gap-1">
              <button onClick={()=>u({variant:'info'})} title="信息" className="w-3.5 h-3.5 rounded-full bg-stone-300 hover:bg-stone-500"/>
              <button onClick={()=>u({variant:'tip'})} title="提示" className="w-3.5 h-3.5 rounded-full bg-amber-300 hover:bg-amber-500"/>
              <button onClick={()=>u({variant:'warning'})} title="警告" className="w-3.5 h-3.5 rounded-full bg-red-300 hover:bg-red-500"/>
            </div>
          </div>
          <input className="font-bold text-stone-800 bg-transparent border-b border-stone-200 focus:border-amber-500 outline-none w-full py-1 text-sm" value={block.title} onChange={e => u({ title: e.target.value })} placeholder="标题..." />
          <SmartTextarea 
            value={block.content} 
            onChangeValue={val => u({ content: val })} 
            onRegisterFocus={onRegisterFocus}
            placeholder="提示内容..." 
            minRows={3} 
          />
        </div>
      );
    case 'outcome': return <OutcomeEditor block={block} updateBlock={updateBlock} onRegisterFocus={onRegisterFocus} />;
    case 'enemy': return <EnemyEditor block={block} updateBlock={updateBlock} onRegisterFocus={onRegisterFocus} />;
    case 'environment': return <EnvironmentEditor block={block} updateBlock={updateBlock} onRegisterFocus={onRegisterFocus} />;
    case 'cyberware': return <CyberwareEditor block={block} updateBlock={updateBlock} onRegisterFocus={onRegisterFocus} />;
    case 'table': return <TableEditor block={block} updateBlock={updateBlock} onRegisterFocus={onRegisterFocus} />;
    default: return <div>未知区块</div>;
  }
};

const OutcomeEditor = ({ block, updateBlock, onRegisterFocus }: { block: OutcomeBlock, updateBlock: any, onRegisterFocus?: any }) => {
  const entries = block.entries || [];
  const updateEntry = (id: string, updates: any) => {
    updateBlock(block.id, { entries: entries.map(e => e.id === id ? { ...e, ...updates } : e) });
  };

  const removeEntry = (id: string) => {
    updateBlock(block.id, { entries: entries.filter(e => e.id !== id) });
  };

  const toggleTag = (id: string, tag: OutcomeTag) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    let newTags = entry.tags.includes(tag) 
      ? entry.tags.filter(t => t !== tag) 
      : [...entry.tags, tag];
    
    // Logic enforcement
    if (tag === 'success') newTags = newTags.filter(t => t !== 'failure');
    if (tag === 'failure') newTags = newTags.filter(t => t !== 'success' && t !== 'critical');
    if (tag === 'hope') newTags = newTags.filter(t => t !== 'fear');
    if (tag === 'fear') newTags = newTags.filter(t => t !== 'hope');
    if (tag === 'critical') newTags = newTags.filter(t => t !== 'failure').includes('success') ? newTags : [...newTags, 'success'];

    updateEntry(id, { tags: newTags });
  };

  const addEntry = () => {
    updateBlock(block.id, { entries: [...entries, { id: generateId(), tags: ['success'], content: '' }] });
  };

  const addPreset = (tags: OutcomeTag[], defaultContent: string) => {
    updateBlock(block.id, { entries: [...entries, { id: generateId(), tags, content: defaultContent }] });
  };

  return (
    <div className="bg-teal-50/30 p-4 rounded-xl border border-teal-100 space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
         <div className="text-xs font-black text-teal-600 uppercase tracking-widest flex items-center gap-2">
            <ListChecks className="w-4 h-4" /> 检定结果分支
         </div>
         <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-stone-400 font-bold uppercase">一键组合:</span>
            <button onClick={() => addPreset(['success', 'hope'], '动作成功，并带来了希望/额外利益。')} className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer">+ 希望成功</button>
            <button onClick={() => addPreset(['success', 'fear'], '动作成功，但伴随代价或风险，GM获得 1 恐惧点。')} className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer">+ 恐惧成功</button>
            <button onClick={() => addPreset(['failure', 'fear'], '动作失败且威胁升级，GM获得 1 恐惧点。')} className="text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer">+ 恐惧失败</button>
            <button onClick={() => addPreset(['critical'], '完美成功！清空所有压力或引发戏剧性突破。')} className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-bold transition-colors cursor-pointer">+ 关键成功</button>
         </div>
      </div>
      
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white p-3 rounded-lg border border-teal-100/50 shadow-sm group">
             <div className="flex flex-wrap gap-2 mb-2">
                <button onClick={() => toggleTag(entry.id, 'critical')} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${entry.tags.includes('critical') ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-stone-50 text-stone-300 border-stone-100 hover:border-stone-200'}`}>关键成功</button>
                <button onClick={() => toggleTag(entry.id, 'success')} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${entry.tags.includes('success') ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-stone-50 text-stone-300 border-stone-100 hover:border-stone-200'}`}>成功</button>
                <button onClick={() => toggleTag(entry.id, 'failure')} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${entry.tags.includes('failure') ? 'bg-red-100 text-red-700 border-red-200' : 'bg-stone-50 text-stone-300 border-stone-100 hover:border-stone-200'}`}>失败</button>
                <div className="w-px bg-stone-100 mx-1"></div>
                <button onClick={() => toggleTag(entry.id, 'hope')} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${entry.tags.includes('hope') ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-stone-50 text-stone-300 border-stone-100 hover:border-stone-200'}`}>希望</button>
                <button onClick={() => toggleTag(entry.id, 'fear')} className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${entry.tags.includes('fear') ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-stone-50 text-stone-300 border-stone-100 hover:border-stone-200'}`}>恐惧</button>
             </div>
             <div className="flex gap-2">
                <textarea 
                  className="w-full text-sm outline-none text-stone-700 placeholder:text-stone-300 resize-none bg-transparent" 
                  rows={2} 
                  value={entry.content} 
                  onChange={(e) => updateEntry(entry.id, { content: e.target.value })} 
                  onFocus={(e) => onRegisterFocus?.(e.currentTarget, (val: string) => updateEntry(entry.id, { content: val }))}
                  placeholder="在此输入结果描述 (支持 Markdown 语法)..." 
                />
                <button onClick={() => removeEntry(entry.id)} className="text-stone-300 hover:text-red-400 self-start opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"><XCircle className="w-4 h-4" /></button>
             </div>
          </div>
        ))}
      </div>
      
      <button onClick={addEntry} className="w-full py-2 border border-dashed border-teal-200 rounded-lg text-teal-600 text-xs font-bold hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
         <Plus className="w-3 h-3" /> 添加自定义结果项
      </button>
    </div>
  );
};

const TableEditor = ({ block, updateBlock, onRegisterFocus }: any) => {
  const addRow = () => updateBlock(block.id, { rows: [...block.rows, new Array(block.headers.length).fill('')] });
  const addColumn = () => {
    const newHeaders = [...block.headers, '新列'];
    const newRows = block.rows.map((row: string[]) => [...row, '']);
    updateBlock(block.id, { headers: newHeaders, rows: newRows });
  };
  const removeRow = (idx: number) => updateBlock(block.id, { rows: block.rows.filter((_:any, i:number) => i !== idx) });
  const removeColumn = (idx: number) => {
    if (block.headers.length <= 1) return;
    updateBlock(block.id, { 
      headers: block.headers.filter((_:any, i:number) => i !== idx),
      rows: block.rows.map((row: string[]) => row.filter((_:any, i:number) => i !== idx))
    });
  };

  return (
    <div className="space-y-4">
      <div className="border border-stone-200 rounded-lg overflow-hidden shadow-sm bg-stone-50/30">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="flex bg-stone-100 border-b border-stone-200">
              {block.headers.map((h: string, i: number) => (
                <div key={i} className="flex-1 min-w-[100px] p-2 border-r border-stone-200 last:border-0 relative group">
                  <input 
                    value={h} 
                    onChange={e => { const nh = [...block.headers]; nh[i] = e.target.value; updateBlock(block.id, { headers: nh }); }} 
                    onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => { const nh = [...block.headers]; nh[i] = val; updateBlock(block.id, { headers: nh }); })}
                    className="bg-transparent w-full text-xs font-bold text-center outline-none text-stone-700 placeholder:text-stone-300" 
                    placeholder={`列 ${i + 1}`}
                  />
                  <button onClick={() => removeColumn(i)} className="absolute top-0 right-0 p-1 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
            {block.rows.map((row: string[], ri: number) => (
              <div key={ri} className="flex border-b border-stone-100 last:border-0 group bg-white">
                {row.map((cell: string, ci: number) => (
                  <div key={ci} className="flex-1 min-w-[100px] p-2 border-r border-stone-100 last:border-0">
                    <input 
                      value={cell} 
                      onChange={e => { const nr = [...block.rows]; nr[ri][ci] = e.target.value; updateBlock(block.id, { rows: nr }); }} 
                      onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => { const nr = [...block.rows]; nr[ri][ci] = val; updateBlock(block.id, { rows: nr }); })}
                      className="bg-transparent w-full text-sm outline-none placeholder:text-stone-300" 
                      placeholder="单元格..."
                    />
                  </div>
                ))}
                <button onClick={() => removeRow(ri)} className="absolute right-2 mt-2 opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={addRow} className={Styles.secondaryBtn}>+ 添加行</button>
        <button onClick={addColumn} className={Styles.secondaryBtn}>+ 添加列</button>
      </div>
    </div>
  );
};

const EnemyEditor = ({ block, updateBlock, onRegisterFocus }: { block: EnemyBlock, updateBlock: any, onRegisterFocus?: any }) => {
  const setStat = (key: string, val: any) => updateBlock(block.id, { stats: { ...block.stats, [key]: val } });
  const setAtk = (key: string, val: any) => updateBlock(block.id, { attack: { ...block.attack, [key]: val } });
  const addTrait = () => updateBlock(block.id, { traits: [...(block.traits || []), { id: generateId(), name: '新特性', type: 'passive', description: '', flavor: '', isSpecial: false }] });
  const updateTrait = (tId: string, updates: any) => updateBlock(block.id, { traits: block.traits.map(t => t.id === tId ? { ...t, ...updates } : t) });
  const removeTrait = (tId: string) => updateBlock(block.id, { traits: block.traits.filter(t => t.id !== tId) });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        updateBlock(block.id, { avatarUrl: base64 });
      } catch (err) { alert('头像上传失败'); }
    }
  };

  return (
    <div className="space-y-6">
       {/* Top Header Card */}
       <div className="flex flex-col sm:flex-row gap-5 bg-red-50/30 p-4 rounded-xl border border-red-100">
         {/* Avatar area */}
         <div className="flex sm:flex-col items-center justify-center gap-3">
            <div className={`w-24 h-24 bg-stone-100 border-2 border-red-300/80 flex flex-col items-center justify-center relative overflow-hidden shadow-sm ${block.avatarShape === 'square' ? 'rounded-xl' : block.avatarShape === 'none' ? 'rounded-none border-dashed' : 'rounded-full'}`}>
              {block.avatarUrl ? (
                <img src={block.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-stone-400 p-2">
                  <Swords className="w-6 h-6 mx-auto mb-1 text-red-400 opacity-80" />
                  <span className="text-[9px] font-bold uppercase">立绘头像</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 w-full max-w-[120px]">
              <label className="text-[10px] text-center bg-white hover:bg-red-50 text-red-700 font-bold px-2 py-1 rounded border border-red-200 cursor-pointer shadow-2xs transition-colors">
                {block.avatarUrl ? '更换立绘' : '上传立绘'}
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </label>
              {block.avatarUrl && (
                <button 
                  onClick={() => updateBlock(block.id, { avatarUrl: '' })}
                  className="text-[9px] text-stone-400 hover:text-red-500 text-center py-0.5 cursor-pointer"
                >
                  移除立绘
                </button>
              )}
            </div>
         </div>

         {/* Base Info Fields */}
         <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-red-600" /> 敌人与NPC卡片
                </span>
              </div>
              {/* NPC Mode Switch */}
              <button
                type="button"
                onClick={() => updateBlock(block.id, { isNpcMode: !block.isNpcMode })}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  block.isNpcMode 
                    ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-xs' 
                    : 'bg-white text-stone-600 border-stone-200 hover:border-red-200'
                }`}
                title="切换常规战斗敌人模式 / NPC社交剧情模式"
              >
                <span>{block.isNpcMode ? '👤 NPC模式 (简化数值)' : '⚔️ 常规敌人模式'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-0.5"><label className={Styles.label}>名称</label><input className={Styles.modernInput} value={block.name} onChange={e => updateBlock(block.id, { name: e.target.value })} placeholder="例如：锯齿刀强盗" /></div>
              <div className="space-y-0.5"><label className={Styles.label}>英文名</label><input className={Styles.modernInput} value={block.englishName || ''} onChange={e => updateBlock(block.id, { englishName: e.target.value })} placeholder="例如：JAGGED BANDIT" /></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-0.5">
                <label className={Styles.label}>位阶 (Tier 1-4)</label>
                <select className="w-full bg-transparent border-b border-stone-200 py-1.5 text-sm outline-none font-bold text-stone-700 cursor-pointer" value={block.tier || 1} onChange={e => updateBlock(block.id, { tier: parseInt(e.target.value) })}>
                  <option value={1}>位阶 1</option>
                  <option value={2}>位阶 2</option>
                  <option value={3}>位阶 3</option>
                  <option value={4}>位阶 4</option>
                </select>
              </div>
              <div className="space-y-0.5">
                <label className={Styles.label}>敌人类型</label>
                <input className={Styles.modernInput} value={block.enemyType || ''} onChange={e => updateBlock(block.id, { enemyType: e.target.value })} placeholder="标准/斗士/集群/头目/杂兵/独狼" list="enemy-type-presets" />
                <datalist id="enemy-type-presets">
                  <option value="标准" />
                  <option value="斗士" />
                  <option value="集群" />
                  <option value="头目" />
                  <option value="杂兵" />
                  <option value="远程" />
                  <option value="潜伏" />
                  <option value="社交" />
                  <option value="独狼" />
                  <option value="辅助" />
                </datalist>
              </div>
              <div className="space-y-0.5">
                <label className={Styles.label}>立绘形状</label>
                <select className="w-full bg-transparent border-b border-stone-200 py-1.5 text-xs outline-none text-stone-600 cursor-pointer" value={block.avatarShape || 'circle'} onChange={e => updateBlock(block.id, { avatarShape: e.target.value })}>
                  <option value="circle">圆形边框</option>
                  <option value="square">圆角矩形</option>
                  <option value="none">无边框立绘</option>
                </select>
              </div>
            </div>
         </div>
       </div>

       {/* Combat Stats Grid */}
       <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200/80 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">数值与战斗属性</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] text-stone-400 font-bold">HP/压力呈现:</span>
              <select className="bg-white border border-stone-200 rounded px-2 py-0.5 text-xs font-bold text-stone-600 outline-none cursor-pointer" value={block.healthDisplay || 'both'} onChange={e => updateBlock(block.id, { healthDisplay: e.target.value })}>
                <option value="both">数字 + 打勾圆点</option>
                <option value="dots">仅打勾圆点</option>
                <option value="number">纯数字</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1"><label className={Styles.label}>难度 (Difficulty)</label><input className={Styles.modernInput} type="number" value={block.stats.difficulty} onChange={e=>setStat('difficulty', parseInt(e.target.value))} /></div>
            <div className="space-y-1"><label className={Styles.label}>阈值 (轻度 / 重度)</label><div className="flex gap-2 items-center"><input className={Styles.modernInput} type="number" value={block.stats.thresholdMinor} onChange={e=>setStat('thresholdMinor', parseInt(e.target.value))} /><span className="text-stone-300">/</span><input className={Styles.modernInput} type="number" value={block.stats.thresholdMajor} onChange={e=>setStat('thresholdMajor', parseInt(e.target.value))} /></div></div>
            <div className="space-y-1"><label className={Styles.label}>HP (生命槽)</label><input className={Styles.modernInput} type="number" min={1} value={block.stats.hp} onChange={e=>setStat('hp', parseInt(e.target.value))} /></div>
            <div className="space-y-1"><label className={Styles.label}>压力 (Stress)</label><input className={Styles.modernInput} type="number" min={0} value={block.stats.stress} onChange={e=>setStat('stress', parseInt(e.target.value))} /></div>
          </div>
       </div>

       {/* Narrative & Tactics */}
       <div className="space-y-3">
          <div className="space-y-1">
            <label className={Styles.label}>外观风味与举止描述 (支持 Markdown、==高亮== 与回车换行)</label>
            <textarea 
              className={Styles.modernTextarea} 
              rows={2} 
              value={block.flavor || ''} 
              onChange={e => updateBlock(block.id, { flavor: e.target.value })} 
              onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { flavor: val }))}
              placeholder="例如：身材魁梧，手握生锈弯刀，眼神狠戾..." 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={Styles.label}>动机与战术 (Motivation & Tactics)</label>
              <input 
                className={Styles.modernInput} 
                value={block.tactics || ''} 
                onChange={e => updateBlock(block.id, { tactics: e.target.value })} 
                onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { tactics: val }))}
                placeholder="例如：优先突袭后排施法者，残血时企图逃跑..." 
              />
            </div>
            <div className="space-y-1">
              <label className={Styles.label}>经历与背景加成 (Experiences)</label>
              <input 
                className={Styles.modernInput} 
                value={block.experiences || ''} 
                onChange={e => updateBlock(block.id, { experiences: e.target.value })} 
                onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { experiences: val }))}
                placeholder="例如：熟悉地下黑市 +2，恐吓 +1" 
              />
            </div>
          </div>
       </div>
       
       {/* Attack Weapon Section */}
       <div className="border-t border-dashed border-stone-200 pt-4">
          <div className="flex justify-between items-center mb-2">
             <div className={Styles.label}>主要武器 / 攻击方式</div>
             <div className="flex gap-2 items-center text-xs">
                <span className="text-[10px] text-stone-400 font-bold">伤害类型:</span>
                <select className="bg-stone-100 rounded px-2 py-0.5 outline-none text-xs font-bold text-stone-600 cursor-pointer" value={block.attack.damageType || 'physical'} onChange={e=>setAtk('damageType', e.target.value)}>
                   <option value="physical">物理伤害 (Physical)</option>
                   <option value="magical">魔法伤害 (Magical)</option>
                </select>
             </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
             <input className={Styles.modernInput} value={block.attack.name} onChange={e=>setAtk('name', e.target.value)} placeholder="武器名称 (如: 锯齿匕首)" />
             <div className="relative">
                <input className={Styles.modernInput} value={block.attack.range} onChange={e=>setAtk('range', e.target.value)} placeholder="攻击范围" list="range-options" />
                <datalist id="range-options">
                   <option value="近战范围" />
                   <option value="邻近范围" />
                   <option value="近距离范围" />
                   <option value="远距离范围" />
                   <option value="极远范围" />
                </datalist>
             </div>
             <input className={Styles.modernInput} value={block.attack.modifier} onChange={e=>setAtk('modifier', e.target.value)} placeholder="调整值 (如: +2)" />
             <input className={Styles.modernInput} value={block.attack.damage} onChange={e=>setAtk('damage', e.target.value)} placeholder="伤害骰 (如: 1d8+2)" />
          </div>
       </div>

       {/* Traits & Special Abilities */}
       <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
             <label className={Styles.label}>特性与特殊能力 ({block.traits?.length || 0})</label>
             <button onClick={addTrait} className="text-[10px] font-bold text-red-600 hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-md transition-colors uppercase tracking-wide cursor-pointer">+ 添加特性</button>
          </div>
          <div className="grid gap-3">
             {(block.traits || []).map((t: Trait) => (
                <div key={t.id} className={`relative p-3.5 rounded-xl border transition-all shadow-2xs space-y-2.5 ${t.isSpecial ? 'bg-amber-50/40 border-amber-300' : 'bg-white border-stone-200 hover:border-red-200'}`}>
                   <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <select className="text-[10px] bg-stone-100 rounded px-2 py-1 outline-none font-bold uppercase tracking-wider text-stone-600 cursor-pointer" value={t.type} onChange={e=>updateTrait(t.id,{type:e.target.value as any})}>
                           <option value="passive">被动</option>
                           <option value="action">动作</option>
                           <option value="reaction">反应</option>
                           <option value="spotlight">聚焦动作 (Spotlight)</option>
                        </select>
                        <input className="font-bold text-sm bg-transparent flex-1 outline-none text-stone-800" value={t.name} onChange={e=>updateTrait(t.id,{name:e.target.value})} placeholder="特性名称 (例如: 嗜血本能)" />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Special Trait Toggle */}
                        <button
                          type="button"
                          onClick={() => updateTrait(t.id, { isSpecial: !t.isSpecial })}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            t.isSpecial 
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs' 
                              : 'bg-stone-50 text-stone-400 border-stone-200 hover:border-amber-300 hover:text-amber-700'
                          }`}
                          title="标记为特殊能力/阶段技能（将独立高亮框展示）"
                        >
                          {t.isSpecial ? '🌟 特殊能力/阶段' : '常规特性'}
                        </button>
                        <button onClick={()=>removeTrait(t.id)} className="text-stone-300 hover:text-red-500 p-1 cursor-pointer" title="删除特性"><X className="w-3.5 h-3.5" /></button>
                      </div>
                   </div>

                   <textarea 
                     className="w-full text-xs bg-transparent outline-none resize-none text-stone-700 placeholder:text-stone-300" 
                     rows={2} 
                     value={t.description} 
                     onChange={e=>updateTrait(t.id,{description:e.target.value})} 
                     onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateTrait(t.id, { description: val }))}
                     placeholder="机制描述与效果 (支持 Markdown 语法与 ==高亮==)..." 
                   />
                   <input 
                     className="w-full text-[11px] italic text-stone-500 bg-stone-50/60 rounded px-2 py-1 outline-none placeholder:text-stone-300" 
                     value={t.flavor || ''} 
                     onChange={e=>updateTrait(t.id,{flavor:e.target.value})} 
                     onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateTrait(t.id, { flavor: val }))}
                     placeholder="斜体风味文案 (例如: 刀尖饮血之时，狂性大发)..." 
                   />
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

const EnvironmentEditor = ({ block, updateBlock, onRegisterFocus }: { block: EnvironmentBlock, updateBlock: any, onRegisterFocus?: any }) => {
  const addFeature = () => updateBlock(block.id, { features: [...(block.features || []), { id: generateId(), name: '新特性', type: 'passive', description: '', questions: '' }] });
  const updateFeature = (fId: string, updates: any) => updateBlock(block.id, { features: block.features.map(f => f.id === fId ? { ...f, ...updates } : f) });
  const removeFeature = (fId: string) => updateBlock(block.id, { features: block.features.filter(f => f.id !== fId) });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        updateBlock(block.id, { imageUrl: base64 });
      } catch (err) { alert('场景图片上传失败'); }
    }
  };

  return (
    <div className="space-y-6">
       {/* Top Header Card */}
       <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 space-y-4">
         <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
               <Mountain className="w-4 h-4 text-emerald-600" /> 环境与险境卡片
            </span>
         </div>

         {/* Scene Banner Upload */}
         <div className="space-y-2">
            <label className={Styles.label}>场景插画 / 横幅封面 (可选)</label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {block.imageUrl ? (
                <div className="relative w-full sm:w-48 h-24 rounded-lg overflow-hidden border border-emerald-300/70 shadow-xs group">
                  <img src={block.imageUrl} alt="Scene" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => updateBlock(block.id, { imageUrl: '' })}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded p-1 text-[10px] cursor-pointer"
                    title="移除图片"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
              <div className="flex-1 w-full space-y-1.5">
                <div className="flex gap-2 items-center">
                  <label className="bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 cursor-pointer shadow-2xs transition-colors flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{block.imageUrl ? '更换场景图' : '上传场景横幅图'}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <input className={Styles.modernInput} value={block.imageUrl || ''} onChange={e => updateBlock(block.id, { imageUrl: e.target.value })} placeholder="或输入场景图片 URL..." />
                </div>
              </div>
            </div>
         </div>

         {/* Basic Fields */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           <div className="space-y-0.5"><label className={Styles.label}>环境名称</label><input className={Styles.modernInput} value={block.name} onChange={e => updateBlock(block.id, { name: e.target.value })} placeholder="例如：崩塌的熔岩神殿" /></div>
           <div className="space-y-0.5"><label className={Styles.label}>英文名</label><input className={Styles.modernInput} value={block.englishName || ''} onChange={e => updateBlock(block.id, { englishName: e.target.value })} placeholder="例如：COLLAPSING LAVA TEMPLE" /></div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
           <div className="space-y-0.5">
             <label className={Styles.label}>位阶 (Tier 1-4)</label>
             <select className="w-full bg-transparent border-b border-stone-200 py-1.5 text-sm outline-none font-bold text-stone-700 cursor-pointer" value={block.tier || 1} onChange={e => updateBlock(block.id, { tier: parseInt(e.target.value) })}>
               <option value={1}>位阶 1</option>
               <option value={2}>位阶 2</option>
               <option value={3}>位阶 3</option>
               <option value={4}>位阶 4</option>
             </select>
           </div>
           <div className="space-y-0.5">
             <label className={Styles.label}>环境类型</label>
             <input className={Styles.modernInput} value={block.envType} onChange={e => updateBlock(block.id, { envType: e.target.value })} placeholder="险境/战场/自然危机/社交" list="env-type-presets" />
             <datalist id="env-type-presets">
               <option value="险境" />
               <option value="战场" />
               <option value="自然危机" />
               <option value="神秘异境" />
               <option value="社交场合" />
             </datalist>
           </div>
           <div className="space-y-0.5"><label className={Styles.label}>环境难度 (Difficulty)</label><input type="number" className={Styles.modernInput} value={block.difficulty} onChange={e => updateBlock(block.id, { difficulty: parseInt(e.target.value) })} /></div>
         </div>
       </div>

       {/* Description */}
       <div className="space-y-1">
         <label className={Styles.label}>场景环境描述 (支持 Markdown、==高亮== 与回车换行)</label>
         <textarea 
           className={Styles.modernTextarea} 
           rows={3} 
           value={block.description} 
           onChange={e => updateBlock(block.id, { description: e.target.value })} 
           onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { description: val }))}
           placeholder="详细描述周围的环境景象、危险征兆与感官细节..." 
         />
       </div>
      
       {/* Trend & Potential Enemies */}
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={Styles.label}>环境动向与趋向 (Tendencies)</label>
            <input 
              className={Styles.modernInput} 
              value={block.trend || ''} 
              onChange={e => updateBlock(block.id, { trend: e.target.value })} 
              onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { trend: val }))}
              placeholder="例如：毒雾蔓延、水位上涨、结构坍塌..." 
            />
          </div>
          <div className="space-y-1">
            <label className={Styles.label}>潜在敌人与威胁 (Potential Enemies)</label>
            <input 
              className={Styles.modernInput} 
              value={block.potentialEnemies || ''} 
              onChange={e => updateBlock(block.id, { potentialEnemies: e.target.value })} 
              onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { potentialEnemies: val }))}
              placeholder="例如：熔岩潜伏者、落石陷阱、恐慌的守卫..." 
            />
          </div>
       </div>

       {/* Countdown Mechanism */}
       <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
             <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">⏱️ 环境倒计时与危机升级 (Countdown)</span>
             <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 font-bold">倒计时骰/步数:</span>
                <input type="number" className="w-16 bg-white border border-emerald-300 rounded px-2 py-0.5 text-xs font-bold text-emerald-800 text-center outline-none shadow-2xs" value={block.countdown || ''} onChange={e => updateBlock(block.id, { countdown: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="4/6/8" />
             </div>
          </div>
          <input 
            className="w-full text-xs bg-white border border-emerald-200 rounded-lg px-3 py-2 outline-none text-emerald-900 placeholder:text-emerald-300 shadow-2xs" 
            value={block.countdownDescription || ''} 
            onChange={e => updateBlock(block.id, { countdownDescription: e.target.value })} 
            onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { countdownDescription: val }))}
            placeholder="倒计时结束时触发的戏剧性后果 (如: 洞窟彻底坍塌，所有角色需进行敏捷检定)..." 
          />
       </div>

       {/* Environment Features */}
       <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
             <label className={Styles.label}>环境特性与互动机制 ({block.features?.length || 0})</label>
             <button onClick={addFeature} className="text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors uppercase tracking-wide cursor-pointer">+ 添加特性</button>
          </div>
          <div className="grid gap-3">
            {(block.features || []).map((feature) => (
              <div key={feature.id} className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-2.5 group hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-3">
                  <select className="text-[10px] bg-stone-100 rounded px-2 py-1 outline-none font-bold uppercase tracking-wider text-stone-600 cursor-pointer" value={feature.type} onChange={e => updateFeature(feature.id, { type: e.target.value })}>
                     <option value="passive">被动</option>
                     <option value="action">动作</option>
                     <option value="reaction">反应</option>
                     <option value="spotlight">聚焦动作 (Spotlight)</option>
                  </select>
                  <input className="font-bold text-sm bg-transparent flex-1 outline-none text-stone-800" value={feature.name} onChange={e => updateFeature(feature.id, { name: e.target.value })} placeholder="特性名称 (如: 极度滑溜的青苔)" />
                  <button onClick={() => removeFeature(feature.id)} className="text-stone-300 hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
                <textarea 
                  className="w-full text-xs bg-transparent outline-none resize-none text-stone-700 placeholder:text-stone-300" 
                  rows={2} 
                  value={feature.description} 
                  onChange={e => updateFeature(feature.id, { description: e.target.value })} 
                  onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateFeature(feature.id, { description: val }))}
                  placeholder="环境机制描述 (支持 Markdown 语法与 ==高亮==)..." 
                />
                <div className="flex items-center gap-2 bg-emerald-50/40 rounded-lg px-2.5 py-1.5 border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 font-bold shrink-0">💡 GM 引导:</span>
                  <input 
                    className="w-full text-[11px] italic text-emerald-800 bg-transparent outline-none placeholder:text-emerald-300" 
                    value={feature.questions || ''} 
                    onChange={e => updateFeature(feature.id, { questions: e.target.value })} 
                    onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateFeature(feature.id, { questions: val }))}
                    placeholder="引导问题 (如: 玩家如何利用此处的断壁残垣躲避射击？)..." 
                  />
                </div>
              </div>
            ))}
          </div>
       </div>
    </div>
  );
};

const CyberwareEditor = ({ block, updateBlock, onRegisterFocus }: { block: CyberwareBlock, updateBlock: any, onRegisterFocus?: any }) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const presetTypes = ["植入体 (Implant)", "仿生件 (Bionic)", "时尚件 (Fashionware)", "外置设备 (External)", "消耗品 (Consumable)"];
  const presetZones = ["上肢 (Arms)", "下肢 (Legs)", "躯干 (Torso)", "头部 (Head)", "全身 (Full Body)", ""];

  const handleCopyWorkshopJSON = () => {
    const cardData = {
      id: block.id,
      type: 'cyberware',
      name: block.name || '',
      tier: block.tier || '',
      cyberType: block.cyberType || '',
      zone: block.zone || '',
      slots: block.slots || '',
      restriction: block.restriction || '',
      effect: block.effect || '',
      tag: block.tag || '',
      compCost: block.compCost || '',
      surgCost: block.surgCost || '',
      description: block.description || '',
      creator: block.creator || 'GM',
      owner: block.owner || '-'
    };
    navigator.clipboard.writeText(JSON.stringify(cardData, null, 2)).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleApplyImportJSON = () => {
    try {
      const raw = JSON.parse(importJsonText.trim());
      const d = raw.data || raw;
      updateBlock(block.id, {
        name: d.name ?? block.name,
        tier: d.tier ?? block.tier,
        cyberType: d.cyberType ?? block.cyberType,
        zone: d.zone ?? block.zone,
        slots: d.slots ?? block.slots,
        restriction: d.restriction ?? block.restriction,
        effect: d.effect ?? block.effect,
        tag: d.tag ?? block.tag,
        compCost: d.compCost ?? block.compCost,
        surgCost: d.surgCost ?? block.surgCost,
        description: d.description ?? block.description,
        creator: d.creator ?? block.creator,
        owner: d.owner ?? block.owner,
      });
      setShowImportModal(false);
      setImportJsonText('');
      alert("卡牌工坊 JSON 数据导入成功！");
    } catch (e) {
      alert("JSON 解析失败，请检查格式是否正确。");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Quick Action Buttons */}
      <div className="bg-[#0f1117] text-white p-3.5 rounded-xl border border-yellow-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-yellow-400 uppercase tracking-wider">赛博义体卡牌 (CYBERWARE)</div>
            <div className="text-[10px] text-zinc-400">适配《匕首心卡牌工坊V3》数据格式与双向互通</div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={handleCopyWorkshopJSON}
            className="flex-1 sm:flex-initial text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-yellow-300 border border-yellow-500/30 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="复制为卡牌工坊 V3 兼容的 JSON 格式"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copySuccess ? '已复制JSON' : '复制工坊JSON'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="flex-1 sm:flex-initial text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="导入或粘贴来自卡牌工坊 V3 的 JSON"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入工坊JSON</span>
          </button>
        </div>
      </div>

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="p-3 bg-zinc-900 border border-yellow-400/50 rounded-xl space-y-2 text-white animate-in fade-in">
          <div className="flex justify-between items-center text-xs font-bold text-yellow-400">
            <span>粘贴《匕首心卡牌工坊V3》赛博卡牌 JSON：</span>
            <button onClick={() => setShowImportModal(false)} className="text-zinc-400 hover:text-white text-xs cursor-pointer">✕ 取消</button>
          </div>
          <textarea
            value={importJsonText}
            onChange={e => setImportJsonText(e.target.value)}
            rows={4}
            className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs font-mono text-zinc-200 outline-none focus:border-yellow-400"
            placeholder='粘贴格式如: { "type": "cyberware", "name": "微型皮下线圈", ... }'
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowImportModal(false)} className="text-xs px-3 py-1 bg-zinc-800 rounded text-zinc-300">取消</button>
            <button onClick={handleApplyImportJSON} className="text-xs px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded cursor-pointer">应用导入</button>
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Name */}
        <div className="md:col-span-2 space-y-1">
          <label className={Styles.label}>义体 / 装置名称</label>
          <input
            className={Styles.modernInput}
            value={block.name || ''}
            onChange={e => updateBlock(block.id, { name: e.target.value })}
            onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { name: val }))}
            placeholder="例如: 微型皮下线圈、克伦齐科夫..."
          />
        </div>

        {/* Tier */}
        <div className="space-y-1">
          <label className={Styles.label}>位阶 (Tier, 可留空)</label>
          <div className="flex gap-1.5">
            <select
              value={["T1", "T2", "T3", "T4", ""].includes(block.tier || '') ? (block.tier || '') : '__custom__'}
              onChange={e => {
                if (e.target.value !== '__custom__') {
                  updateBlock(block.id, { tier: e.target.value });
                }
              }}
              className="bg-stone-100 border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 font-bold outline-none"
            >
              <option value="T1">T1</option>
              <option value="T2">T2</option>
              <option value="T3">T3</option>
              <option value="T4">T4</option>
              <option value="">留空</option>
              <option value="__custom__">自定义</option>
            </select>
            <input
              className={Styles.modernInput}
              value={block.tier || ''}
              onChange={e => updateBlock(block.id, { tier: e.target.value })}
              onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { tier: val }))}
              placeholder="如 T1"
            />
          </div>
        </div>
      </div>

      {/* Row 2: CyberType, Zone, Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* CyberType */}
        <div className="space-y-1">
          <label className={Styles.label}>类型 (Type)</label>
          <div className="flex gap-1.5">
            <select
              value={presetTypes.includes(block.cyberType || '') ? block.cyberType : '__custom__'}
              onChange={e => {
                if (e.target.value !== '__custom__') {
                  updateBlock(block.id, { cyberType: e.target.value });
                }
              }}
              className="bg-stone-100 border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 outline-none max-w-[110px]"
            >
              {presetTypes.map(t => (
                <option key={t} value={t}>{t.split(' ')[0]}</option>
              ))}
              <option value="__custom__">自定义</option>
            </select>
            <input
              className={Styles.modernInput}
              value={block.cyberType || ''}
              onChange={e => updateBlock(block.id, { cyberType: e.target.value })}
              onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { cyberType: val }))}
              placeholder="如: 植入体 (Implant)"
            />
          </div>
        </div>

        {/* Zone */}
        <div className="space-y-1">
          <label className={Styles.label}>安装部位 (Zone, 可留空)</label>
          <div className="flex gap-1.5">
            <select
              value={presetZones.includes(block.zone || '') ? (block.zone || '') : '__custom__'}
              onChange={e => {
                if (e.target.value !== '__custom__') {
                  updateBlock(block.id, { zone: e.target.value });
                }
              }}
              className="bg-stone-100 border border-stone-200 rounded px-2 py-1 text-xs text-stone-800 outline-none max-w-[100px]"
            >
              {presetZones.map(z => (
                <option key={z} value={z}>{z ? z.split(' ')[0] : '留空'}</option>
              ))}
              <option value="__custom__">自定义</option>
            </select>
            <input
              className={Styles.modernInput}
              value={block.zone || ''}
              onChange={e => updateBlock(block.id, { zone: e.target.value })}
              onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { zone: val }))}
              placeholder="如: 上肢 (Arms)"
            />
          </div>
        </div>

        {/* Slots */}
        <div className="space-y-1">
          <label className={Styles.label}>占用槽位 (Slots)</label>
          <input
            className={Styles.modernInput}
            value={block.slots || ''}
            onChange={e => updateBlock(block.id, { slots: e.target.value })}
            onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { slots: val }))}
            placeholder="例如: 1 或 2"
          />
        </div>
      </div>

      {/* Row 3: Restriction */}
      <div className="space-y-1">
        <label className={Styles.label}>限制与前置条件 (Restrictions)</label>
        <input
          className={Styles.modernInput}
          value={block.restriction || ''}
          onChange={e => updateBlock(block.id, { restriction: e.target.value })}
          onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { restriction: val }))}
          placeholder="例如: 需要灵巧 +1 以上 / 仅限生化义体"
        />
      </div>

      {/* Row 4: Effect */}
      <div className="space-y-1">
        <label className={Styles.label}>机制效果说明 (Effect, 支持 Markdown)</label>
        <SmartTextarea
          value={block.effect || ''}
          onChangeValue={val => updateBlock(block.id, { effect: val })}
          onRegisterFocus={onRegisterFocus}
          placeholder="卡牌的核心效果机制 (例如: 你的徒手近战攻击视为具有【迅捷】特性...)"
          minRows={3}
        />
      </div>

      {/* Row 5: Tag */}
      <div className="space-y-1">
        <label className={Styles.label}>特殊标签 / 警示 (Tag, 可选)</label>
        <input
          className={Styles.modernInput}
          value={block.tag || ''}
          onChange={e => updateBlock(block.id, { tag: e.target.value })}
          onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { tag: val }))}
          placeholder="例如: 【故障隐患】或【人情债务】"
        />
      </div>

      {/* Row 6: Costs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={Styles.label}>元件基础价 (Component Cost)</label>
          <input
            className={Styles.modernInput}
            value={block.compCost || ''}
            onChange={e => updateBlock(block.id, { compCost: e.target.value })}
            onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { compCost: val }))}
            placeholder="例如: 1.5w 信用点"
          />
        </div>
        <div className="space-y-1">
          <label className={Styles.label}>安装手术费 (Surgery Cost)</label>
          <input
            className={Styles.modernInput}
            value={block.surgCost || ''}
            onChange={e => updateBlock(block.id, { surgCost: e.target.value })}
            onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { surgCost: val }))}
            placeholder="例如: 5000 信用点"
          />
        </div>
      </div>

      {/* Row 7: Creator & Owner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={Styles.label}>创作者 (Creator)</label>
          <input
            className={Styles.modernInput}
            value={block.creator || ''}
            onChange={e => updateBlock(block.id, { creator: e.target.value })}
            onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { creator: val }))}
            placeholder="例如: GM 或 荒坂工业"
          />
        </div>
        <div className="space-y-1">
          <label className={Styles.label}>所属 (Owner)</label>
          <input
            className={Styles.modernInput}
            value={block.owner || ''}
            onChange={e => updateBlock(block.id, { owner: e.target.value })}
            onFocus={e => onRegisterFocus?.(e.currentTarget, (val: string) => updateBlock(block.id, { owner: val }))}
            placeholder="例如: V 或 玩家角色名"
          />
        </div>
      </div>

      {/* Row 8: Flavor Description */}
      <div className="space-y-1">
        <label className={Styles.label}>风味描述 / 背景设定 (Description, 可选)</label>
        <SmartTextarea
          value={block.description || ''}
          onChangeValue={val => updateBlock(block.id, { description: val })}
          onRegisterFocus={onRegisterFocus}
          placeholder="斜体背景设定或风味文字..."
          minRows={2}
        />
      </div>
    </div>
  );
};

// --- Preview Components ---

const PreviewView: React.FC<{ 
  data: ProjectData; 
  activeSectionId?: string | null;
  mode?: 'full' | 'single';
  onToggleMode?: () => void;
  hideTopBar?: boolean;
}> = ({ data, activeSectionId, mode = 'full', onToggleMode, hideTopBar = false }) => {
  const theme = THEMES[data.theme || 'default'];
  const bgStyle = data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {};

  // If in 'single' mode (focused on current section for split-view)
  if (mode === 'single' && activeSectionId) {
    const section = data.sections.find(s => s.id === activeSectionId);
    if (section) {
      const isCols = (section.columnMode === 'cols') || (section.level === 5 && section.columnMode !== 'full');

      return (
        <div className="space-y-3">
          {/* Top Scope Control Bar (if not hidden by parent pinned header) */}
          {!hideTopBar && (
            <div className="flex items-center justify-between px-3 py-2 bg-stone-900/90 backdrop-blur-md rounded-xl text-stone-200 text-xs shadow-md border border-stone-700">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <span>🎯 实时同步：当前小节排版</span>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded border border-stone-600">
                  H{section.level || 3}
                </span>
              </span>
              {onToggleMode && (
                <button
                  onClick={onToggleMode}
                  className="text-[11px] font-bold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-lg border border-stone-600 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  title="切换到整篇战役书完整排版视图"
                >
                  <span>切换至全书连贯排版</span>
                  <span className="text-amber-400">📖</span>
                </button>
              )}
            </div>
          )}

          {/* Section Publication Card */}
          <div 
            id="preview-content" 
            style={bgStyle} 
            className={`${theme.bg} ${theme.text} ${theme.fontBody} shadow-2xl rounded-2xl p-[8mm] sm:p-[12mm] print:shadow-none print:w-full print:max-w-none leading-relaxed transition-colors duration-300`}
          >
            <div className={`mb-6 ${section.level === 1 ? `border-b-2 ${theme.border} pb-4` : ''}`}>
              <h2 className={`${theme.fontHead} ${
                section.level === 1 ? `text-4xl font-black ${theme.accent} tracking-tight` : 
                section.level === 2 ? `text-2xl font-bold ${theme.accent} border-l-4 ${theme.border} pl-3` : 
                section.level === 3 ? `text-xl font-bold ${theme.accent} border-b ${theme.border} border-opacity-30 pb-0.5 pr-4` : 
                section.level === 4 ? `text-lg font-bold text-stone-800` :
                `text-base font-bold italic opacity-75`
              } mb-2`}>
                {section.title || "未命名章节"}
              </h2>
              {section.italicNote && <p className="italic text-sm mb-3 opacity-60 font-serif">{section.italicNote}</p>}
            </div>

            <div className={isCols ? 'columns-1 md:columns-2 gap-8 space-y-6' : 'space-y-6 text-justify'}>
              {section.blocks?.map(block => (
                <BlockRenderer key={block.id} block={block} theme={theme} />
              ))}
              {(!section.blocks || section.blocks.length === 0) && (
                <div className="text-center py-12 opacity-40 italic text-sm border-2 border-dashed border-current rounded-xl">
                  (在左侧添加正文、敌人卡或规则提示后，此处将实时展示最终出书排版)
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // Full campaign book rendering mode
  const layoutGroups: { type: 'full' | 'cols', items: DynamicSection[] }[] = [];
  let currentCols: DynamicSection[] = [];

  data.sections.forEach(section => {
    const effectiveMode = section.columnMode || (section.level === 5 ? 'cols' : 'full');
    if (effectiveMode === 'full') {
      if (currentCols.length > 0) {
        layoutGroups.push({ type: 'cols', items: [...currentCols] });
        currentCols = [];
      }
      layoutGroups.push({ type: 'full', items: [section] });
    } else {
      currentCols.push(section);
    }
  });
  if (currentCols.length > 0) layoutGroups.push({ type: 'cols', items: currentCols });

  useEffect(() => {
    if (activeSectionId) {
      const timer = setTimeout(() => {
        const target = document.getElementById(`preview-section-${activeSectionId}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
          setTimeout(() => {
            target.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
          }, 2000);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeSectionId, mode]);

  return (
    <div className="space-y-3">
      {!hideTopBar && onToggleMode && (
        <div className="flex items-center justify-between px-3 py-2 bg-stone-900/90 backdrop-blur-md rounded-xl text-stone-200 text-xs shadow-md border border-stone-700">
          <span className="font-bold flex items-center gap-1.5 text-amber-400">
            <span>📖 全篇连贯排版视图</span>
          </span>
          <button
            onClick={onToggleMode}
            className="text-[11px] font-bold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-lg border border-stone-600 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            title="聚焦只预览当前正在编辑的小节"
          >
            <span>聚焦当前小节</span>
            <span className="text-amber-400">🎯</span>
          </button>
        </div>
      )}

      {/* Cover Page */}
      {data.coverPage?.enabled && (
        <div
          id="preview-cover-page"
          className="relative w-full min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl rounded-2xl overflow-hidden flex flex-col print:break-after-page print:rounded-none print:shadow-none"
          style={data.coverPage.coverImage
            ? { backgroundImage: `url(${data.coverPage.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(160deg, #1c1917 0%, #292524 60%, #44403c 100%)' }
          }
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" />

          {/* DPCGL Official Compliance Logo */}
          {getLogoUrl(data.coverPage.dpcglLogo || 'dh_bottle_white_color', data.coverPage.customLogoUrl) && (
            <div className={`absolute z-20 ${getPositionClass(data.coverPage.dpcglLogoPosition || 'top-right')}`}>
              <img
                src={getLogoUrl(data.coverPage.dpcglLogo || 'dh_bottle_white_color', data.coverPage.customLogoUrl)}
                alt="DPCGL Compliance Logo"
                className={`${getSizeClass(data.coverPage.dpcglLogoSize || 'md').width} object-contain drop-shadow-md`}
              />
            </div>
          )}

          {/* Icon */}
          {data.coverPage.iconImage && (
            <div className="relative z-10 pt-16 flex justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-white/30 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                <img src={data.coverPage.iconImage} alt="icon" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom text */}
          <div className="relative z-10 text-white text-center px-12 pb-20 space-y-3">
            {data.coverPage.subtitle && (
              <p className="text-sm font-medium text-white/60 uppercase tracking-[0.3em]">{data.coverPage.subtitle}</p>
            )}
            <h1 className={`text-5xl font-black tracking-tight leading-tight drop-shadow-2xl ${theme.fontHead}`}>
              {data.coverPage.title || data.title || '战役标题'}
            </h1>
            <p className="text-base text-white/75 font-medium tracking-wide">
              By {data.coverPage.authorLine || data.author}
            </p>
          </div>

          {/* Footer bar */}
          {data.coverPage.footerText && (
            <div className="relative z-10 text-center text-[11px] text-white/50 border-t border-white/15 py-4 px-8">
              {data.coverPage.footerText}
            </div>
          )}
        </div>
      )}

      <div id="preview-content" style={bgStyle} className={`${theme.bg} ${theme.text} ${theme.fontBody} shadow-2xl mx-auto max-w-[210mm] min-h-[297mm] p-[10mm] sm:p-[15mm] print:shadow-none print:w-full print:max-w-none leading-relaxed transition-colors duration-300`}>
        <header className="mb-8 break-inside-avoid">
          <h1 className={`text-6xl font-black ${theme.accent} ${theme.fontHead} mb-6 tracking-tight uppercase leading-none`}>
            {data.title || "未命名"}
          </h1>
          
          {data.settings.showConcept && data.concept && (
            <p className="font-serif italic text-xl mb-6 text-current opacity-80 leading-relaxed">
              {data.concept}
            </p>
          )}

          <div className="flex justify-between items-end font-bold text-sm tracking-wide opacity-80">
            <p>由 {data.author} 设计</p>
            <div className="flex items-center gap-4">
               {data.settings.showComplexity && (
                  <div className="flex items-center gap-2">
                     <span>复杂度：</span>
                     <div className="flex">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-4 h-4 ${(data.complexity || 0) >= n ? 'fill-current' : 'opacity-20'}`} />
                        ))}
                     </div>
                  </div>
               )}
               {data.settings.showLevelRange && (
                  <div className="flex items-center gap-2">
                     <span>适用等级：</span>
                     <span>{data.levelRange}</span>
                  </div>
               )}
            </div>
          </div>
        </header>

        {/* Narrative Blocks */}
        <div className="mb-10 w-full">
           {/* 5. 概要 (Summary) */}
           {data.settings.showSummary && data.summary && (
              <div className={`mb-6 font-serif text-lg italic leading-relaxed opacity-90 border-l-4 pl-4 py-1 ${theme.accent.replace('text','border')}`}>
                 <MarkdownRenderer content={data.summary} />
              </div>
           )}

           {/* 6. 序言 (Prologue) */}
           {data.settings.showPrologue && data.prologue && (
              <div className="mb-6">
                 <h3 className={`${theme.accent} font-bold uppercase tracking-widest text-sm mb-2 border-b ${theme.border} border-opacity-20 pb-1`}>序言</h3>
                 <MarkdownRenderer content={data.prologue} />
              </div>
           )}

           {/* 4. 简介 (Introduction) */}
           {data.settings.showIntroduction && data.introduction && (
              <div className="mb-6">
                 <h3 className={`${theme.accent} font-bold uppercase tracking-widest text-sm mb-2 border-b ${theme.border} border-opacity-20 pb-1`}>简介</h3>
                 <MarkdownRenderer content={data.introduction} />
              </div>
           )}
        </div>

        {/* 7. 基调、主题、灵感 (Tone/Themes) */}
        {data.settings.showToneThemes && (data.tone || data.themes || data.inspiration) && (
          <section className={`grid grid-cols-3 gap-6 mb-12 ${theme.metaBg} p-6 rounded-lg text-sm border ${theme.border} border-opacity-10 break-inside-avoid shadow-sm`}>
             <div>
               {data.tone && <><h4 className={`${theme.accent} font-bold uppercase text-xs mb-1`}>基调</h4><p>{data.tone}</p></>}
             </div>
             <div>
               {data.themes && <><h4 className={`${theme.accent} font-bold uppercase text-xs mb-1`}>主题</h4><p>{data.themes}</p></>}
             </div>
             <div>
               {data.inspiration && <><h4 className={`${theme.accent} font-bold uppercase text-xs mb-1`}>灵感</h4><p className="italic">{data.inspiration}</p></>}
             </div>
          </section>
        )}

        <div className="space-y-8">
          {layoutGroups.map((group, gIdx) => (
            <div key={gIdx} className={group.type === 'cols' ? 'columns-1 md:columns-2 gap-8 space-y-8' : 'w-full mb-8'}>
              {group.items.map(section => (
                <div key={section.id} id={`preview-section-${section.id}`} className="break-inside-avoid mb-8">
                  <div className={`mb-4 ${section.level === 1 ? `border-b-2 ${theme.border}` : ''}`}>
                     <h2 className={`${theme.fontHead} ${
                       section.level === 1 ? `text-4xl font-black ${theme.accent} tracking-tight` : 
                       section.level === 2 ? `text-2xl font-bold ${theme.accent} border-l-4 ${theme.border} pl-3` : 
                       section.level === 3 ? `text-xl font-bold ${theme.accent} border-b ${theme.border} border-opacity-30 pb-0.5 pr-4` : 
                       section.level === 4 ? `text-lg font-bold text-stone-800` :
                       `text-base font-bold italic opacity-75`
                     } mb-2`}>
                       {section.title}
                     </h2>
                     {section.italicNote && <p className="italic text-sm mb-3 opacity-60 font-serif">{section.italicNote}</p>}
                  </div>
                  <div className="space-y-4 text-justify">
                     {section.blocks?.map(block => <BlockRenderer key={block.id} block={block} theme={theme} />)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Credits Page */}
      {data.creditsPage?.enabled && (
        <div
          id="preview-credits-page"
          className="relative w-full min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl rounded-2xl overflow-hidden flex flex-col print:break-before-page print:rounded-none print:shadow-none"
          style={data.creditsPage.backgroundImage
            ? { backgroundImage: `url(${data.creditsPage.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)' }
          }
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 to-black/85" />

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-start pt-16 px-10 sm:px-14 pb-12 text-white space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🙏</div>
              <h2 className={`text-2xl font-black uppercase tracking-[0.25em] text-white/90 ${theme.fontHead}`}>鸣谢</h2>
            </div>

            {data.creditsPage.creditsText && (
              <div className="w-full max-w-xl text-sm text-white/85 leading-relaxed space-y-3 text-center">
                <MarkdownRenderer content={data.creditsPage.creditsText} />
              </div>
            )}

            {/* DPCGL Copyright & Attribution Box */}
            {data.creditsPage.copyright?.enabled !== false && (
              <div className="w-full max-w-2xl mt-auto bg-black/40 border border-white/15 rounded-2xl p-5 text-left text-xs text-white/85 space-y-3 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                  <span className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> DPCGL 版权与许可声明
                  </span>
                  {data.creditsPage.copyright?.showDPCGLLogo !== false && getLogoUrl(data.creditsPage.copyright?.dpcglLogo || 'dh_bottle_white_color') && (
                    <img
                      src={getLogoUrl(data.creditsPage.copyright?.dpcglLogo || 'dh_bottle_white_color')}
                      alt="DPCGL Logo"
                      className="h-6 object-contain"
                    />
                  )}
                </div>
                <div className="leading-relaxed opacity-95 text-stone-200 text-[11px]">
                  <MarkdownRenderer content={
                    data.creditsPage.copyright?.rawDeclarationText || 
                    DPCGL_TEMPLATES[0].generateText({
                      workTitle: data.title,
                      authorName: data.author,
                      year: '2026',
                      hasMod: false,
                    })
                  } />
                </div>
              </div>
            )}
          </div>

          {/* Footer bar */}
          {data.creditsPage.footerText && (
            <div className="relative z-10 text-center text-[11px] text-white/40 border-t border-white/15 py-4 px-8">
              {data.creditsPage.footerText}
            </div>
          )}
        </div>
      )}

      {/* Standalone DPCGL Copyright Page (When credits page is disabled) */}
      {!data.creditsPage?.enabled && (data.settings.showCopyright ?? true) && (data.copyrightPage?.enabled !== false) && (
        <div
          id="preview-copyright-page"
          className="relative w-full min-h-[297mm] mx-auto max-w-[210mm] shadow-2xl rounded-2xl overflow-hidden flex flex-col justify-between print:break-before-page print:rounded-none print:shadow-none bg-gradient-to-b from-[#181614] via-[#151413] to-[#100f0e] text-stone-200 p-10 sm:p-14 border border-stone-800"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className={`text-lg font-black uppercase tracking-wider text-white ${theme.fontHead}`}>
                  DPCGL 版权与出版许可声明
                </h2>
                <p className="text-xs text-stone-400 font-sans">
                  Darrington Press Community Gaming License Compliance
                </p>
              </div>
            </div>

            {data.copyrightPage?.showDPCGLLogo !== false && getLogoUrl(data.copyrightPage?.dpcglLogo || 'dh_bottle_white_color') && (
              <div className="flex items-center gap-2 bg-black/40 border border-stone-800 rounded-xl px-3 py-1.5 shadow-sm">
                <img
                  src={getLogoUrl(data.copyrightPage?.dpcglLogo || 'dh_bottle_white_color')}
                  alt="DPCGL Logo"
                  className="h-9 object-contain"
                />
              </div>
            )}
          </div>

          {/* Main Notice Body */}
          <div className="my-auto py-8 text-xs sm:text-sm text-stone-300 leading-relaxed space-y-4 font-sans bg-black/40 border border-stone-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xs shadow-inner">
            <MarkdownRenderer content={
              data.copyrightPage?.rawDeclarationText || 
              DPCGL_TEMPLATES[0].generateText({
                workTitle: data.copyrightPage?.workTitle || data.title,
                authorName: data.copyrightPage?.authorName || data.author,
                year: data.copyrightPage?.year || '2026',
                hasMod: !!data.copyrightPage?.hasModifications,
                modNote: data.copyrightPage?.modificationsNote,
                customNotice: data.copyrightPage?.customNotice
              })
            } />
          </div>

          {/* Footer Bar */}
          <div className="border-t border-stone-800 pt-5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-stone-500 font-mono gap-2">
            <span>{data.copyrightPage?.workTitle || data.title} · 版权所有 © {data.copyrightPage?.year || '2026'} {data.copyrightPage?.authorName || data.author}</span>
            <span>DPCGL 2.0 / DRP Compliance Document</span>
          </div>
        </div>
      )}
    </div>
  );
};

const BlockRenderer: React.FC<{ block: ContentBlock; theme: any }> = React.memo(({ block, theme }) => {
  const isDark = theme?.card?.isDark;
  switch (block.type) {
    case 'text': 
      return <div className="max-w-none mb-4"><MarkdownRenderer content={block.content} /></div>;
    case 'subsection':
      return <h4 className={`font-bold text-lg mt-6 mb-2 border-b ${theme.border} border-opacity-20 pb-1 break-after-avoid`}>{block.title}</h4>;
    case 'divider':
      return <hr className={`${theme.border} opacity-20 my-4 border-dashed`} />;
    case 'image':
      return (
        <figure className="my-4 break-inside-avoid">
          <img src={block.url} alt="content" className={`w-full rounded shadow-sm border ${theme.border} border-opacity-10`} />
          {block.caption && <figcaption className="text-center text-xs opacity-60 mt-1 italic">{block.caption}</figcaption>}
        </figure>
      );
    case 'table':
      return (
        <div className={`my-4 overflow-hidden border ${theme.border} border-opacity-20 rounded-lg text-sm font-sans break-inside-avoid shadow-xs`}>
          <table className="w-full border-collapse">
            <thead className={`${theme.metaBg} font-bold`}>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className={`p-2.5 text-left border-b ${theme.border} border-opacity-20 font-bold`}>
                    <MarkdownRenderer content={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className={`border-b ${theme.border} border-opacity-10 last:border-0 ${i % 2 === 1 ? 'bg-black/[0.02] dark:bg-white/[0.03]' : ''}`}>
                  {row.map((c, j) => (
                    <td key={j} className="p-2.5 align-top">
                      <MarkdownRenderer content={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'read_aloud':
      return (
        <div className={`my-6 p-5 rounded-r-lg border-l-4 break-inside-avoid italic font-serif relative ${theme.metaBg} ${theme.border.replace('border','border-l')} ${theme.text}`}>
           <div className={`not-italic text-[10px] font-bold uppercase mb-2 tracking-widest absolute -top-3 left-2 px-1.5 py-0.5 rounded ${theme.card.bg} ${theme.accent} shadow-sm border ${theme.border} border-opacity-30`}>向玩家朗读</div>
           <MarkdownRenderer content={block.content} />
        </div>
      );
    case 'callout': {
      const calloutClass = block.variant === 'warning'
        ? (isDark ? 'border-red-500 bg-red-950/40 text-red-100' : 'border-red-800 bg-red-50 text-stone-900')
        : block.variant === 'tip'
        ? (isDark ? 'border-amber-400 bg-amber-950/40 text-amber-100' : 'border-amber-600 bg-amber-50 text-stone-900')
        : `${theme.border} ${theme.metaBg} ${theme.text}`;
      return (
        <div className={`my-6 p-4 border-2 break-inside-avoid shadow-sm rounded-lg ${calloutClass}`}>
           <h4 className="font-black uppercase mb-1 text-sm tracking-wide">{block.title}</h4>
           <MarkdownRenderer content={block.content} />
        </div>
      );
    }
    case 'outcome':
      if (block.entries && block.entries.length > 0) {
        return (
          <div className={`my-6 space-y-3 text-sm break-inside-avoid font-sans border-l-2 ${theme.border} pl-4 border-opacity-40`}>
             <div className="font-bold border-b border-opacity-20 pb-1 mb-2 text-xs uppercase tracking-wide opacity-60">检定结果</div>
             {block.entries.map((entry) => (
                <div key={entry.id} className="flex gap-2 items-baseline leading-relaxed">
                   <div className="flex gap-1 items-center flex-shrink-0">
                      {entry.tags.includes('critical') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>[关键成功]</span>}
                      {entry.tags.includes('success') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>[成功]</span>}
                      {entry.tags.includes('failure') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-red-400' : 'text-red-700'}`}>[失败]</span>}
                      {entry.tags.includes('hope') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-sky-300' : 'text-sky-600'}`}>[希望]</span>}
                      {entry.tags.includes('fear') && <span className={`font-bold whitespace-nowrap uppercase text-xs ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>[恐惧]</span>}
                   </div>
                   <MarkdownRenderer content={entry.content} className="flex-1" />
                </div>
             ))}
          </div>
        );
      }
      return null;
    case 'enemy': return <EnemyCard block={block} theme={theme} />;
    case 'environment': return <EnvironmentCard block={block} theme={theme} />;
    case 'cyberware': return <CyberwareCard block={block} theme={theme} />;
    default: return null;
  }
});

const CyberwareCard: React.FC<{ block: CyberwareBlock; theme?: any }> = React.memo(({ block }) => {
  const tierVal = (block.tier || '').trim();
  const zoneVal = (block.zone || '').trim();
  const slotsVal = (block.slots || '').trim();
  const restrictionVal = (block.restriction || '').trim();
  const tagVal = (block.tag || '').trim();

  return (
    <div className="break-inside-avoid my-6 font-sans flex justify-center">
      <div
        className="w-full max-w-[360px] min-h-[440px] bg-[#0D0D0D] text-white border-2 border-[#1F2229] flex flex-col justify-between overflow-hidden shadow-2xl transition-colors duration-300 text-left rounded-sm"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif'
        }}
      >
        {/* Header */}
        <div className="bg-[#FCEE0A] text-[#0D0D0D] p-3 px-4 relative shrink-0">
          {tierVal ? (
            <div className="absolute top-0 right-6 bg-[#0D0D0D] text-[#FCEE0A] text-[11px] font-black px-2 py-0.5 tracking-wider">
              {tierVal}
            </div>
          ) : null}
          <div className={`text-[18px] font-black leading-tight tracking-wide text-[#0D0D0D] break-words ${tierVal ? 'pr-14' : 'pr-2'}`}>
            {block.name || '微型皮下线圈'}
          </div>
          {block.cyberType && (
            <div className="text-[11px] font-bold text-[#4A4600] uppercase tracking-wider mt-0.5">
              {block.cyberType}
            </div>
          )}
        </div>

        {/* Meta Bar */}
        {(zoneVal || slotsVal) ? (
          <div className="bg-[#15181E] border-t border-b border-[#2B313D] px-4 py-2 flex justify-between items-center shrink-0">
            <div className="text-[11px] font-bold text-[#00F0FF] flex items-center gap-1">
              {zoneVal ? (
                <>部位: <span className="text-white font-normal">{zoneVal}</span></>
              ) : null}
            </div>
            {slotsVal ? (
              <div className="bg-[#FF003C] text-white text-[10px] font-black px-1.5 py-0.5 tracking-wide">
                {slotsVal.includes('槽') ? slotsVal : `占用 ${slotsVal} 槽`}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 flex-1 bg-[#0D0D0D]">
          {restrictionVal && (
            <div className="text-[11px] text-[#8F98A3] border-l-2 border-[#00F0FF] pl-2 leading-tight">
              {restrictionVal.startsWith('限制') ? restrictionVal : `限制: ${restrictionVal}`}
            </div>
          )}

          {block.effect && (
            <div className="text-[13px] leading-relaxed text-[#E1E4EA]">
              <MarkdownRenderer content={block.effect} />
            </div>
          )}

          {block.description && (
            <div className="text-[12px] italic text-[#8F98A3] pt-1 border-t border-[#1F2229]">
              <MarkdownRenderer content={block.description} />
            </div>
          )}

          {tagVal && (
            <div className="bg-[rgba(255,0,60,0.15)] border border-[#FF003C] text-[#FF003C] text-[11px] font-bold p-1.5 px-2 tracking-wide mt-auto">
              {tagVal.startsWith('//') ? tagVal : `// 警告: ${tagVal}`}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#08090C] border-t border-[#1F2229] p-3 px-4 flex justify-between text-[11px] shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-[#8F98A3] text-[9px] uppercase tracking-wider">元件基础价</span>
            <span className="font-extrabold text-[#FCEE0A]">{block.compCost || '未设定'}</span>
          </div>
          <div className="flex flex-col gap-0.5 text-right">
            <span className="text-[#8F98A3] text-[9px] uppercase tracking-wider">安装手术费</span>
            <span className="font-extrabold text-[#FCEE0A]">{block.surgCost || '未设定'}</span>
          </div>
        </div>

        {/* Sub-footer for Creator and Owner */}
        <div className="bg-[#050608] border-t border-[#15181E] px-4 py-1.5 flex justify-between items-center text-[10px] text-[#8F98A3] uppercase tracking-wider shrink-0">
          <span className="truncate max-w-[48%]">创作者: <span className="text-[#00F0FF] font-semibold">{block.creator || '未知'}</span></span>
          <span className="truncate max-w-[48%] text-right">所属: <span className="text-[#FCEE0A] font-semibold">{block.owner || '未指定'}</span></span>
        </div>
      </div>
    </div>
  );
});

const EnemyCard: React.FC<{ block: EnemyBlock, theme: any }> = React.memo(({ block, theme }) => {
  const s = theme.card;
  const normalTraits = (block.traits || []).filter(t => !t.isSpecial);
  const specialTraits = (block.traits || []).filter(t => t.isSpecial);

  const hpCount = Math.max(1, Math.min(block.stats?.hp || 1, 30));
  const stressCount = Math.max(0, Math.min(block.stats?.stress || 0, 20));
  const showDots = block.healthDisplay === 'dots' || block.healthDisplay === 'both';
  const showNumber = block.healthDisplay === 'number' || block.healthDisplay === 'both' || !block.healthDisplay;

  return (
    <div className="break-inside-avoid my-6 font-sans relative">
       <div className={`${s.bg} ${s.border} border-2 rounded-2xl p-5 pl-7 md:p-6 md:pl-8 shadow-md ${s.text} transition-colors duration-300 relative overflow-hidden`}>
          {/* Left Accent Bar */}
          <div className={`absolute top-0 bottom-0 left-0 w-2.5 md:w-3 ${s.enemyBar} rounded-l-2xl z-10`} />

          {/* Header area with Optional Avatar & Badges */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 pb-3 border-b border-current border-opacity-15">
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                   <h3 className={`text-2xl sm:text-3xl font-black uppercase leading-tight tracking-tight ${s.nameText} ${theme.fontHead}`}>
                      {block.name || '未命名敌人'}
                   </h3>
                   {block.isNpcMode && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.badgeNpc}`}>
                         NPC
                      </span>
                   )}
                </div>

                {block.englishName && (
                   <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${s.nameEnText}`}>
                      {block.englishName}
                   </div>
                )}

                <div className="flex items-center gap-2 text-xs font-bold mb-2 flex-wrap">
                   <span className={`px-2 py-0.5 rounded ${s.badgeTier}`}>
                      位阶 {block.tier || 1}
                   </span>
                   <span className={`px-2 py-0.5 rounded ${s.badgeTypeEnemy}`}>
                      {block.enemyType || '标准'}
                   </span>
                   {block.isNpcMode && (
                      <span className={`px-2 py-0.5 rounded ${s.badgeNpc}`}>
                         难度 {block.stats?.difficulty || 12}
                      </span>
                   )}
                </div>

                {block.flavor && (
                   <div className={`italic text-xs sm:text-sm leading-relaxed mb-2 ${s.textMuted}`}>
                      <MarkdownRenderer content={block.flavor} />
                   </div>
                )}
             </div>

             {/* Avatar Box */}
             {block.avatarUrl && (
                <div className="shrink-0 self-center sm:self-start">
                   <div className={`w-20 h-20 sm:w-24 sm:h-24 ${s.statBox} overflow-hidden shadow-sm ${
                      block.avatarShape === 'square' 
                         ? `rounded-xl border-2 ${s.avatarBorder}` 
                         : block.avatarShape === 'none' 
                         ? 'rounded-none' 
                         : `rounded-full border-2 ${s.avatarBorder}`
                   }`}>
                      <img src={block.avatarUrl} alt={block.name} className="w-full h-full object-cover" />
                   </div>
                </div>
             )}
          </div>

          {/* Meta Row: Tactics & Experiences */}
          {(block.tactics || block.experiences) && (
             <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 p-3 rounded-lg ${s.metaBox}`}>
                {block.tactics && (
                   <div>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnemy}`}>动机与战术:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.tactics} className="inline" /></span>
                   </div>
                )}
                {block.experiences && (
                   <div className={block.tactics ? "sm:border-l sm:border-current sm:border-opacity-20 sm:pl-3" : ""}>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnemy}`}>经历与加成:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.experiences} className="inline" /></span>
                   </div>
                )}
             </div>
          )}

          {/* Combat Stats Grid */}
          <div className={`${s.statBox} rounded-xl p-3.5 text-xs shadow-xs mb-4 space-y-3`}>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pb-2.5 border-b border-current border-opacity-15 text-center">
                {/* 1. Difficulty */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statLabel}`}>难度 (DC)</span>
                   <span className={`font-black text-lg sm:text-xl ${s.statVal}`}>{block.stats?.difficulty || 12}</span>
                </div>
                {/* 2. Thresholds */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statLabel}`}>伤害阈值 (轻/重)</span>
                   <span className={`font-bold text-base sm:text-lg ${s.statVal}`}>
                      {block.stats?.thresholdMinor || 5} <span className="opacity-40">/</span> {block.stats?.thresholdMajor || 10}
                   </span>
                </div>
                {/* 3. HP */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statHpVal}`}>生命 (HP)</span>
                   <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {showNumber && <span className={`font-black text-lg sm:text-xl ${s.statHpVal}`}>{block.stats?.hp || 5}</span>}
                      {showDots && (
                         <div className="flex items-center gap-0.5 flex-wrap justify-center max-w-[120px]" title={`HP: ${block.stats?.hp || 5}`}>
                            {Array.from({ length: hpCount }).map((_, i) => (
                               <span key={i} className={`inline-block w-2.5 h-2.5 rounded-full border ${s.hpDot}`} />
                            ))}
                         </div>
                      )}
                   </div>
                </div>
                {/* 4. Stress */}
                <div className={`flex flex-col items-center justify-center p-1.5 rounded ${s.statItem}`}>
                   <span className={`text-[10px] uppercase font-bold ${s.statStressVal}`}>压力 (Stress)</span>
                   <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {showNumber && <span className={`font-black text-lg sm:text-xl ${s.statStressVal}`}>{block.stats?.stress || 0}</span>}
                      {showDots && (
                         <div className="flex items-center gap-0.5 flex-wrap justify-center max-w-[120px]" title={`Stress: ${block.stats?.stress || 0}`}>
                            {Array.from({ length: stressCount }).map((_, i) => (
                               <span key={i} className={`inline-block w-2.5 h-2.5 rounded-sm border ${s.stressDot} rotate-45`} />
                            ))}
                         </div>
                      )}
                   </div>
                </div>
             </div>

             {/* Attack Row */}
             {block.attack && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 px-1">
                   <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-black text-xs flex items-center gap-1 ${s.attackName}`}>
                         ⚔️ {block.attack.name || '主要攻击'}
                      </span>
                      {block.attack.range && (
                         <span className={`text-[11px] italic font-serif ${s.textMuted}`}>
                            ({block.attack.range})
                         </span>
                      )}
                      {block.attack.damageType && (
                         <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            block.attack.damageType === 'magical' ? s.attackTypeMagic : s.attackTypePhys
                         }`}>
                            {block.attack.damageType === 'magical' ? '魔法' : '物理'}
                         </span>
                      )}
                   </div>
                   <div className="flex items-center gap-3 font-bold text-xs">
                      <span>命中: <span className={`font-mono ${s.attackStats}`}>{block.attack.modifier || '+0'}</span></span>
                      <span className="opacity-30">|</span>
                      <span>伤害: <span className={`font-mono ${s.attackStats}`}>{block.attack.damage || 'd8'}</span></span>
                   </div>
                </div>
             )}
          </div>

          {/* Normal Traits */}
          {normalTraits.length > 0 && (
             <div className="space-y-3 mb-3">
                <h4 className={`font-black uppercase text-[10px] tracking-widest opacity-60 ${s.textMuted}`}>常规特性与能力</h4>
                {normalTraits.map((t: Trait) => (
                   <div key={t.id} className="text-xs sm:text-sm leading-relaxed space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                         <span className={`font-bold ${s.traitName}`}>{t.name}</span>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            t.type === 'passive' ? s.traitPassive :
                            t.type === 'action' ? s.traitAction :
                            t.type === 'spotlight' ? s.traitSpotlight :
                            s.traitReaction
                         }`}>
                            {t.type === 'passive' ? '被动' : t.type === 'action' ? '动作' : t.type === 'spotlight' ? '聚焦动作' : '反应'}
                         </span>
                      </div>
                      <div className={`opacity-95 pl-2 border-l-2 ${s.traitDescBorder}`}>
                         <MarkdownRenderer content={t.description} />
                      </div>
                      {t.flavor && (
                         <div className={`italic text-[11px] pl-2 ${s.traitFlavor}`}>
                            {t.flavor}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}

          {/* Special Traits / Boss Phase Abilities */}
          {specialTraits.length > 0 && (
             <div className={`mt-3 p-3.5 rounded-xl ${s.specialBox} space-y-2.5`}>
                <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wide ${s.specialTitle}`}>
                   <span>🌟 特殊机制 / 阶段能力</span>
                </div>
                {specialTraits.map((t: Trait) => (
                   <div key={t.id} className="text-xs sm:text-sm leading-relaxed space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                         <span className={`font-bold ${s.specialTitle}`}>{t.name}</span>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${s.specialTag}`}>
                            {t.type === 'passive' ? '被动' : t.type === 'action' ? '动作' : t.type === 'spotlight' ? '聚焦动作' : '反应'}
                         </span>
                      </div>
                      <div className={`opacity-95 pl-2 border-l-2 ${s.specialTitle.replace('text-', 'border-')}`}>
                         <MarkdownRenderer content={t.description} />
                      </div>
                      {t.flavor && (
                         <div className={`italic text-[11px] opacity-80 pl-2 ${s.specialTitle}`}>
                            {t.flavor}
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
});

const EnvironmentCard: React.FC<{ block: EnvironmentBlock, theme: any }> = React.memo(({ block, theme }) => {
  const s = theme.card;
  return (
    <div className="break-inside-avoid my-6 font-sans relative">
       <div className={`${s.bg} ${s.border} border-2 rounded-2xl p-5 pl-7 md:p-6 md:pl-8 shadow-md ${s.text} transition-colors duration-300 relative overflow-hidden`}>
          {/* Left Accent Bar */}
          <div className={`absolute top-0 bottom-0 left-0 w-2.5 md:w-3 ${s.envBar} rounded-l-2xl z-10`} />

          {/* Scene Illustration / Banner */}
          {block.imageUrl && (
             <div className={`w-full max-h-56 rounded-xl overflow-hidden mb-4 border ${s.border} shadow-xs`}>
                <img src={block.imageUrl} alt={block.name} className="w-full h-full object-cover" />
             </div>
          )}

          {/* Header area */}
          <div className="mb-4 pb-3 border-b border-current border-opacity-15">
             <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className={`text-2xl sm:text-3xl font-black uppercase leading-tight tracking-tight ${s.nameText} ${theme.fontHead}`}>
                   {block.name || '未命名环境'}
                </h3>
             </div>

             {block.englishName && (
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${s.nameEnText}`}>
                   {block.englishName}
                </div>
             )}

             <div className="flex items-center gap-2 text-xs font-bold mb-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded ${s.badgeTier}`}>
                   位阶 {block.tier || 1}
                </span>
                <span className={`px-2 py-0.5 rounded ${s.badgeTypeEnv}`}>
                   {block.envType || '险境'}
                </span>
                <span className={`px-2 py-0.5 rounded ${s.badgeTier}`}>
                   难度 (DC): {block.difficulty || 12}
                </span>
             </div>

             {block.description && (
                <div className={`italic text-xs sm:text-sm leading-relaxed mb-1 ${s.textMuted}`}>
                   <MarkdownRenderer content={block.description} />
                </div>
             )}
          </div>

          {/* Tendencies & Potential Enemies Grid */}
          {(block.trend || block.potentialEnemies) && (
             <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 p-3 rounded-lg ${s.metaBox}`}>
                {block.trend && (
                   <div>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnv}`}>🌊 趋向与动向:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.trend} className="inline" /></span>
                   </div>
                )}
                {block.potentialEnemies && (
                   <div className={block.trend ? "sm:border-l sm:border-current sm:border-opacity-20 sm:pl-3" : ""}>
                      <span className={`font-bold uppercase tracking-wide mr-1.5 ${s.metaLabelEnv}`}>⚔️ 潜在威胁/敌人:</span>
                      <span className={`${s.metaText} inline`}><MarkdownRenderer content={block.potentialEnemies} className="inline" /></span>
                   </div>
                )}
             </div>
          )}

          {/* Countdown Mechanism Box */}
          {(block.countdown || block.countdownDescription) && (
             <div className={`mb-4 p-3.5 rounded-xl ${s.countdownBox} space-y-1.5 shadow-2xs`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                   <span className={`text-xs font-black flex items-center gap-1.5 ${s.countdownTitle}`}>
                      ⏱️ 环境倒计时 (Countdown)
                   </span>
                   {block.countdown && (
                      <span className={`font-bold text-xs px-2.5 py-0.5 rounded-full shadow-2xs ${s.countdownBadge}`}>
                         倒计时步数: {block.countdown}
                      </span>
                   )}
                </div>
                {block.countdownDescription && (
                   <div className={`text-xs leading-relaxed pl-1 ${s.countdownText}`}>
                      <MarkdownRenderer content={block.countdownDescription} />
                   </div>
                )}
             </div>
          )}

          {/* Features with GM Questions */}
          {(block.features || []).length > 0 && (
             <div className="space-y-3.5">
                <h4 className={`font-black uppercase text-[10px] tracking-widest opacity-60 ${s.textMuted}`}>环境特性与互动机制</h4>
                {block.features.map(feature => (
                   <div key={feature.id} className="text-xs sm:text-sm leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                         <span className={`font-bold ${s.traitName}`}>{feature.name}</span>
                         <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            feature.type === 'passive' ? s.traitPassive :
                            feature.type === 'action' ? s.traitAction :
                            feature.type === 'spotlight' ? s.traitSpotlight :
                            s.traitReaction
                         }`}>
                            {feature.type === 'passive' ? '被动' : feature.type === 'action' ? '动作' : feature.type === 'spotlight' ? '聚焦动作' : '反应'}
                         </span>
                      </div>
                      
                      <div className={`opacity-95 pl-2 border-l-2 ${s.traitDescBorder}`}>
                         <MarkdownRenderer content={feature.description} />
                      </div>

                      {feature.questions && (
                         <div className={`italic text-[11px] rounded-md px-2.5 py-1.5 flex items-start gap-1.5 ${s.gmQuestionBox}`}>
                            <span className={`shrink-0 font-bold not-italic ${s.gmQuestionTitle}`}>💡 GM 引导:</span>
                            <span className={s.gmQuestionText}>{feature.questions}</span>
                         </div>
                      )}
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
});