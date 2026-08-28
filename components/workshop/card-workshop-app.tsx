
"use client"

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CardType, CardData, LibraryItem } from './types';
import { TOOL_CONFIG, DEFAULT_VALUES, TOOL_CATEGORIES, CATEGORY_CONFIG, CardCategory } from './constants';
import { saveCardAsImage, copyImageToClipboard, loadDataFromImage, saveToLibrary, getLibrary, deleteFromLibrary } from './utils';
import { TOOL_ICONS, renderToolIcon } from './icons';
import CardPreview from './components/CardPreview';
import CardEditor from './components/CardEditor';
import SidebarItem from './components/SidebarItem';
import LibraryDetailModal from './components/LibraryDetailModal';
import PortalView from './components/PortalView';
import LibraryView from './components/LibraryView';
import { 
  Download, Upload, Copy, Save, Library, Sun, Moon, X, RotateCcw,
  Menu, ChevronLeft, Eye, FileJson, AlertCircle, FilePlus, Home
} from 'lucide-react';

// Generate a unique ID
const uuid = () => Math.random().toString(36).substring(2, 9);

export function CardWorkshopApp() {
  const [mode, setMode] = useState<'portal' | 'editor' | 'library'>('portal');
  const [currentTool, setCurrentTool] = useState<CardType>(CardType.WEAPON);
  const [cardData, setCardData] = useState<CardData>({ ...DEFAULT_VALUES[CardType.WEAPON] as CardData, id: uuid(), type: CardType.WEAPON });
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  
  // Library State
  const [selectedLibItem, setSelectedLibItem] = useState<LibraryItem | null>(null); // For detail view
  
  // Modals
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false); // Overwrite vs New

  // UI State
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For desktop sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // For mobile sidebar

  const fileInputRef = useRef<HTMLInputElement>(null);
  const CATEGORY_ORDER = [CardCategory.COLLECTION, CardCategory.WORLD, CardCategory.HERO];

  // Initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool');
    if (toolParam && Object.values(CardType).includes(toolParam as CardType)) {
      selectTool(toolParam as CardType);
    }
    setLibrary(getLibrary());
    
    // Initial theme check (default dark)
    if (document.documentElement.classList.contains('dark')) {
        setIsDark(true);
    } else {
        setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const selectTool = (type: CardType) => {
    if (type !== cardData.type) {
        const defaults = DEFAULT_VALUES[type];
        const freshData = JSON.parse(JSON.stringify(defaults));
        setCardData({ 
          ...freshData,
          id: uuid(), 
          type 
        });
    }
    setCurrentTool(type);
    setMode('editor');
    setIsMobileMenuOpen(false);
    
    const newUrl = `${window.location.pathname}?tool=${type}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const goHome = () => {
    setMode('portal');
    window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
  };

  const goToLibrary = () => {
    setMode('library');
    setIsMobileMenuOpen(false);
    window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
  };

  // --- Save Logic ---

  const handleSaveClick = () => {
    const existing = library.find(item => item.id === cardData.id);
    if (existing) {
      setShowSaveOptions(true);
    } else {
      performSave(cardData);
    }
  };

  const performSave = (dataToSave: CardData) => {
    saveToLibrary(dataToSave);
    setLibrary(getLibrary());
    setShowSaveOptions(false);
    alert("已保存到本地库");
  };

  const handleOverwrite = () => {
    performSave(cardData);
  };

  const handleSaveAsNew = () => {
    const newData = { ...cardData, id: uuid() };
    setCardData(newData);
    performSave(newData);
  };

  // --- Library Actions ---

  const handleEdit = (item: LibraryItem) => {
    setCardData(item.data);
    setCurrentTool(item.data.type);
    setSelectedLibItem(null);
    setMode('editor');
  };

  const handleCopyAsTemplate = (item: LibraryItem) => {
    const newData = { 
        ...item.data, 
        id: uuid(),
        name: `${item.data.name} (副本)`
    };
    setCardData(newData);
    setCurrentTool(item.data.type);
    setSelectedLibItem(null);
    setMode('editor');
  };

  const handleDeleteFromLibrary = (id: string) => {
    if(confirm("确定删除此卡牌吗？")) {
      deleteFromLibrary(id);
      setLibrary(getLibrary());
      if (selectedLibItem?.id === id) {
          setSelectedLibItem(null);
      }
    }
  };

  // --- Other Actions ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      if (file.name.toLowerCase().endsWith('.json') || file.type === 'application/json') {
          const text = await file.text();
          try {
             const data = JSON.parse(text);
             if (data && data.type && Object.values(CardType).includes(data.type)) {
                setCardData(data);
                setCurrentTool(data.type as CardType);
                setMode('editor');
             } else {
                alert("无效的卡牌数据格式 (JSON)。");
             }
          } catch (e) {
             alert("无法解析 JSON 文件。");
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
      }

      const data = await loadDataFromImage(file);
      if (data) {
        if (data.type && Object.values(CardType).includes(data.type)) {
          setCardData(data);
          setCurrentTool(data.type);
          setMode('editor');
        } else {
          alert("图片中未发现有效的卡牌数据。");
        }
      }
    } catch (err) {
      console.error(err);
      alert("读取文件失败，请确保文件格式正确。");
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const exportJson = () => {
    const jsonStr = JSON.stringify(cardData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardData.name || 'card'}_data.json`;
    link.click();
  };

  // --- Renders ---

  return (
    <>
      {/* 1. Portal Mode */}
      {mode === 'portal' && (
        <PortalView 
          library={library}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onGoToLibrary={goToLibrary}
          onSelectTool={selectTool}
          onSelectLibItem={setSelectedLibItem}
        />
      )}

      {/* 2. Library Mode */}
      {mode === 'library' && (
        <LibraryView 
          library={library}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onGoHome={goHome}
          onSelectLibItem={setSelectedLibItem}
        />
      )}

      {/* 3. Editor Mode */}
      {mode === 'editor' && (
        <div className="flex h-screen bg-parchment-50 dark:bg-obsidian-950 overflow-hidden transition-colors duration-300">
          <aside className={`hidden md:flex flex-col border-r border-parchment-200 dark:border-obsidian-600 bg-parchment-50/95 dark:bg-obsidian-900/90 backdrop-blur-md transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="p-4 flex items-center justify-between border-b border-parchment-200 dark:border-obsidian-600 h-16">
              <button onClick={goHome} className={`flex items-center gap-2 font-serif font-bold text-blue-900 dark:text-amber-500 overflow-hidden whitespace-nowrap ${!isSidebarOpen && 'hidden'}`}>
                <span className="text-xl">工坊</span>
              </button>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 mx-auto">
                {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              {CATEGORY_ORDER.map((category) => (
                <div key={category}>
                    {isSidebarOpen && (
                      <h3 className="px-3 mb-2 text-xs font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-wider">
                        {CATEGORY_CONFIG[category].label}
                      </h3>
                    )}
                    {!isSidebarOpen && <div className="h-px bg-slate-200 dark:bg-zinc-800 my-2 mx-2"></div>}
                    <div className="space-y-1">
                      {TOOL_CATEGORIES[category].map(type => (
                        <SidebarItem 
                          key={type} 
                          type={type} 
                          active={currentTool === type} 
                          isSidebarOpen={isSidebarOpen} 
                          onClick={selectTool}
                        />
                      ))}
                    </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                <button onClick={goToLibrary} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 ${!isSidebarOpen && 'justify-center'}`}>
                  {isSidebarOpen ? <span className="text-sm">个人藏品库</span> : <span className="text-xs font-bold">库</span>}
                </button>
                <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 ${!isSidebarOpen && 'justify-center'}`}>
                  {isSidebarOpen ? <span className="text-sm">{isDark ? '切换至浅色' : '切换至深色'}</span> : <span className="text-xs">{isDark ? '浅' : '深'}</span>}
                </button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
            <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-parchment-200 dark:border-obsidian-600 bg-parchment-50/80 dark:bg-obsidian-900/80 backdrop-blur-sm z-20">
              <div className="flex items-center gap-4">
                  <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-zinc-400">
                    <Menu size={24} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 ${TOOL_CONFIG[currentTool].color}`}>
                        {renderToolIcon(currentTool, { size: 20 })}
                    </div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-200 hidden sm:block">
                        {TOOL_CONFIG[currentTool].label}
                    </h1>
                  </div>
              </div>

              <div className="flex items-center gap-2">
                  <button onClick={() => selectTool(currentTool)} className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-blue-700 dark:text-zinc-400 dark:hover:text-amber-400 transition-colors" title="重置">
                    重置
                  </button>
                  <div className="h-6 w-px bg-slate-300 dark:bg-zinc-700 mx-1"></div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png,application/json" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                    导入卡牌
                  </button>
                  <button onClick={exportJson} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                    导出 JSON
                  </button>
                  <button onClick={handleSaveClick} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-amber-600 border border-blue-600 dark:border-amber-600 rounded-md hover:bg-blue-700 dark:hover:bg-amber-700 transition-colors shadow-sm">
                    保存到本地
                  </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24 lg:pb-8">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                      <CardEditor data={cardData} onChange={setCardData} />
                  </div>
                </div>

                <div className="hidden lg:block lg:col-span-5 relative">
                  <div className="sticky top-6 flex flex-col items-center gap-6">
                    <div className="shadow-2xl shadow-slate-900/20 dark:shadow-black/50 rounded-lg overflow-hidden">
                      <CardPreview data={cardData} elementId="preview-editor" />
                    </div>
                    
                    <div className="flex w-full gap-4 max-w-[400px]">
                       <button onClick={() => copyImageToClipboard('preview-editor')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors font-medium shadow-sm">
                         复制图片
                       </button>
                       <button onClick={() => saveCardAsImage('preview-editor', cardData, cardData.name)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 dark:bg-amber-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-amber-700 transition-colors font-medium shadow-md">
                         下载卡牌
                       </button>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:hidden fixed bottom-6 right-6 z-30">
              <button onClick={() => setShowMobilePreview(true)} className="px-6 py-4 bg-blue-600 dark:bg-amber-600 text-white rounded-full shadow-xl shadow-blue-900/30 dark:shadow-amber-900/30 hover:scale-105 transition-transform font-bold text-sm">
                展开卡牌预览
              </button>
            </div>
          </main>

          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
              <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
                    <span className="font-serif font-bold text-xl text-blue-900 dark:text-amber-500">工具箱</span>
                    <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <button onClick={goHome} className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      <Home size={20} /> 首页
                    </button>
                    <button onClick={goToLibrary} className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      <Library size={20} /> 本地库
                    </button>
                    {CATEGORY_ORDER.map((category) => (
                        <div key={category}>
                            <h3 className="px-3 mb-2 text-xs font-bold text-slate-400 dark:text-zinc-600 uppercase">{CATEGORY_CONFIG[category].label}</h3>
                            <div className="space-y-1">
                              {TOOL_CATEGORIES[category].map(type => (
                                <SidebarItem 
                                  key={type} 
                                  type={type} 
                                  active={currentTool === type} 
                                  isSidebarOpen={true} 
                                  onClick={selectTool}
                                />
                              ))}
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {showMobilePreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:hidden">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMobilePreview(false)}></div>
                <div className="relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
                    <button onClick={() => setShowMobilePreview(false)} className="absolute -top-12 right-0 text-white p-2">
                      <X size={32} />
                    </button>
                    <CardPreview data={cardData} elementId="preview-mobile" />
                    <div className="flex gap-4 mt-6 justify-center">
                        <button onClick={() => copyImageToClipboard('preview-mobile')} className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                            <Copy size={18} /> 复制
                        </button>
                        <button onClick={() => saveCardAsImage('preview-mobile', cardData, cardData.name)} className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
                            <Download size={18} /> 保存
                        </button>
                    </div>
                </div>
            </div>
          )}

          {showSaveOptions && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveOptions(false)}></div>
              <div className="relative z-10 bg-white dark:bg-zinc-900 w-full max-w-sm rounded-xl shadow-2xl p-6 border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-200 mb-2 flex items-center gap-2">
                    <AlertCircle className="text-amber-500" /> 卡牌已存在
                  </h3>
                  <p className="text-slate-600 dark:text-zinc-400 mb-6">
                    库中已经存在一张 ID 相同的卡牌。您希望如何处理本次保存？
                  </p>
                  <div className="space-y-3">
                      <button onClick={handleOverwrite} className="w-full py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 transition-colors">
                        <Save size={18} /> 覆盖原卡牌
                      </button>
                      <button onClick={handleSaveAsNew} className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors">
                        <FilePlus size={18} /> 另存为新卡牌
                      </button>
                      <button onClick={() => setShowSaveOptions(false)} className="w-full py-3 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium transition-colors">
                        取消
                      </button>
                  </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedLibItem && (
        <LibraryDetailModal 
          item={selectedLibItem} 
          onClose={() => setSelectedLibItem(null)} 
          onEdit={handleEdit} 
          onCopy={handleCopyAsTemplate} 
          onDelete={handleDeleteFromLibrary} 
        />
      )}
    </>
  );
}

export default CardWorkshopApp;
