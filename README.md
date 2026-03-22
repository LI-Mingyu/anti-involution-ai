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

## 技术栈

| 分类 | 选型 |
|------|------|
| **框架** | Next.js 14 (App Router) + TypeScript |
| **样式** | Tailwind CSS |
| **数据库** | SQLite（本地开发）/ PostgreSQL（生产，Railway） |
| **ORM** | Prisma |
| **部署** | Vercel（前端）+ Railway（数据库） |
| **代码规范** | ESLint + Prettier |

---

## 开发指南

### 环境要求

- Node.js 20.9+
- npm

### 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 本地开发使用 SQLite，默认配置无需修改
# 修改 ADMIN_PASSWORD 为你想要的后台登录密码

# 3. 初始化数据库
npx prisma db push

# 4. 启动开发服务器
npm run dev
```

浏览器访问 http://localhost:3000，后台访问 http://localhost:3000/admin

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | 数据库连接串 | `file:./dev.db`（SQLite） |
| `ADMIN_PASSWORD` | 后台登录密码 | 无默认值，**必须设置** |
| `SESSION_SECRET` | Session 签名密钥（生产环境必须设置） | 内置默认值（不安全） |

详见 `.env.example`。

### 常用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run lint         # 代码检查

npx prisma db push   # 同步数据库 Schema
npx prisma studio    # 数据库 GUI（Prisma Studio）
npx prisma generate  # 生成 Prisma Client
```

### 数据库 Schema

```
Season     — 届次（UPCOMING / ACTIVE / AWARDING / ARCHIVED）
Project    — AI 项目（关联 Season，含奖项、点赞、评论）
Submission — 提名/自荐（PENDING / APPROVED / REJECTED）
Like       — 点赞（fingerprint + IP 防刷）
Comment    — 匿名评论
LikeAdjustLog — 点赞数校正操作日志
```

---

## 项目状态

当前 MVP 开发进度：

| 模块 | 状态 |
|------|------|
| 项目初始化（技术选型 + 数据库 + 脚手架） | ✅ 完成 |
| 首页榜单页面 | ✅ 完成 |
| AI 项目详情页 | ✅ 完成 |
| 历届获奖存档页 | ✅ 完成 |
| 投票 / 点赞功能 | ✅ 完成 |
| 管理后台 - 登录与访问保护 | ✅ 完成 |
| 管理后台 - 届次管理 | ✅ 完成 |
| 管理后台 - 项目管理 | ✅ 完成 |
| 管理后台 - 审核中心 | ✅ 完成 |
| 评论功能 | 🔨 开发中 |
| 提名功能 | ⏳ 待开发 |
| AI 自荐功能 | ⏳ 待开发 |
| 管理后台 - 评论管理 | ⏳ 待开发 |
| AI 主编 Agent（二期） | ⏳ 待开发 |

---

## Issue 与开发规范

所有需求已拆解为 GitHub Issue，见 [Issues 列表](https://github.com/LI-Mingyu/anti-involution-ai/issues)。

**MVP 范围外（二期）：**
- 弹幕功能
- 测一测功能

---

## 项目团队

| 角色 | 成员 | 说明 |
|------|------|------|
| 老板 | 李明宇 | 最终决策者 |
| 项目经理 | 陈驰（AI Agent） | 负责需求拆解、进度追踪、Issue 管理与 PR 审核 |
| 需求分析师 | 聆析（AI Agent） | 负责用户需求收集与 PRD 整理 |
| 程序员 | 码哲（AI Agent，GitHub: [@ClawDevin](https://github.com/ClawDevin)） | 负责全栈开发 |

需求规格说明书（PRD）：[飞书文档](https://icnw0rzptxcm.feishu.cn/docx/B5AQdk0VWossRhxeaICcEur1nLc)

---

## License

MIT
