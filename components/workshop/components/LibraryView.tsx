import React, { useState } from 'react';
import { ChevronLeft, Library, Sun, Moon, Filter, ArrowRight, Download, CheckSquare, Square, Check, X } from 'lucide-react';
import { CardType, LibraryItem } from '../types';
import { TOOL_CONFIG } from '../constants';
import { TOOL_ICONS, renderToolIcon } from '../icons';
import { convertToCCPack } from '../ccExporter';
import { isFvttCompatible, convertToFvttJson } from '../fvttExporter';

interface Props {
  library: LibraryItem[];
  isDark: boolean;
  onToggleTheme: () => void;
  onGoHome: () => void;
  onSelectLibItem: (item: LibraryItem) => void;
}

const LibraryView: React.FC<Props> = ({ library, isDark, onToggleTheme, onGoHome, onSelectLibItem }) => {
  const [libFilter, setLibFilter] = useState<CardType | 'all'>('all'); 
  
  // Export Mode States
  const [isExportMode, setIsExportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'cc' | 'fvtt'>('cc');
  const [packMeta, setPackMeta] = useState({
    name: '我的自定义卡包',
    version: '1.0.0',
    author: '',
    description: ''
  });

  // Explicitly type libraryTypes to avoid inference issues (unknown[])
  const libraryTypes = Array.from(new Set(library.map(item => item.data.type))) as CardType[];
  
  const typeCounts = library.reduce((acc, item) => {
    acc[item.data.type] = (acc[item.data.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredLibrary = library
    .filter(item => {
      if (libFilter === 'all') return true;
      return item.data.type === libFilter;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt); 

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCardClick = (item: LibraryItem) => {
    if (isExportMode) {
      toggleSelect(item.id);
    } else {
      onSelectLibItem(item);
    }
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredLibrary.forEach(item => next.add(item.id));
    setSelectedIds(next);
  };

  const deselectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredLibrary.forEach(item => next.delete(item.id));
    setSelectedIds(next);
  };

  const handleStartExport = () => {
    if (selectedIds.size === 0) {
      alert('请先选择至少一张卡牌进行导出！');
      return;
    }
    setShowExportModal(true);
  };

  const handleConfirmExport = () => {
    if (exportFormat === 'cc') {
      if (!packMeta.name.trim()) {
        alert('请输入卡牌包名称！');
        return;
      }

      const selectedCards = library
        .filter(item => selectedIds.has(item.id))
        .map(item => item.data);

      try {
        const ccPackObj = convertToCCPack(selectedCards, packMeta);

        const blob = new Blob([JSON.stringify(ccPackObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${packMeta.name}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Exit export mode and reset selection
        setShowExportModal(false);
        setIsExportMode(false);
        setSelectedIds(new Set());
      } catch (err: any) {
        alert('导出失败: ' + err.message);
      }
    } else {
      const selectedItems = library.filter(item => selectedIds.has(item.id));
      const compatibleItems = selectedItems.filter(item => isFvttCompatible(item.data.type));
      const skippedCount = selectedItems.length - compatibleItems.length;

      if (compatibleItems.length === 0) {
        alert('选中的卡牌中没有支持导出为 FVTT JSON 格式的类型（仅支持武器、副武器、战利品、消耗品、NPC）。');
        return;
      }

      try {
        // Sequentially download cards with small timeouts to prevent browser blocking
        compatibleItems.forEach((item, idx) => {
          setTimeout(() => {
            const fvttObj = convertToFvttJson(item.data);
            const prefix = item.data.type === 'npc' ? 'fvtt-Actor' : 'fvtt-Item';
            const filename = `${prefix}-${item.data.name}-${item.data.id}`.replace(/\s+/g, '-');
            
            const blob = new Blob([JSON.stringify(fvttObj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, idx * 150);
        });

        const successMsg = `已开始下载 ${compatibleItems.length} 个 FVTT 兼容的 JSON 文件。` + 
          (skippedCount > 0 ? `（跳过了 ${skippedCount} 张不兼容的卡牌）` : '');
        
        setTimeout(() => {
          alert(successMsg);
        }, compatibleItems.length * 150 + 100);

        // Exit export mode and reset selection
        setShowExportModal(false);
        setIsExportMode(false);
        setSelectedIds(new Set());
      } catch (err: any) {
        alert('导出 FVTT JSON 失败: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-obsidian-950 transition-colors duration-500 flex flex-col relative text-slate-900 dark:text-zinc-100">
         <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-20">
             <div className="flex items-center gap-4">
                <button onClick={onGoHome} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                   <ChevronLeft size={24} className="text-slate-700 dark:text-zinc-300" />
                </button>
                <div className="flex items-center gap-2">
                   <Library size={24} className="text-amber-700 dark:text-amber-400" />
                   <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-zinc-100">
                     本地库
                   </h1>
                </div>
             </div>
             <div className="flex items-center gap-2">
                {library.length > 0 && (
                   <button 
                      onClick={() => {
                        setIsExportMode(!isExportMode);
                        setSelectedIds(new Set());
                      }} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${isExportMode ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-200' : 'bg-amber-50 text-amber-800 dark:bg-zinc-900 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-zinc-800 border border-amber-200 dark:border-zinc-800'}`}
                   >
                      {isExportMode ? (
                        <>
                          <X size={16} /> 取消选择
                        </>
                      ) : (
                        <>
                          <Download size={16} /> 导出匕首心卡包
                        </>
                      )}
                   </button>
                )}
                <button onClick={onToggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                   {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-700" />}
                </button>
             </div>
         </header>

         {/* Selection Mode Action Bar */}
         {isExportMode && (
            <div className="bg-amber-50 dark:bg-zinc-900 border-b border-amber-200 dark:border-zinc-800 py-3 px-4 md:px-8 flex flex-wrap gap-4 items-center justify-between">
               <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-300">
                  <span className="font-bold text-amber-800 dark:text-amber-400">已选择 {selectedIds.size} 张卡牌</span>
                  <span className="opacity-40">|</span>
                  <button onClick={selectAllFiltered} className="text-amber-700 dark:text-amber-400 hover:underline font-medium">全选当前分类</button>
                  <span className="opacity-40">|</span>
                  <button onClick={deselectAllFiltered} className="text-slate-600 dark:text-zinc-400 hover:underline">取消全选</button>
               </div>
               <button 
                  onClick={handleStartExport}
                  disabled={selectedIds.size === 0}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm ${selectedIds.size === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600' : 'bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700'}`}
               >
                  <Check size={16} /> 导出选中的卡牌 ({selectedIds.size})
               </button>
            </div>
         )}

         <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 flex flex-col">
            {/* Filter Pills */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-zinc-800">
               <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setLibFilter('all')}
                    className={`px-4 py-2 rounded-full font-bold transition-all border ${libFilter === 'all' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}
                  >
                     全部 ({library.length})
                  </button>
                  {libraryTypes.map(type => (
                     <button key={type} onClick={() => setLibFilter(type)} className={`px-4 py-2 rounded-full font-bold transition-all border flex items-center gap-2 ${libFilter === type ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800'}`}>
                        <span className={`${libFilter === type ? 'text-white' : TOOL_CONFIG[type].color}`}>{renderToolIcon(type, { size: 16 })}</span>
                        {TOOL_CONFIG[type].label}
                        <span className="ml-1 opacity-80 text-xs bg-black/20 px-1.5 rounded-full">{typeCounts[type]}</span>
                     </button>
                  ))}
               </div>
            </div>

            {filteredLibrary.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-zinc-500">
                  <div className="p-6 rounded-full bg-slate-100 dark:bg-zinc-900 mb-4">
                     <Filter size={48} className="opacity-50" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">暂无内容</h3>
                  <p className="text-sm">该分类下没有保存的卡牌</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                  {filteredLibrary.map(item => {
                     const isSelected = selectedIds.has(item.id);
                     return (
                        <div 
                           key={item.id} 
                           onClick={() => handleCardClick(item)} 
                           className={`group relative bg-white dark:bg-zinc-900/90 rounded-xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-[180px] ${isExportMode ? (isSelected ? 'border-amber-500 ring-2 ring-amber-500/25 dark:border-amber-600 dark:ring-amber-600/30' : 'border-slate-200 dark:border-zinc-800') : 'border-slate-200 dark:border-zinc-800'}`}
                        >
                           {/* Checkbox Overlay in Export Mode */}
                           {isExportMode && (
                              <div className="absolute top-3 right-3 z-10 bg-white dark:bg-zinc-950 rounded-md shadow-sm">
                                 {isSelected ? (
                                    <CheckSquare className="text-amber-500 dark:text-amber-500" size={20} />
                                 ) : (
                                    <Square className="text-slate-400 dark:text-zinc-600" size={20} />
                                 )}
                              </div>
                           )}

                           <div className="p-4 flex gap-4 items-start border-b border-slate-100 dark:border-zinc-800/50">
                               <div className={`p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 ${TOOL_CONFIG[item.data.type].color} ring-1 ring-slate-200 dark:ring-zinc-700`}>
                                   {renderToolIcon(item.data.type, { size: 28 })}
                               </div>
                               <div className="flex-1 min-w-0 pr-6">
                                   <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 truncate">{item.data.name}</h3>
                                   <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                       {TOOL_CONFIG[item.data.type].label}
                                   </span>
                               </div>
                           </div>
                           <div className="p-4 flex-1 flex flex-col justify-between">
                               <p className="text-sm text-slate-600 dark:text-zinc-400 line-clamp-2 italic">
                                   "{item.data.description || '无描述'}"
                               </p>
                               <div className="flex justify-between items-center text-xs text-slate-500 dark:text-zinc-500 mt-2">
                                   <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                                   {!isExportMode && (
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                          点击查看详情 <ArrowRight size={12} />
                                      </span>
                                   )}
                               </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Secondary Confirmation Modal for Export */}
         {showExportModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 dark:border-zinc-800/80 flex justify-between items-center">
                     <h3 className="text-lg font-serif font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                        <Download size={20} className="text-amber-500" />
                        导出匕首心卡牌包
                     </h3>
                     <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">导出格式</label>
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                              type="button"
                              onClick={() => setExportFormat('cc')}
                              className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all ${exportFormat === 'cc' ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}
                           >
                              建卡器 (CC) 格式
                           </button>
                           <button 
                              type="button"
                              onClick={() => setExportFormat('fvtt')}
                              className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all ${exportFormat === 'fvtt' ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}
                           >
                              Foundry VTT 格式
                           </button>
                        </div>
                     </div>

                     {exportFormat === 'cc' ? (
                        <>
                           <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                              您已选择 <span className="font-bold text-sm text-amber-600 dark:text-amber-500 mx-1">{selectedIds.size}</span> 张卡牌。
                              即将根据匕首心建卡器规范，将这些卡牌转换为兼容的 JSON 格式卡包。
                           </div>

                           <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">卡牌包名称 *</label>
                              <input 
                                 type="text" 
                                 value={packMeta.name} 
                                 onChange={e => setPackMeta({ ...packMeta, name: e.target.value })}
                                 className="bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
                                 placeholder="例如: 神州战役卡牌包"
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                 <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">作者 (选填)</label>
                                 <input 
                                    type="text" 
                                    value={packMeta.author} 
                                    onChange={e => setPackMeta({ ...packMeta, author: e.target.value })}
                                    className="bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="你的名字"
                                 />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                 <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">版本号</label>
                                 <input 
                                    type="text" 
                                    value={packMeta.version} 
                                    onChange={e => setPackMeta({ ...packMeta, version: e.target.value })}
                                    className="bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="1.0.0"
                                 />
                              </div>
                           </div>

                           <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">卡包简短描述</label>
                              <textarea 
                                 rows={3}
                                 value={packMeta.description} 
                                 onChange={e => setPackMeta({ ...packMeta, description: e.target.value })}
                                 className="bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                                 placeholder="介绍这个卡牌包的内容和背景故事..."
                              />
                           </div>
                        </>
                     ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-lg space-y-3">
                           <div className="text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed">
                              您已选择 <span className="font-bold text-sm text-emerald-600 dark:text-emerald-500 mx-1">{selectedIds.size}</span> 张卡牌。
                              即将转换为 FVTT 兼容的 JSON 格式文件。
                           </div>
                           <div className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed border-t border-emerald-200/30 dark:border-emerald-900/20 pt-2">
                              <strong>💡 导出说明：</strong>
                              <ul className="list-disc pl-4 mt-1 space-y-1">
                                 <li>仅支持武器、副武器、战利品、消耗品、NPC 卡牌的导出。</li>
                                 <li>浏览器会依次弹出对应 JSON 文件的下载。</li>
                                 <li>不兼容的卡牌类型（如职业、子职、领域等）将会自动跳过。</li>
                              </ul>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end gap-3">
                     <button 
                        onClick={() => setShowExportModal(false)}
                        className="px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                     >
                        取消
                     </button>
                     <button 
                        onClick={handleConfirmExport}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                     >
                        确认并导出
                     </button>
                  </div>
               </div>
            </div>
         )}
    </div>
  );
};
export default LibraryView;