# TodoList 任务管理应用

> 一个功能完整、界面美观的现代化待办事项管理系统

## 🚀 项目介绍

这是一个基于 **Next.js 15 + TypeScript + Supabase** 开发的全栈待办事项管理应用。应用采用现代化的三列布局设计，集成了任务管理、数据统计、导入导出等完整功能，支持深色模式，具有专业级的用户体验。

**📚 GitHub仓库：** [源代码](https://github.com/Aijuan-hhh/my-todo-app)

## ✨ 功能特性

### 📋 核心功能（必做功能 ）
- [x] **任务管理**
  - ✅ 添加新的待办任务（标题+描述+优先级）
  - ✅ 编辑和删除任务
  - ✅ 标记任务完成/未完成状态
  - ✅ 任务列表展示（显示所有任务）
  - ✅ 任务按创建时间排序

- [x] **基础要求**
  - ✅ 响应式设计（移动端友好）
  - ✅ 合理的错误处理
  - ✅ 加载状态提示
  - ✅ 空状态处理

### 🎯 加分功能
- [x] **深色模式**
  - ✅ 明暗主题切换
  - ✅ 跟随系统设置
  - ✅ 保存用户偏好

- [x] **数据导入导出** 
  - ✅ 支持从CSV文件导入任务
  - ✅ 导出任务列表为CSV格式
  - ✅ 文件格式验证和错误提示
  - ✅ 导入预览功能

- [x] **数据统计看板** 
  - ✅ 任务完成率统计
  - ✅ 分类任务分布图表（使用Recharts）
  - ✅ 本周/本月任务趋势
  - ✅ 优先级分布统计
  - ✅ 最近7天趋势分析

## 🛠️ 技术栈

### 前端技术
- **框架：** Next.js 15 (App Router)
- **语言：** TypeScript
- **样式：** Tailwind CSS
- **图表：** Recharts
- **CSV处理：** Papaparse

### 后端服务
- **数据库：** Supabase (PostgreSQL)
- **认证：** Supabase Auth
- **部署：** Vercel

### 开发工具
- **代码编辑器：** Cursor / VS Code
- **版本控制：** Git & GitHub
- **包管理器：** npm

## 📦 安装和运行

### 环境要求
- Node.js 18.x 或更高版本
- npm 或 yarn

### 1. 克隆项目
```bash
git clone https://github.com//Aijuan-hhh//my-todo-app.git
cd my-todo-app
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境变量配置
在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_项目_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_Supabase_公钥
```

**获取 Supabase 凭据：**
1. 访问 [Supabase](https://supabase.com/)
2. 创建新项目或使用现有项目
3. 进入 Settings → API
4. 复制 `Project URL` 和 `anon public` key

### 4. 数据库设置
在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 创建任务表
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 关闭行级安全策略（开发环境）
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🎨 界面设计

### 布局结构
- **左侧（350px）：** 添加任务表单 + 数据管理
- **中间（弹性）：** 任务列表展示和管理
- **右侧（400px）：** 数据统计看板

### 设计特点
- 🎨 现代化三列布局
- 🌓 深色/浅色主题切换
- 📱 响应式设计
- ✨ 流畅的用户体验
- 📊 丰富的数据可视化

## 📊 功能展示

### 任务管理
- 直观的任务创建和编辑界面
- 优先级标签（高/中/低）
- 完成状态切换
- 实时数据更新

### 数据统计
- 完成率饼图
- 优先级分布柱状图
- 7天趋势折线图
- 关键指标卡片

### 数据管理
- CSV 导入导出
- 数据格式验证
- 导入预览功能
- 批量数据处理

## 🚀 部署指南

### Vercel 部署
1. 将代码推送到 GitHub
2. 访问 [Vercel](https://vercel.com/)
3. 使用 GitHub 账户登录
4. 导入 GitHub 仓库
5. 配置环境变量
6. 点击部署

### 环境变量配置
在 Vercel 项目设置中添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📁 项目结构

```
my-todo-app/
├── app/                   # Next.js App Router
│   ├── globals.css       # 全局样式和深色模式变量
│   ├── layout.tsx        # 根布局组件
│   └── page.tsx          # 主页面（三列布局）
├── components/           # React 组件
│   ├── ImportExport.tsx  # 数据导入导出组件
│   ├── Statistics.tsx    # 数据统计看板组件
│   └── ThemeToggle.tsx   # 主题切换组件
├── lib/                  # 工具库
│   └── supabase.ts       # Supabase 客户端配置
├── public/               # 静态资源
├── .env.local           # 环境变量（需要创建）
├── package.json         # 项目依赖
├── tailwind.config.js   # Tailwind CSS 配置
├── tsconfig.json        # TypeScript 配置
└── README.md           # 项目文档
```

## 🔧 开发说明

### 主要组件说明
- **`app/page.tsx`**: 主页面，包含三列布局和核心逻辑
- **`components/ImportExport.tsx`**: 处理CSV导入导出功能
- **`components/Statistics.tsx`**: 数据统计和图表展示
- **`components/ThemeToggle.tsx`**: 深色模式切换功能
- **`lib/supabase.ts`**: 数据库连接和类型定义

### 技术亮点
- **三列布局**: 使用CSS Grid实现专业级布局
- **深色模式**: CSS变量实现主题切换
- **数据可视化**: Recharts库实现图表展示
- **文件处理**: Papaparse库处理CSV导入导出
- **类型安全**: 全面的TypeScript类型定义

## 👨‍💻 作者

**你的姓名**
- GitHub: [Aijuan-hhh](https://github.com/Aijuan-hhh)
- Email: 2797692017@qq.com

