import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: {
    absolute: "关于本项目 | 匕首心&爽博朋克in one",
  },
  description:
    "关于 DH-IN-ONE：集成《爽博朋克：渊边行者》特化车卡器、原版 DaggerHeart 车卡器、卡牌工坊 V3、战役文档编辑器与本地公共卡牌库中枢的一体化跑团工作台。",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* 顶部面包屑导航 */}
        <nav className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <Link href="/" className="text-[#00FFA3] hover:underline">
            ← 返回主页门户
          </Link>
          <span>|</span>
          <Link href="/cyberpunk" className="hover:text-white transition">
            爽博朋克车卡器
          </Link>
          <span>|</span>
          <Link href="/character/standard" className="hover:text-white transition">
            奇幻标准车卡器
          </Link>
          <span>|</span>
          <Link href="/workshop" className="hover:text-white transition">
            卡牌工坊
          </Link>
          <span>|</span>
          <Link href="/campaign" className="hover:text-white transition">
            战役编辑器
          </Link>
        </nav>

        {/* 主体介绍卡片 */}
        <article className="rounded-2xl border border-white/10 bg-slate-800/80 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
              DH-IN-ONE
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-white">
              匕首心 & 爽博朋克 in one
            </h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              免费开源、纯本地存储、免注册登录的一体化跑团工作台。
            </p>
          </div>

          {/* 1. 项目与架构关系说明 */}
          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-lg font-bold text-[#F5F500] flex items-center gap-2">
              <span>📌 原项目与本项目说明</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                <div className="font-bold text-white text-sm">原项目：DHSheet（匕首之心车卡器）</div>
                <p className="text-slate-300 leading-relaxed">
                  由开源作者 <strong>RidRisR</strong> 独立开发并开源的 DaggerHeart 纯本地车卡器。提供了极为出色的卡牌抽屉、角色属性计算、海豹骰导出与本地存档功能。
                </p>
                <div className="text-slate-400">
                  原作者联系 QQ：<code className="text-slate-200 bg-white/5 px-1 py-0.5 rounded">2839705644</code>
                </div>
              </div>

              <div className="rounded-xl border border-[#00FFA3]/30 bg-[#00FFA3]/[0.03] p-4 space-y-2">
                <div className="font-bold text-[#00FFA3] text-sm">本项目：DH-IN-ONE（四合一平台）</div>
                <p className="text-slate-300 leading-relaxed">
                  由 <strong>不咕鸟（基德）</strong> 主导扩展与整合，在原项目优秀底座之上，引入了《爽博朋克：渊边行者》官方战役特化车卡引擎、卡牌工坊 V3、战役文档编辑器与公共本地卡牌库（Vault）。
                </p>
                <div className="text-slate-400">
                  维护者联系 QQ：<code className="text-[#00FFA3] bg-[#00FFA3]/10 px-1 py-0.5 rounded font-bold">442348584</code>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 页面与功能分工定位 */}
          <section className="space-y-3 border-t border-white/10 pt-6 text-xs text-slate-300">
            <h2 className="text-lg font-bold text-[#FF007F]">
              🧭 页面功能与使用定位
            </h2>
            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-white/5 bg-black/20 flex items-start gap-3">
                <span className="font-bold text-[#00FFA3] shrink-0 text-sm">/cyberpunk</span>
                <div>
                  <strong className="text-white block text-xs">爽博朋克专属车卡器（本页面）</strong>
                  <span className="text-slate-400">
                    专为《爽博朋克：渊边行者》战役定制。支持 4 大区义体槽位、动态伤害阈值与巨额伤害房规、随身消耗品堆叠、黑市非法改造与 A4 黑白线框打印。
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-white/5 bg-black/20 flex items-start gap-3">
                <span className="font-bold text-amber-400 shrink-0 text-sm">/character/standard</span>
                <div>
                  <strong className="text-white block text-xs">DaggerHeart 标准奇幻车卡器（原页面）</strong>
                  <span className="text-slate-400">
                    原汁原味的官方规则奇幻车卡器，完整支持 9 大职业、种族社群卡牌、随从伙伴、多页冒险笔记。
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-white/5 bg-black/20 flex items-start gap-3">
                <span className="font-bold text-[#F5F500] shrink-0 text-sm">/workshop</span>
                <div>
                  <strong className="text-white block text-xs">卡牌工坊 V3</strong>
                  <span className="text-slate-400">
                    33+ 种卡牌制图与创作工具，内置 d60 战利品/消耗品灵感发生器与图片隐写导出。
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-white/5 bg-black/20 flex items-start gap-3">
                <span className="font-bold text-[#FF007F] shrink-0 text-sm">/campaign</span>
                <div>
                  <strong className="text-white block text-xs">匕首心战役编辑器</strong>
                  <span className="text-slate-400">
                    专业的跑团模组排版工具，支持直接嵌入官方敌人、环境、战利品与 DPCGL 合规许可导出。
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-white/5 bg-black/20 flex items-start gap-3">
                <span className="font-bold text-[#6C00FF] shrink-0 text-sm">/vault</span>
                <div>
                  <strong className="text-white block text-xs">公共卡牌库中枢 (Vault)</strong>
                  <span className="text-slate-400">
                    内置官方 120 物品种子，统一管理所有自制卡包、装备包与跨工具卡牌流通。
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 意见反馈与联系 */}
          <section className="space-y-2 border-t border-white/10 pt-6 text-xs">
            <h2 className="text-base font-bold text-white">📬 意见反馈与社区</h2>
            <p className="text-slate-400 leading-relaxed">
              如果您在跑团使用过程中发现任何计算错误、界面错版或排版建议，欢迎随时联系作者反馈：
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-slate-400">爽博朋克战役 & 整合维护：</span>
                <strong className="text-[#00FFA3] ml-1">不咕鸟（QQ：442348584）</strong>
              </div>
              <div className="bg-white/5 p-2.5 rounded-lg border border-white/10">
                <span className="text-slate-400">DaggerHeart 车卡器原作者：</span>
                <strong className="text-slate-200 ml-1">RidRisR（QQ：2839705644）</strong>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  )
}
