# 赛博蛊：数字仪式 (React Native)

跨平台移动应用版本，基于原 Web 版本迁移。

## 功能概览

- **立替身**：上传图片 + AI 生成替身图像
- **施法仪式**：桃花 / 好运 / 小人（降智蛊）
- **降智蛊视频生成**：支持图生视频（Sora 系列），并对 Web 端 CORS 做了兼容处理

## 技术栈

- **框架**: React Native + Expo
- **导航**: React Navigation (Native Stack)
- **状态存储**: AsyncStorage
- **图片选择**: expo-image-picker
- **图标**: @expo/vector-icons (MaterialIcons)
- **渐变**: expo-linear-gradient

## 项目结构

```
cyber-gu-rn/
├── App.tsx                 # 入口 + 导航配置
├── src/
│   ├── constants/
│   │   └── theme.ts        # 主题色彩常量
│   ├── context/
│   │   └── ConfigContext.tsx # 魔法书系统配置（绘画/视频/文本）
│   ├── types/
│   │   └── index.ts        # TypeScript 类型定义
│   ├── utils/
│   │   ├── modelScope.ts   # AI 图片生成 API
│   │   ├── videoGeneration.ts # 视频生成（任务创建/轮询/Apimart 兼容）
│   │   └── storage.ts      # AsyncStorage 封装
│   ├── components/
│   │   └── Icon.tsx        # 图标组件
│   └── screens/
│       ├── ContractScreen.tsx      # 契约签订页
│       ├── MainAltarScreen.tsx     # 主祭坛页
│       ├── RitualScreen.tsx        # 施法仪式页
│       ├── EffigyScreen.tsx        # 立替身页
│       ├── GrimoireScreen.tsx       # 魔法书系统（配置与咒语编辑器）
│       ├── RitualDemoteScreen.tsx  # 降智蛊仪式
│       ├── RitualLoveScreen.tsx    桃花劫仪式
│       ├── RitualServerScreen.tsx  # 驱除坏运仪式
│       └── KarmaScreen.tsx         # 业力账本页
```

## 运行项目

### 前置条件

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (macOS)
- Android: Android Studio + 模拟器

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
# 启动 Expo 开发服务器
npx expo start

# 或直接启动特定平台
npm run android   # Android
npm run ios       # iOS (需要 macOS)
npm run web       # Web
```

### 在真机上运行

1. 安装 Expo Go 应用 (iOS App Store / Google Play)
2. 扫描终端中显示的二维码
3. 应用将在手机上加载

## 页面路由

| 路由名称 | 页面 | 说明 |
|---------|------|------|
| `Contract` | ContractScreen | 入口页，签订契约 |
| `Altar` | MainAltarScreen | 主祭坛，中心页面 |
| `Ritual` | RitualScreen | 施法仪式选择 |
| `Effigy` | EffigyScreen | 立替身，上传图片生成 AI 替身 |
| `RitualDemote` | RitualDemoteScreen | 降智蛊仪式 |
| `RitualLove` | RitualLoveScreen | 恋爱病毒仪式 |
| `RitualServer` | RitualServerScreen | 驱除坏运仪式 |
| `Karma` | KarmaScreen | 业力账本 |

## API 配置

项目通过 **魔法书系统（Grimoire）** 统一配置绘画/视频/文本模型（配置会持久化到 AsyncStorage）。

- **入口**：应用内进入 `魔法书系统` 页面进行配置
- **配置存储**：`src/context/ConfigContext.tsx`

注意：仓库里可能存在默认的示例 Key/地址，仅用于开发演示；正式使用请在魔法书系统中替换为你自己的 Key。

### 视频生成（Sora-2 / Apimart）

视频生成逻辑在 `src/utils/videoGeneration.ts`。

- **图生视频**：用于“降智蛊”仪式
- **文本转视频**：当前仅在 Apimart（`https://api.apimart.ai`）模式下启用

Web 端如果遇到 CORS，会自动走 `https://corsproxy.io/?` 代理，并对任务轮询增加了 no-cache 与 cache-busting（`_t` 参数）以避免代理缓存导致状态不刷新。

### 仪式页面交互（近期变更）

- **桃花 / 好运 / 小人**：页面标题颜色与各自主题色保持一致
- **降智蛊**：改为“先选择注入的病毒（胡言乱语/悖论/讽刺）→ 再点击发送 → 才开始生成视频”

### 常见问题（Web 端）

- **一直转圈 / 闪屏**：通常是图片 `onLoad` / `onLoadEnd` 在 Web 端触发不稳定导致加载遮罩反复出现。项目已增加 `hasImageLoaded` 来避免遮罩在图片已显示后继续闪烁；若仍遇到问题，可尝试点击“重新生成”或更换网络。
- **任务状态不更新**：代理缓存可能会返回旧的任务状态；当前已对 Apimart 轮询增加 `_t` 防缓存参数与 no-cache header。

## 构建发布

```bash
# 使用 EAS Build
npx eas build --platform android
npx eas build --platform ios
```

## 从 Web 版本迁移的变更

| Web | React Native |
|-----|--------------|
| react-router-dom | @react-navigation/native |
| Tailwind CSS | StyleSheet |
| HTML 标签 | RN 原生组件 |
| localStorage | AsyncStorage |
| Material Symbols | MaterialIcons |
| FileReader | expo-image-picker |
