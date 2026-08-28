
import React from 'react';
import { LibraryItem } from '../types';
import { TOOL_CONFIG } from '../constants';
import { TOOL_ICONS, renderToolIcon } from '../icons';
import { saveCardAsImage, copyImageToClipboard } from '../utils';
import { isFvttCompatible, convertToFvttJson } from '../fvttExporter';
import CardPreview from './CardPreview';
import Markdown from './Markdown';
import { X, Clock, Edit, Copy, Trash2, Download } from 'lucide-react';

interface Props { 
    item: LibraryItem;
    onClose: () => void;
    onEdit: (item: LibraryItem) => void;
    onCopy: (item: LibraryItem) => void;
    onDelete: (id: string) => void;
}

const LibraryDetailModal: React.FC<Props> = ({ item, onClose, onEdit, onCopy, onDelete }) => {
   const handleExportFvtt = () => {
      try {
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
      } catch (err: any) {
         alert('导出 FVTT JSON 失败: ' + err.message);
      }
   };

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
         <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
         <div className="relative z-10 w-full max-w-5xl h-full max-h-[800px] bg-paper-50 dark:bg-zinc-950 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white z-20">
               <X size={24} />
            </button>

            <div className="flex-1 bg-slate-200 dark:bg-zinc-900/50 flex items-center justify-center p-8 overflow-y-auto">
               <div className="shadow-2xl shadow-black/30 rounded-lg overflow-hidden scale-90 sm:scale-100">
                  <CardPreview data={item.data} elementId="preview-library" />
               </div>
            </div>

            <div className="w-full md:w-[320px] lg:w-[400px] bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 flex flex-col">
               <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${TOOL_CONFIG[item.data.type].color} bg-slate-100 dark:bg-zinc-800`}>
                     {renderToolIcon(item.data.type, { size: 14 })}
                     {TOOL_CONFIG[item.data.type].label}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 mb-2">{item.data.name}</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-500 flex items-center gap-2">
                     <Clock size={14} /> 上次修改: {new Date(item.updatedAt).toLocaleString()}
                  </p>
               </div>

               <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                  <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-lg border border-slate-100 dark:border-zinc-800">
                     <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-600 uppercase mb-2">描述</h3>
                     <Markdown text={item.data.description || '暂无描述'} className="text-sm text-slate-700 dark:text-zinc-300 italic" />
                  </div>
                  
                  {/* Direct Export Actions */}
                  <div className="space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => copyImageToClipboard('preview-library')} className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg text-slate-700 dark:text-zinc-300 text-sm font-bold transition-colors">
                           <Copy size={16} /> 复制图片
                        </button>
                        <button onClick={() => saveCardAsImage('preview-library', item.data, item.data.name)} className="flex items-center justify-center gap-2 py-2.5 bg-blue-100 dark:bg-amber-900/30 text-blue-700 dark:text-amber-500 hover:bg-blue-200 dark:hover:bg-amber-900/50 rounded-lg text-sm font-bold transition-colors">
                           <Download size={16} /> 下载图片
                        </button>
                     </div>
                     {isFvttCompatible(item.data.type) && (
                        <button 
                           onClick={handleExportFvtt} 
                           className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-zinc-700 rounded-lg text-sm font-bold transition-colors"
                        >
                           <Download size={16} /> 导出 FVTT JSON
                        </button>
                     )}
                  </div>
               </div>

               <div className="p-6 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                  <button onClick={() => onEdit(item)} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 dark:bg-amber-600 hover:bg-blue-700 dark:hover:bg-amber-700 text-white rounded-lg font-bold transition-colors">
                     <Edit size={18} /> 编辑卡牌
                  </button>
                  <button onClick={() => onCopy(item)} className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-bold transition-colors">
                     <Copy size={18} /> 作为模板复制
                  </button>
                  <button onClick={() => onDelete(item.id)} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-bold transition-colors">
                     <Trash2 size={18} /> 删除
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default LibraryDetailModal;
