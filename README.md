# 反内卷 AI 榜 · Anti-Involution AI List

> 主流 AI 评选比的是谁更能替代人类。我们反其道而行。

「反内卷 AI 榜」是一个发现、展示、讨论**非主流 AI 项目**的互动榜单网站。我们专门奖励那些**增强人而非替代人**、或者**完全没用但充满创意**的 AI 项目。

---

## 核心奖项

| 奖项 | 说明 |
|------|------|
| 🏆 **最不可替代奖** | 奖励增强人、扩展人能力而非替代人的 AI |
| 🏅 **最没用 AI 奖** | 奖励完全无实用价值但有创意的 AI |

奖项由主办方评定，访客投票作参考。每届可扩充新奖项。

---

## 功能概览

- **榜单首页**：当届候选 AI 卡片浏览，支持按奖项筛选和排序
- **AI 详情页**：项目介绍、评委点评、点赞、评论
- **历届存档**：永久记录每届获奖项目
- **点赞投票**：无需注册，即点即赞，有防刷机制
- **评论互动**：匿名发言，轻松吐槽
- **提名 / 自荐**：发现好项目可提名，AI 作者可自荐参评
- **管理后台**：审核提名、管理项目、控制届次、配置内容

---

## 届次机制

网站以「届」为周期运营：

1. **候选期** — 公开接受提名和投票
2. **颁奖期** — 公布获奖结果
3. **存档** — 历届记录永久展示

---

## 技术要求

> 技术选型由程序员自主决定，记录在本文件"技术栈"节后提交 PR 更新。

**硬性要求：**
- SSR 或静态生成（非纯 SPA），满足 SEO 需求
- 响应式设计，支持移动端（最小宽度 375px）
- 主流浏览器兼容（Chrome / Safari / Firefox 最近两个主版本）
- 生产环境 HTTPS

**性能指标：**
- 首屏加载 ≤ 3 秒（4G 网络）
- 点赞响应 ≤ 1 秒
- 评论提交响应 ≤ 2 秒

---

## 技术栈

| 分类 | 选型 | 理由 |
|------|------|------|
| **框架** | Next.js 14 (App Router) + TypeScript | SSR/SSG 满足 SEO 需求；App Router 支持 Server Components，首屏性能好 |
| **样式** | Tailwind CSS | 开发速度快，响应式设计友好 |
| **数据库** | SQLite（开发）/ PostgreSQL（生产） | SQLite 零配置方便本地开发；生产用 PostgreSQL 保证可靠性 |
| **ORM** | Prisma | 类型安全，迁移管理规范，与 Next.js 生态契合 |
| **部署** | Vercel（前端）+ Railway（数据库） | Vercel 与 Next.js 原生集成；Railway 托管 PostgreSQL 省心 |
| **代码规范** | ESLint + Prettier | 统一团队代码风格 |

---

## 开发指南

### 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（复制示例文件）
cp .env.example .env
# 编辑 .env，默认使用 SQLite 无需额外配置

# 3. 初始化数据库
npx prisma db push

# 4. 启动开发服务器
npm run dev
```

浏览器访问 http://localhost:3000

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接串 | `file:./dev.db`（SQLite） |

### 数据库操作

```bash
# 查看数据库（GUI）
npx prisma studio

# 应用 Schema 变更
npx prisma db push

# 生成 Prisma Client
npx prisma generate
```

### 数据库 Schema

```
Season     — 届次（UPCOMING / ACTIVE / ARCHIVED）
Project    — AI 项目（关联 Season，含奖项字段）
Submission — 提名/自荐（PENDING / APPROVED / REJECTED）
Like       — 点赞（fingerprint 防刷，唯一约束）
Comment    — 匿名评论
```

---

## Issue 与开发规范

所有需求已拆解为 GitHub Issue，见 [Issues 列表](https://github.com/LI-Mingyu/anti-involution-ai/issues)。

**建议开工顺序：**
1. `#1` 项目初始化（技术选型 + 数据库 + 脚手架）—— **其他所有 Issue 依赖此项**
2. `#13` 后台登录 + `#11` 届次管理 + `#10` 项目管理 —— 管理员可录入种子数据
3. `#2` 首页 + `#3` 详情页 + `#5` 点赞 —— 核心用户体验
4. 其余 P1 Issue 按顺序补齐

**MVP 范围外（二期）：**
- 弹幕功能
- 测一测功能

---

## 项目团队

| 角色 | 说明 |
|------|------|
| 老板 | 李明宇，最终决策者 |
| 项目经理 | 陈驰（AI），负责需求拆解、进度追踪、Issue 管理 |
| 需求分析师 | 聆析（AI），负责用户需求收集与 PRD 整理 |
| 程序员 | AI Agent，负责全栈开发 |

需求规格说明书（PRD）：[飞书文档](https://icnw0rzptxcm.feishu.cn/docx/B5AQdk0VWossRhxeaICcEur1nLc)

---

## License

MIT

