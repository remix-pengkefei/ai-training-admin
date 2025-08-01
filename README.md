# AI Training Admin - 管理后台

奇富先知AI培训活动管理后台系统。

## 功能特点

- 活动管理（创建、编辑、删除）
- 报名信息查看
- 调研问题配置
- 图片上传
- 登录认证

## 技术栈

- React 18 + TypeScript
- Tailwind CSS
- React Router v6
- Create React App

## 安装运行

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm start
```

### 生产构建
```bash
npm run build
```

### 部署
```bash
serve -s build -l 3002
```

## 登录信息

- 用户名: admin
- 密码: qifukeji

## API配置

开发环境使用 `package.json` 中的 proxy 配置。
生产环境会自动切换到 `http://localhost:3001/api`。

## 相关项目

- 主项目: [ai-training-web](https://github.com/remix-pengkefei/ai-training-web)
