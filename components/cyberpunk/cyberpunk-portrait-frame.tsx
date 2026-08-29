"use client"

import React, { useState, useRef } from 'react'
import { Upload, ZoomIn, ZoomOut, RotateCcw, Trash2, Image as ImageIcon } from 'lucide-react'

interface CyberpunkPortraitFrameProps {
  portraitUrl?: string
  scale?: number
  position?: { x: number; y: number }
  onChange: (data: { portrait?: string; portraitScale?: number; portraitPosition?: { x: number; y: number } }) => void
}

export function CyberpunkPortraitFrame({
  portraitUrl,
  scale = 1,
  position = { x: 0, y: 0 },
  onChange,
}: CyberpunkPortraitFrameProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // 处理文件读取并压缩/格式化
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        // 创建 Image 对象以校验并标准化尺寸
        const img = new Image()
        img.onload = () => {
          // 标准立绘最大尺寸限制，防止过大 localstorage 溢出
          const maxDim = 1200
          let width = img.width
          let height = img.height

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            } else {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL('image/webp', 0.88)
            onChange({
              portrait: compressed,
              portraitScale: 1,
              portraitPosition: { x: 0, y: 0 },
            })
          }
        }
        img.src = result
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClear = () => {
    onChange({
      portrait: undefined,
      portraitScale: 1,
      portraitPosition: { x: 0, y: 0 },
    })
  }

  // 缩放调整
  const handleZoom = (delta: number) => {
    const newScale = Math.min(2.5, Math.max(0.5, (scale || 1) + delta))
    onChange({ portraitScale: Number(newScale.toFixed(2)) })
  }

  // 平移拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!portraitUrl) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - (position?.x || 0), y: e.clientY - (position?.y || 0) })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    const newX = Math.round(e.clientX - panStart.x)
    const newY = Math.round(e.clientY - panStart.y)
    onChange({ portraitPosition: { x: newX, y: newY } })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-[260px] min-h-[480px] max-h-[560px] rounded-xl border border-[#6C00FF]/40 bg-[#0B0320]/90 p-2 overflow-hidden shadow-[inset_0_0_25px_rgba(108,0,255,0.15)] group select-none">
      {/* 隐藏的上传 input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
          }
        }}
      />

      {/* 科幻四角定位标与发光线条 */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00FFA3]/70 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#00FFA3]/70 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#00FFA3]/70 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00FFA3]/70 pointer-events-none" />

      {/* 背景网格与环境光晕 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,0,255,0.18)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,163,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,163,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* 主展示区 */}
      <div
        className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg cursor-pointer ${
          isDragging ? 'border-2 border-dashed border-[#00FFA3] bg-[#00FFA3]/10' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => {
          if (!portraitUrl) fileInputRef.current?.click()
        }}
      >
        {portraitUrl ? (
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${position?.x || 0}px, ${position?.y || 0}px) scale(${scale || 1})`,
              cursor: isPanning ? 'grabbing' : 'grab',
            }}
          >
            <img
              src={portraitUrl}
              alt="角色立绘"
              className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            />
          </div>
        ) : (
          /* 空状态：人体线框剪影与上传引导 */
          <div className="flex flex-col items-center justify-center text-center p-4 space-y-3 z-10">
            {/* 科幻人体线条 SVG 轮廓 */}
            <div className="relative w-36 h-64 flex items-center justify-center opacity-40 group-hover:opacity-75 transition-opacity">
              <svg viewBox="0 0 100 200" className="w-full h-full stroke-[#00FFA3] fill-none stroke-[1.2]">
                {/* 头部 */}
                <circle cx="50" cy="22" r="14" strokeDasharray="3 2" />
                {/* 颈部与躯干 */}
                <path d="M 46 36 L 44 46 L 32 58 L 22 95 L 30 98 L 38 68 L 40 105 L 34 145 L 30 190 L 44 190 L 48 115 L 52 115 L 56 190 L 70 190 L 66 145 L 60 105 L 62 68 L 70 98 L 78 95 L 68 58 L 56 46 L 54 36 Z" />
                {/* 胸口核心标记 */}
                <circle cx="50" cy="65" r="4" className="stroke-[#F5F500] fill-[#F5F500]/20" />
                <line x1="50" y1="36" x2="50" y2="105" strokeDasharray="2 2" className="stroke-[#6C00FF]" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#00FFA3]">
                <Upload className="w-3.5 h-3.5" />
                <span>点击或拖拽上传全身立绘</span>
              </div>
              <p className="text-[10px] text-slate-400">
                支持 PNG / JPG / WebP · 自动标准化分辨率
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮微调控制工具栏 (立绘已上传时显示) */}
      {portraitUrl && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#12072B]/90 backdrop-blur border border-[#6C00FF]/50 rounded-lg px-2 py-1 shadow-lg z-20 opacity-90 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleZoom(0.1)
            }}
            className="p-1 text-slate-300 hover:text-[#00FFA3] rounded"
            title="放大立绘"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleZoom(-0.1)
            }}
            className="p-1 text-slate-300 hover:text-[#00FFA3] rounded"
            title="缩小立绘"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange({ portraitScale: 1, portraitPosition: { x: 0, y: 0 } })
            }}
            className="p-1 text-slate-300 hover:text-[#F5F500] rounded"
            title="居中重置"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            className="p-1 text-slate-300 hover:text-[#00FFA3] rounded text-[10px] font-bold flex items-center gap-1"
            title="更换立绘"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>更换</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="p-1 text-slate-400 hover:text-[#FF007F] rounded"
            title="移除立绘"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
