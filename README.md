# CopyLinks - Nextcloud 批量复制链接应用

## 功能描述

这是一个 Nextcloud 应用，允许用户在文件应用中选择多个文件后，顶部会显示一个"复制链接"按钮，点击按钮会弹出选中文件的信息。

## 主要特性

- 🔗 批量选择文件
- 📋 一键复制链接功能
- 🎯 集成到文件应用界面
- 🌐 支持中文界面
- ⚡ 基于 Vue 3 和 @nextcloud/files 组件

## 安装和开发

### 安装依赖

```bash
npm install
```

### 开发构建

```bash
npm run dev
```

### 监听模式（推荐开发时使用）

```bash
npm run watch
```

### 生产构建

```bash
npm run build
```

## 功能说明

1. **文件选择**: 在 Nextcloud 文件应用中，使用 Ctrl/Cmd + 点击选择多个文件
2. **按钮显示**: 选择多个文件后，顶部会出现"复制链接"按钮
3. **点击操作**: 点击按钮会弹出 alert 窗口，显示选中的文件信息
4. **右键菜单**: 还会在文件右键菜单中添加"复制链接"选项

## 技术架构

- **前端**: Vue 3 + @nextcloud/files + @nextcloud/dialogs
- **后端**: PHP (Nextcloud App Framework)
- **构建工具**: Webpack + @nextcloud/webpack-vue-config

## 文件结构

```
copylinks/
├── appinfo/           # 应用信息和配置
├── lib/              # PHP 后端代码
├── src/              # Vue 前端代码
├── templates/        # PHP 模板
├── package.json      # Node.js 依赖
└── webpack.config.js # 构建配置
```

## 使用方法

1. 将应用安装到 Nextcloud 的 `apps` 目录
2. 在 Nextcloud 管理界面启用 "Copy Links" 应用
3. 进入文件应用，选择多个文件
4. 点击顶部出现的"复制链接"按钮
5. 查看弹出的文件信息

## 开发说明

这个应用演示了如何：
- 使用 @nextcloud/files 组件注册文件操作
- 监听文件选择变化事件
- 在文件应用界面中添加自定义按钮
- 使用 Nextcloud 的 UI 组件库 