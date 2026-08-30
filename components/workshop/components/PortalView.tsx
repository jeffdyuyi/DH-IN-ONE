
import React from 'react';
import Link from 'next/link';
import { navigateToPage } from '@/lib/utils';
import { Library, Sun, Moon, ArrowRight, Home } from 'lucide-react';
import { CardType, LibraryItem } from '../types';
import { CATEGORY_CONFIG, TOOL_CATEGORIES, TOOL_CONFIG, CardCategory } from '../constants';
import { TOOL_ICONS, renderToolIcon } from '../icons';

interface Props {
  library: LibraryItem[];
  isDark: boolean;
  onToggleTheme: () => void;
  onGoToLibrary: () => void;
  onSelectTool: (type: CardType) => void;
  onSelectLibItem: (item: LibraryItem) => void;
}

const CATEGORY_ORDER = [CardCategory.COLLECTION, CardCategory.WORLD, CardCategory.HERO];

const PortalView: React.FC<Props> = ({ library, isDark, onToggleTheme, onGoToLibrary, onSelectTool, onSelectLibItem }) => {
  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-obsidian-950 transition-colors duration-500 overflow-x-hidden text-slate-900 dark:text-zinc-100">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
           <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl"></div>
           <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
          <header className="flex justify-between items-center mb-16">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-amber-700 dark:text-amber-400 mb-2 tracking-wider drop-shadow-sm">
                你的传说就此开始
              </h1>
              <p className="text-slate-700 dark:text-zinc-400 font-medium">
                匕首之心·不咕鸟文字制卡器合集
              </p>
            </div>
            <div className="flex items-center gap-3">
               <Link 
                 href="/" 
                 onClick={(e) => { e.preventDefault(); navigateToPage('/'); }}
                 className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white dark:bg-zinc-900 shadow-md border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-800 dark:text-zinc-200 hover:scale-105 hover:border-amber-500 transition-all" 
                 title="返回主站门户"
               >
                 <Home size={18} />
                 <span className="hidden sm:inline">主站门户</span>
               </Link>
               <button onClick={onGoToLibrary} className="p-3 rounded-full bg-white dark:bg-zinc-900 shadow-md border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:scale-105 hover:border-amber-500 transition-all" title="本地库">
                 <Library size={24} />
               </button>
               <button onClick={onToggleTheme} className="p-3 rounded-full bg-white dark:bg-zinc-900 shadow-md border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:scale-105 hover:border-amber-500 transition-all">
                  {isDark ? <Sun size={24} className="text-amber-400" /> : <Moon size={24} className="text-slate-700" />}
               </button>
            </div>
          </header>

          <div className="space-y-16">
            {/* Library Section */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Library className="text-amber-700 dark:text-amber-400" />
                    <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-zinc-100">
                      本地库
                    </h2>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono font-bold">
                    共 {library.length} 张卡牌
                  </span>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button onClick={onGoToLibrary} className="group relative flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900/90 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-zinc-800 transition-all duration-300 h-[100px] sm:h-auto shadow-sm">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                       <Library size={28} />
                       <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -ml-2 transition-all duration-300" />
                    </div>
                    <span className="mt-2 font-bold text-slate-900 dark:text-zinc-100 text-sm">打开完整库</span>
                    <span className="text-xs text-slate-600 dark:text-zinc-400 mt-1">管理所有卡牌</span>
                  </button>

                  {library.slice(0, 3).map(item => (
                    <button key={item.id} onClick={() => onSelectLibItem(item)} className="group relative flex items-center gap-4 p-4 bg-white dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-500/50 transition-all duration-300 overflow-hidden text-left">
                        <div className={`p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 ${TOOL_CONFIG[item.data.type].color} ring-1 ring-slate-200 dark:ring-zinc-700 shrink-0`}>
                          {renderToolIcon(item.data.type, { size: 24 })}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm truncate">{item.data.name}</h3>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 flex items-center gap-1">
                              <span>{TOOL_CONFIG[item.data.type].label}</span>
                          </p>
                        </div>
                    </button>
                  ))}
               </div>
            </section>

            {/* Tool Categories */}
            {CATEGORY_ORDER.map((category, idx) => (
              <section key={category} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${(idx + 1) * 150}ms` }}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-8 h-1 bg-amber-600 dark:bg-amber-500 rounded-full inline-block"></span>
                    {CATEGORY_CONFIG[category].label}
                  </h2>
                  <span className="text-xs text-slate-600 dark:text-zinc-400 uppercase tracking-widest font-semibold">
                    {CATEGORY_CONFIG[category].description}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {TOOL_CATEGORIES[category].map((type) => (
                    <button key={type} onClick={() => onSelectTool(type)} className="group relative flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900/90 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-500/60 transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-100 dark:to-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className={`relative mb-4 p-4 rounded-full bg-slate-50 dark:bg-zinc-800 ${TOOL_CONFIG[type].color} group-hover:scale-110 transition-transform duration-300 ring-1 ring-slate-200 dark:ring-zinc-700`}>
                        {renderToolIcon(type, { size: 32 })}
                      </div>
                      <h3 className="relative text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">{TOOL_CONFIG[type].label}</h3>
                      <p className="relative text-xs text-slate-600 dark:text-zinc-400 text-center line-clamp-2 leading-relaxed">{TOOL_CONFIG[type].description}</p>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <footer className="mt-20 py-8 border-t border-slate-200 dark:border-zinc-800 text-center text-slate-600 dark:text-zinc-400 text-sm space-y-2">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              <span><strong>作者信息:</strong> 不咕鸟（哈基米德）</span>
              <span><strong>辅助 AI:</strong> Antigravity Gemini</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-zinc-500">
              <span><strong>不咕鸟创作交流群:</strong> 261751459</span>
              <span><strong>成都秘密基地TRPG俱乐部群:</strong> 691707475</span>
            </div>
            <div className="pt-2 text-xs">
              <a href="https://ifdian.net/a/nogubird" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline font-bold transition-all">
                为作者加油 ⚡
              </a>
            </div>
          </footer>
        </div>
    </div>
  );
};
export default PortalView;
