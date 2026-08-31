"use client";

import React, { useState, useRef } from 'react';
import { 
  Sparkles, ImagePlus, ShieldCheck, Check, 
  Trash2, BookOpen, Layers, Star, Info,
  ChevronDown, ChevronRight, FileText, Scale, Eye,
  Lock, AlertCircle, HeartHandshake, Upload
} from 'lucide-react';
import { 
  ProjectData, CoverPage, CreditsPage, 
  CopyrightSettings, DPCGLLogoType, DPCGLTemplateType, 
  LogoPosition, LogoSize 
} from '../types';
import { 
  DPCGL_LOGOS, DPCGL_TEMPLATES, 
  getLogoUrl, getPositionClass, getSizeClass 
} from '../dpcglHelper';
import { fileToBase64 } from '../utils';

// ==========================================
// 1. 封面与 DPCGL 合规配置卡片 (Cover Card)
// ==========================================
export const CoverPageCard: React.FC<{
  projectData: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onFocusPreview?: () => void;
}> = ({ projectData, onUpdateProject, onFocusPreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const customLogoInputRef = useRef<HTMLInputElement>(null);

  const coverPage = projectData.coverPage || { enabled: false };
  const isEnabled = !!coverPage.enabled;

  const updateCover = (updates: Partial<CoverPage>) => {
    onUpdateProject(prev => ({
      ...prev,
      coverPage: { ...(prev.coverPage || { enabled: false }), ...updates }
    }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateCover({ coverImage: base64, enabled: true });
    } catch {
      alert('封面图片读取失败');
    }
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateCover({ iconImage: base64 });
    } catch {
      alert('印章图片读取失败');
    }
    if (iconInputRef.current) iconInputRef.current.value = '';
  };

  const handleCustomLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateCover({ dpcglLogo: 'custom', customLogoUrl: base64 });
    } catch {
      alert('自定义徽标读取失败');
    }
    if (customLogoInputRef.current) customLogoInputRef.current.value = '';
  };

  const currentLogo = coverPage.dpcglLogo || 'dh_bottle_white_color';
  const logoPosition = coverPage.dpcglLogoPosition || 'top-right';
  const logoSize = coverPage.dpcglLogoSize || 'md';

  return (
    <div id="editor-special-cover" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden transition-all mb-4">
      {/* Header Bar */}
      <div 
        className="flex items-center justify-between p-3.5 bg-stone-50/80 border-b border-stone-100 cursor-pointer select-none hover:bg-stone-100/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            🎨
          </div>
          <div>
            <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
              <span>战役封面与 DPCGL 徽标配置</span>
              {isEnabled && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  已启用
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              设置全彩/插画封面、标题署名与 Darrington Press 社区合规药瓶徽标
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xs font-bold text-stone-600">
              {isEnabled ? '开启封面' : '关闭封面'}
            </span>
            <input 
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => {
                updateCover({ enabled: e.target.checked });
                if (e.target.checked) setIsOpen(true);
                if (onFocusPreview) onFocusPreview();
              }}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer accent-amber-600"
            />
          </label>
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 md:p-5 space-y-5 bg-white">
          <input type="file" ref={coverInputRef} onChange={handleCoverUpload} className="hidden" accept="image/*" />
          <input type="file" ref={iconInputRef} onChange={handleIconUpload} className="hidden" accept="image/*" />
          <input type="file" ref={customLogoInputRef} onChange={handleCustomLogoUpload} className="hidden" accept="image/*" />

          {/* DPCGL Tip */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">DPCGL 官方封面合规指引 (Darrington Press)</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                商业或公开发布的 Daggerheart 模组封面上推荐放置官方全彩/单色药瓶徽标。
              </p>
            </div>
          </div>

          {/* 1. Cover Image Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                封面插画 (Background Image)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-stone-200"
                >
                  <Upload size={13} /> 上传封面图片
                </button>
                {coverPage.coverImage && (
                  <button
                    type="button"
                    onClick={() => updateCover({ coverImage: undefined })}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                    title="移除封面插画"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={coverPage.coverImage || ''}
                onChange={(e) => updateCover({ coverImage: e.target.value })}
                placeholder="或粘贴网络图片 URL..."
                className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500"
              />
            </div>

            {/* Custom Seal / Icon */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                专属战役印章 / 头像图标 (Seal / Icon)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-stone-200"
                >
                  <Upload size={13} /> 上传印章图片
                </button>
                {coverPage.iconImage && (
                  <button
                    type="button"
                    onClick={() => updateCover({ iconImage: undefined })}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                    title="移除印章"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 2. Text Fields */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">封面主标题 (留空则默认使用项目标题)</label>
                <input
                  type="text"
                  value={coverPage.title ?? ''}
                  onChange={(e) => updateCover({ title: e.target.value })}
                  placeholder={projectData.title || "输入封面主标题..."}
                  className="w-full text-sm px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500 font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-stone-500 block mb-1">作者署名 (留空则默认使用项目作者)</label>
                <input
                  type="text"
                  value={coverPage.authorLine ?? ''}
                  onChange={(e) => updateCover({ authorLine: e.target.value })}
                  placeholder={projectData.author || "输入作者署名..."}
                  className="w-full text-sm px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">副标题 / 宣传语 (Tagline)</label>
              <input
                type="text"
                value={coverPage.subtitle ?? ''}
                onChange={(e) => updateCover({ subtitle: e.target.value })}
                placeholder="例如: 一个关于复仇、暗影与救赎的 Daggerheart 兼容战役框架"
                className="w-full text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">封面底部说明 (Footer Note)</label>
              <input
                type="text"
                value={coverPage.footerText ?? ''}
                onChange={(e) => updateCover({ footerText: e.target.value })}
                placeholder="例如: 依据 DPCGL 社区游戏许可协议创作 · 本作品版权归作者所有"
                className="w-full text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 3. DPCGL Logo Picker */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> 选择 DPCGL 官方合规徽标
              </label>
              <button
                type="button"
                onClick={() => customLogoInputRef.current?.click()}
                className="text-[11px] text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
              >
                + 上传自定义徽标
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DPCGL_LOGOS.slice(0, 8).map(logo => {
                const isSelected = currentLogo === logo.id;
                return (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() => updateCover({ dpcglLogo: logo.id })}
                    className={`p-2 rounded-lg border text-left flex flex-col justify-between gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20' 
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="h-10 w-full rounded bg-stone-900 flex items-center justify-center p-1">
                      {logo.previewUrl ? (
                        <img src={logo.previewUrl} alt={logo.name} className="h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-stone-400">无徽标</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-stone-800 truncate">{logo.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Position & Size */}
            {currentLogo !== 'none' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">徽标摆放位置</label>
                  <select
                    value={logoPosition}
                    onChange={(e) => updateCover({ dpcglLogoPosition: e.target.value as LogoPosition })}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-1.5 font-medium outline-none"
                  >
                    <option value="top-right">右上角 (经典推荐)</option>
                    <option value="top-left">左上角</option>
                    <option value="center-top">居中顶部</option>
                    <option value="bottom-right">右下角</option>
                    <option value="bottom-left">左下角</option>
                    <option value="center-bottom">居中底部</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">徽标尺寸</label>
                  <select
                    value={logoSize}
                    onChange={(e) => updateCover({ dpcglLogoSize: e.target.value as LogoSize })}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-1.5 font-medium outline-none"
                  >
                    <option value="sm">小 (70px)</option>
                    <option value="md">中等 (95px 标准)</option>
                    <option value="lg">大 (140px 醒目)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. 战役概览与安全工具卡片 (Overview Card)
// ==========================================
export const OverviewPageCard: React.FC<{
  projectData: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
}> = ({ projectData, onUpdateProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const settings = projectData.settings || {};

  const updateSetting = (key: string, val: any) => {
    onUpdateProject(prev => ({
      ...prev,
      settings: { ...(prev.settings || {}), [key]: val }
    }));
  };

  const updateProjectField = (key: keyof ProjectData, val: any) => {
    onUpdateProject(prev => ({
      ...prev,
      [key]: val
    }));
  };

  return (
    <div id="editor-special-overview" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden transition-all mb-4">
      <div 
        className="flex items-center justify-between p-3.5 bg-stone-50/80 border-b border-stone-100 cursor-pointer select-none hover:bg-stone-100/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
            📜
          </div>
          <div>
            <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
              <span>战役概览、引子与安全机制</span>
            </div>
            <p className="text-[11px] text-stone-500">
              设置核心背景概念、剧情引子、复杂度星级、适用等级与跑团安全工具
            </p>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 md:p-5 space-y-4 bg-white">
          {/* Metadata Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">适用等级范围 (Level)</label>
              <input
                type="text"
                value={projectData.levelRange || ''}
                onChange={(e) => updateProjectField('levelRange', e.target.value)}
                placeholder="例如: 1-4 级 (Tier 1)"
                className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">复杂度评级 (1-5 星)</label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateProjectField('complexity', star)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      size={18}
                      className={`${(projectData.complexity || 0) >= star ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">跑团基调 (Tone)</label>
              <input
                type="text"
                value={projectData.tone || ''}
                onChange={(e) => updateProjectField('tone', e.target.value)}
                placeholder="例如: 黑暗悬疑 · 探索生存"
                className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Concept & Hook */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 block mb-1">核心概念与一句话介绍 (Concept)</label>
            <textarea
              rows={2}
              value={projectData.concept || ''}
              onChange={(e) => updateProjectField('concept', e.target.value)}
              placeholder="简要概括这部战役的核心冲突与独特之处..."
              className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          {/* Summary / Introduction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">背景故事梗概 (Summary)</label>
              <textarea
                rows={3}
                value={projectData.summary || ''}
                onChange={(e) => updateProjectField('summary', e.target.value)}
                placeholder="故事开始前这片大陆发生了什么..."
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-indigo-500 resize-y"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">开场简介 / 玩家引子 (Introduction)</label>
              <textarea
                rows={3}
                value={projectData.introduction || ''}
                onChange={(e) => updateProjectField('introduction', e.target.value)}
                placeholder="玩家角色是如何聚集在一起并卷入此事件的..."
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-indigo-500 resize-y"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. 致谢与后记卡片 (Credits Card)
// ==========================================
export const CreditsPageCard: React.FC<{
  projectData: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onFocusPreview?: () => void;
}> = ({ projectData, onUpdateProject, onFocusPreview }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const creditsPage = projectData.creditsPage || { enabled: false };
  const isEnabled = !!creditsPage.enabled;

  const updateCredits = (updates: Partial<CreditsPage>) => {
    onUpdateProject(prev => ({
      ...prev,
      creditsPage: { ...(prev.creditsPage || { enabled: false }), ...updates }
    }));
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      updateCredits({ backgroundImage: base64, enabled: true });
    } catch {
      alert('图片读取失败');
    }
    if (bgInputRef.current) bgInputRef.current.value = '';
  };

  return (
    <div id="editor-special-credits" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden transition-all mt-4 mb-4">
      <div 
        className="flex items-center justify-between p-3.5 bg-stone-50/80 border-b border-stone-100 cursor-pointer select-none hover:bg-stone-100/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
            🏆
          </div>
          <div>
            <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
              <span>致谢、后记与创作团队名单</span>
              {isEnabled && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  已启用
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              设置全书结尾致谢辞、测试玩家鸣谢与背景插图
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xs font-bold text-stone-600">
              {isEnabled ? '开启致谢' : '关闭致谢'}
            </span>
            <input 
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => {
                updateCredits({ enabled: e.target.checked });
                if (e.target.checked) setIsOpen(true);
                if (onFocusPreview) onFocusPreview();
              }}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer accent-purple-600"
            />
          </label>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 md:p-5 space-y-4 bg-white">
          <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => bgInputRef.current?.click()}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-stone-200"
            >
              <Upload size={13} /> 上传致谢背景插画
            </button>
            {creditsPage.backgroundImage && (
              <button
                type="button"
                onClick={() => updateCredits({ backgroundImage: undefined })}
                className="text-xs text-red-500 hover:text-red-700 font-bold"
              >
                移除背景图
              </button>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-stone-500 block mb-1">致谢辞与鸣谢正文 (支持 Markdown)</label>
            <textarea
              rows={4}
              value={creditsPage.creditsText || ''}
              onChange={(e) => updateCredits({ creditsText: e.target.value })}
              placeholder="特别感谢所有参与测试的跑团伙伴、提供灵感的社区创作者，以及支持本项目的每一位玩家..."
              className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-purple-500 resize-y leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. DPCGL 官方版权声明页卡片 (Copyright Card)
// ==========================================
export const CopyrightPageCard: React.FC<{
  projectData: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onFocusPreview?: () => void;
}> = ({ projectData, onUpdateProject, onFocusPreview }) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyright = projectData.creditsPage?.copyright || {
    enabled: true,
    template: 'dh_bilingual' as DPCGLTemplateType,
    workTitle: projectData.title,
    authorName: projectData.author,
    year: '2026',
    hasModifications: false,
    modificationsNote: '',
    customNotice: '',
    showDPCGLLogo: true,
    dpcglLogo: 'dh_bottle_white_color' as DPCGLLogoType,
  };

  const isEnabled = copyright.enabled !== false;

  const updateCopyright = (updates: Partial<CopyrightSettings>) => {
    onUpdateProject(prev => {
      const currentCredits = prev.creditsPage || { enabled: false };
      return {
        ...prev,
        creditsPage: {
          ...currentCredits,
          copyright: { ...copyright, ...updates }
        }
      };
    });
  };

  const applyTemplate = (templateType: DPCGLTemplateType) => {
    const tmpl = DPCGL_TEMPLATES.find(t => t.id === templateType);
    if (tmpl) {
      const generated = tmpl.generateText({
        workTitle: copyright.workTitle || projectData.title || '战役名称',
        authorName: copyright.authorName || projectData.author || '作者',
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

  return (
    <div id="editor-special-copyright" className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden transition-all mb-4">
      <div 
        className="flex items-center justify-between p-3.5 bg-stone-50/80 border-b border-stone-100 cursor-pointer select-none hover:bg-stone-100/70 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          >
            {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>
          <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
            ⚖️
          </div>
          <div>
            <div className="font-bold text-stone-800 text-sm flex items-center gap-2">
              <span>DPCGL 官方社区游戏许可声明 (Darrington Press 2.0)</span>
              {isEnabled && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  已启用合规声明
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500">
              内置官方 1:1 标准合规法律模板，保护原创作者权益并遵守社区开源协议
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <span className="text-xs font-bold text-stone-600">
              {isEnabled ? '包含版权页' : '关闭版权页'}
            </span>
            <input 
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => {
                updateCopyright({ enabled: e.target.checked });
                if (e.target.checked) setIsOpen(true);
                if (onFocusPreview) onFocusPreview();
              }}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer accent-teal-600"
            />
          </label>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 md:p-5 space-y-4 bg-white">
          {/* Template Buttons */}
          <div>
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
              快速应用 DPCGL 官方合规模板
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DPCGL_TEMPLATES.map(tmpl => {
                const isSelected = copyright.template === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-teal-600 bg-teal-50/70 font-bold text-teal-900 ring-2 ring-teal-500/20' 
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40 text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{tmpl.title}</span>
                      {isSelected && <Check size={13} className="text-teal-600" />}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{tmpl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">作品名称</label>
              <input
                type="text"
                value={copyright.workTitle ?? projectData.title ?? ''}
                onChange={(e) => updateCopyright({ workTitle: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">创作者 / 版权所有人</label>
              <input
                type="text"
                value={copyright.authorName ?? projectData.author ?? ''}
                onChange={(e) => updateCopyright({ authorName: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-500 block mb-1">版权年份</label>
              <input
                type="text"
                value={copyright.year ?? '2026'}
                onChange={(e) => updateCopyright({ year: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Raw Text Output Editor */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-500 block">
                法律免责声明正文 (Markdown 格式)
              </label>
              <button
                type="button"
                onClick={() => applyTemplate(copyright.template || 'dh_bilingual')}
                className="text-[11px] text-teal-700 hover:text-teal-900 font-bold"
              >
                🔄 重新生成默认声明
              </button>
            </div>
            <textarea
              rows={4}
              value={copyright.rawDeclarationText || ''}
              onChange={(e) => updateCopyright({ rawDeclarationText: e.target.value })}
              className="w-full text-[11px] font-mono px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-teal-500 resize-y leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
