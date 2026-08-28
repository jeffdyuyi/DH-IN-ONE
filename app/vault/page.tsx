"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function VaultPage() {
  const router = useRouter()

  useEffect(() => {
    // 统一重定向至卡牌工坊唯一本地库
    router.replace('/workshop?view=library')
  }, [router])

  return (
    <div className="min-h-screen bg-[#0d0f17] flex flex-col items-center justify-center text-stone-300 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      <p className="text-sm">正在前往卡牌工坊本地库...</p>
    </div>
  )
}
