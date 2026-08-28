import React, { useState, useEffect } from 'react';
import { SavedProject, ProjectData } from '../types';
import { 
  Folder, Save, Trash2, Copy, Upload, 
  X, Clock, CheckCircle2, FileJson, Search, PlusCircle
} from 'lucide-react';

interface SavedLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: ProjectData;
  onLoadProject: (project: ProjectData) => void;
  onSaveCurrentAsNew: (title?: string) => void;
  onOverwriteCurrent: () => void;
  lastAutoSaveTime?: number | null;
}

export const LIBRARY_STORAGE_KEY = 'dh_campaign_library_v1';

export const SavedLibraryModal: React.FC<SavedLibraryModalProps> = ({
  isOpen,
  onClose,
  currentData,
  onLoadProject,
  onSaveCurrentAsNew,
  onOverwriteCurrent,
  lastAutoSaveTime,
}) => {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadLibrary();
      setNewTitle(currentData.title || '新战役框架');
    }
  }, [isOpen, currentData]);

  const loadLibrary = () => {
    try {
      const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (raw) {
        setSavedProjects(JSON.parse(raw));
      } else {
        setSavedProjects([]);
      }
    } catch (err) {
      console.error('Failed to load project library', err);
    }
  };

  const saveLibrary = (projects: SavedProject[]) => {
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(projects));
      setSavedProjects(projects);
    } catch (err) {
      console.error('Failed to save project library', err);
    }
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveAsNew = () => {
    onSaveCurrentAsNew(newTitle.trim() || undefined);
    showToast(`已成功保存战役《${newTitle.trim() || currentData.title}》为新作品！`);
    loadLibrary();
  };

  const handleOverwrite = () => {
    onOverwriteCurrent();
    showToast('已更新当前存档！');
    loadLibrary();
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = savedProjects.find(p => p.id === id);
    if (!target) return;

    const newId = 'doc_' + Math.random().toString(36).substring(2, 10);
    const dupData: ProjectData = {
      ...JSON.parse(JSON.stringify(target.data)),
      id: newId,
      title: `${target.title} (副本)`,
    };

    const dupEntry: SavedProject = {
      id: newId,
      title: dupData.title,
      author: dupData.author,
      updatedAt: Date.now(),
      sectionCount: dupData.sections?.length || 0,
      concept: dupData.concept,
      data: dupData,
    };

    saveLibrary([dupEntry, ...savedProjects]);
    showToast(`已创建副本《${dupEntry.title}》`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = savedProjects.find(p => p.id === id);
    if (!target) return;

    if (window.confirm(`确定要删除存档《${target.title}》吗？此操作无法撤销。`)) {
      const updated = savedProjects.filter(p => p.id !== id);
      saveLibrary(updated);
      showToast('已从本地库中删除存档。');
    }
  };

  const handleLoad = (project: SavedProject) => {
    onLoadProject(project.data);
    showToast(`已成功加载《${project.title}》`);
    onClose();
  };

  const handleExportSingle = (project: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    const json = JSON.stringify(project.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.sections) {
          const docId = json.id || ('doc_' + Math.random().toString(36).substring(2, 10));
          const projectWithId = { ...json, id: docId };
          const entry: SavedProject = {
            id: docId,
            title: json.title || '导入的战役',
            author: json.author || '未知',
            updatedAt: Date.now(),
            sectionCount: json.sections.length,
            concept: json.concept,
            data: projectWithId,
          };
          // Filter out existing with same ID
          const filtered = savedProjects.filter(p => p.id !== docId);
          saveLibrary([entry, ...filtered]);
          showToast(`已将《${entry.title}》导入本地作品库！`);
        } else {
          alert('无效的项目文件格式。');
        }
      } catch (err) {
        console.error(err);
        alert('文件解析失败。');
      }
    };
    reader.readAsText(file);
  };

  const filteredProjects = savedProjects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.title || '').toLowerCase().includes(term) ||
      (p.concept || '').toLowerCase().includes(term) ||
      (p.author || '').toLowerCase().includes(term)
    );
  });

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const currentSavedInLibrary = savedProjects.find(p => p.id === currentData.id);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 print:hidden select-none">
      <div className="bg-stone-900 text-stone-100 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-amber-500">
            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-100 tracking-wide">
                本地作品库 (文档保存中心)
              </h2>
              <p className="text-[10px] text-stone-400">
                支持同ID更新 & 每5分钟自动保存
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="bg-amber-950/80 text-amber-300 text-xs px-4 py-2 flex items-center gap-2 border-b border-amber-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Save Bar & Tools */}
        <div className="p-4 bg-stone-850 border-b border-stone-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex-1 flex items-center gap-2 min-w-[280px]">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="输入保存标题..."
                className="flex-1 bg-stone-900 border border-stone-700 text-stone-100 text-xs px-3 py-2 rounded-lg outline-none focus:border-amber-500 transition-colors"
              />
              <button
                onClick={handleSaveAsNew}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> 存为新作品
              </button>

              {currentSavedInLibrary && (
                <button
                  onClick={handleOverwrite}
                  className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/40 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer"
                  title="更新当前作品在本地库中的记录"
                >
                  <Save className="w-4 h-4" /> 覆盖保存
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索存档..."
                  className="bg-stone-900 border border-stone-700 text-stone-300 text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-amber-500 w-40"
                />
              </div>

              <label className="flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs px-2.5 py-1.5 rounded-lg border border-stone-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>导入</span>
                <input type="file" onChange={handleImportJSON} className="hidden" accept=".json" />
              </label>
            </div>

          </div>

          {lastAutoSaveTime && (
            <div className="text-[10px] text-amber-400/90 flex items-center gap-1.5 pt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>系统自动保存于: {formatDate(lastAutoSaveTime)} (每5分钟自动存入本地库，同一ID覆盖保存)</span>
            </div>
          )}
        </div>

        {/* Saved List Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-stone-500 text-xs space-y-2">
              <Folder className="w-10 h-10 mx-auto opacity-30 text-amber-500" />
              <p>本地作品库暂无保存的战役文档</p>
              <p className="text-[11px] opacity-70">
                点击上方“存为新作品”即可归档，修改同ID文档时将自动覆盖保存，绝不重复创建多份！
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isCurrent = project.id === currentData.id;
              return (
                <div
                  key={project.id}
                  onClick={() => handleLoad(project)}
                  className={`group relative border p-4 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isCurrent 
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/30' 
                      : 'bg-stone-850 hover:bg-stone-800 border-stone-700 hover:border-amber-500/50'
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif font-bold text-base text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                        {project.title || '未命名战役'}
                      </h3>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                          当前在用
                        </span>
                      )}
                      <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded border border-stone-700 font-mono">
                        ID: {project.id}
                      </span>
                      <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded border border-stone-700">
                        {project.sectionCount || project.data?.sections?.length || 0} 章节
                      </span>
                    </div>

                    {project.concept && (
                      <p className="text-xs text-stone-400 italic line-clamp-1">
                        “{project.concept}”
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-stone-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(project.updatedAt)}
                      </span>
                      {project.author && <span>作者: {project.author}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleLoad(project)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      加载
                    </button>

                    <button
                      onClick={(e) => handleExportSingle(project, e)}
                      className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-700 cursor-pointer"
                      title="导出此存档 JSON"
                    >
                      <FileJson className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDuplicate(project.id, e)}
                      className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-700 cursor-pointer"
                      title="创建副本"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/40 cursor-pointer"
                      title="删除存档"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
          <span>所有存档安全存储于本地 localStorage，同 ID 覆盖保存，每 5 分钟自动定格</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>

      </div>
    </div>
  );
};
