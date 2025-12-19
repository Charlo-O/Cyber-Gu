# 赛博蛊：数字仪式 (React Native)

跨平台移动应用版本，基于原 Web 版本迁移。

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
│   ├── types/
│   │   └── index.ts        # TypeScript 类型定义
│   ├── utils/
│   │   ├── modelScope.ts   # AI 图片生成 API
│   │   └── storage.ts      # AsyncStorage 封装
│   ├── components/
│   │   └── Icon.tsx        # 图标组件
│   └── screens/
│       ├── ContractScreen.tsx      # 契约签订页
│       ├── MainAltarScreen.tsx     # 主祭坛页
│       ├── RitualScreen.tsx        # 施法仪式页
│       ├── EffigyScreen.tsx        # 立替身页
│       ├── RitualDemoteScreen.tsx  # 降智蛊仪式
│       ├── RitualLoveScreen.tsx    # 恋爱病毒仪式
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

项目使用 ModelScope API 进行 AI 图片生成。API Key 已配置在 `src/utils/modelScope.ts` 中。

## 构建发布

```bash
# 构建 Android APK
npx expo build:android

# 构建 iOS IPA
npx expo build:ios

# 或使用 EAS Build
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
