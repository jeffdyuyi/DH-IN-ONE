# 匕首心&爽博朋克in one (DH-IN-ONE)

[![GPL-3.0 License](https://img.shields.io/badge/License-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![Pure Client](https://img.shields.io/badge/Client--Side-Static%20Export-success)](https://github.com/jeffdyuyi/DH-IN-ONE)

> **匕首心&爽博朋克in one (DH-IN-ONE)** 是专为 TRPG 规则《匕首之心 (Daggerheart)》与赛博朋克扩展模组《爽博朋克》打造的免费开源一体化跑团工具箱。
> 集成**爽博朋克赛博车卡器**、**卡牌工坊 V3（含官方 d60 灵感抽取器）**、**战役模组文档编辑器**以及**本地公共卡牌库中枢**。

---

## 🌟 核心功能模块

1. **⚡ 爽博朋克赛博车卡器 (`/character`)**
   - **5 大身体义体插槽**：头部神经、胸腔核心、左右机械臂、下肢腿部。
   - **赛博神经压力与超载系统**：精准跟踪压力 (Stress)、过载阈值 (Overload) 与非法改造 (Illegal Mods)。
   - **独家「霓虹隧道」配色与 A4 打印**：暗黑电光霓虹 UI，支持一键切换「浅色/无墨水打印预览」，直接导出 A4 竖版战术档案。
   - **跨画风战利品直装**：官方奇幻战利品与消耗品直接编译装配入赛博身体槽位。

2. **🎲 卡牌工坊 V3 & 官方 d60 灵感抽取器 (`/workshop`)**
   - 支持 33+ 种卡牌类别自定义设计与可视化实时预览。
   - 内置 **官方 60 种战利品 & 60 种消耗品 d60 抽取器**，支持一键掷骰、一键复制与一键套用为卡牌草稿。
   - 一键同步到本地公共卡牌库，支持导出标准卡包。

3. **📜 战役模组文档编辑器 (`/campaign`)**
   - 专为跑团主持人和创作者设计的章节排版引擎。
   - **公共库卡牌一键插入**：直接从公共库挑选敌人、环境、战利品与赛博装备嵌入章节卡片。
   - 支持导出标准 Markdown 格式文档，内置 DPCGL 社区游戏许可合规免责声明。

4. **🗄️ 公共本地卡牌库中枢 (`/vault`)**
   - 基于浏览器 IndexedDB 纯本地离线存储，数据永不上传云端，隐私安全。
   - 预置 120 张官方核心战利品与消耗品种子卡。
   - 支持全库分类检索、卡包导入与全量数据备份导出。

---

## 🤝 致谢与开源声明 (Credits & Acknowledgements)

本项目遵循 **[GPL-3.0 开源许可证](https://opensource.org/licenses/GPL-3.0)** 进行二次开发与衍生。在开发过程中深度参考并继承了开源社区优秀创作者的代码架构与成果，在此致以最崇高的敬意：

* **原版车卡器核心架构**：基于 [RidRisR/DaggerHeart-CharacterSheet](https://github.com/RidRisR) 及其贡献者团队（PolearmMaster、末楔、里予、一得）的开源项目衍生并深度重构。
* **爽博朋克扩展规则**：致谢爽博朋克赛博朋克扩展规则的创作者与 TRPG 社区拓荒者。
* **官方规则与版权**：Daggerheart 系统参考文档（SRD）及其文本版权归属 Critical Role Productions, LLC. 与 Darrington Press。

---

## 💻 本地运行与部署

本项目为纯前端客户端架构（零服务端依赖），支持离线使用与 GitHub Pages 静态托管：

```bash
# 1. 克隆仓库
git clone https://github.com/jeffdyuyi/DH-IN-ONE.git
cd DH-IN-ONE

# 2. 安装依赖
npm install

# 3. 本地启动开发服务器
npm run dev

# 4. 静态打包（用于部署到 GitHub Pages）
npm run build
```

---

## 📝 许可证

本项目遵循 [GPL-3.0 许可证](https://opensource.org/licenses/GPL-3.0)。
