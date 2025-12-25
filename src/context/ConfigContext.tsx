import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 模型配置类型
export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

// 默认绘画模型配置 (使用现有的 ModelScope)
export const DEFAULT_PAINTING_CONFIG: ModelConfig = {
  baseUrl: 'https://api-inference.modelscope.cn/v1',
  apiKey: 'ms-1ad6ef04-cdc3-43a5-b243-8cac6e9bb669',
  model: 'Tongyi-MAI/Z-Image-Turbo',
};

// 默认视频模型配置 (青云API - sora-2)
export const DEFAULT_VIDEO_CONFIG: ModelConfig = {
  baseUrl: 'https://api.qingyuntop.top',
  apiKey: '', // 请在魔法书系统中配置您的 API Key
  model: 'sora-2',
};

// 默认文本模型配置 (OpenAI兼容)
export const DEFAULT_TEXT_CONFIG: ModelConfig = {
  baseUrl: 'https://api.qingyuntop.cn/v1',
  apiKey: '',
  model: 'gpt-4o',
};

// 默认提示词
export const DEFAULT_TRAIT_PROMPTS: Record<string, string> = {
  "烦人上司": "cyberpunk style, glitch art, angry boss face, shouting, corporate suit, distorted features, red and black chaotic background, low poly, 3d render, high contrast",
  "前任": "cyberpunk style, glitch art, silhouette of a person walking away, rain, neon lights, melancholic blue and purple atmosphere, broken heart symbol, digital noise, 3d render",
  "小人": "cyberpunk style, glitch art, sneaky villain face, malicious grin, shadowy, toxic green glowing eyes, snake like features, dark alley background, digital distortion, 3d render",
  "Bad Luck": "cyberpunk style, glitch art, broken mirror, black cat, cracked screen effect, ominous dark symbols, chaotic composition, monochrome with red warning signs, 3d render"
};

// 降智蛊视频提示词
export const DEMOTE_VIDEO_PROMPTS: Record<string, string> = {
  "胡言乱语": "The character in the image starts speaking nonsensically, making exaggerated facial expressions, glitch effects, digital distortion, chaotic energy",
  "悖论": "The character in the image becomes confused, scratching head, question marks appearing around, paradox visual effects, mind-bending distortion",
  "讽刺": "The character in the image shows sarcastic expression, rolling eyes, slow clap motion, cynical atmosphere, dramatic lighting",
};

interface ConfigContextType {
  // 绘画模型配置
  paintingConfig: ModelConfig;
  setPaintingConfig: (config: ModelConfig) => Promise<void>;
  // 视频模型配置
  videoConfig: ModelConfig;
  setVideoConfig: (config: ModelConfig) => Promise<void>;
  // 文本模型配置
  textConfig: ModelConfig;
  setTextConfig: (config: ModelConfig) => Promise<void>;
  // 自定义提示词
  customPrompts: Record<string, string>;
  setCustomPrompt: (traitKey: string, prompt: string) => Promise<void>;
  // 重置
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PAINTING_CONFIG: '@cyber_gu_painting_config',
  VIDEO_CONFIG: '@cyber_gu_video_config',
  TEXT_CONFIG: '@cyber_gu_text_config',
  PROMPTS: '@cyber_gu_prompts',
};

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [paintingConfig, setPaintingConfigState] = useState<ModelConfig>(DEFAULT_PAINTING_CONFIG);
  const [videoConfig, setVideoConfigState] = useState<ModelConfig>(DEFAULT_VIDEO_CONFIG);
  const [textConfig, setTextConfigState] = useState<ModelConfig>(DEFAULT_TEXT_CONFIG);
  const [customPrompts, setCustomPromptsState] = useState<Record<string, string>>(DEFAULT_TRAIT_PROMPTS);
  const [isLoading, setIsLoading] = useState(true);

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [storedPainting, storedVideo, storedText, storedPrompts] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PAINTING_CONFIG),
          AsyncStorage.getItem(STORAGE_KEYS.VIDEO_CONFIG),
          AsyncStorage.getItem(STORAGE_KEYS.TEXT_CONFIG),
          AsyncStorage.getItem(STORAGE_KEYS.PROMPTS),
        ]);

        if (storedPainting) {
          setPaintingConfigState({ ...DEFAULT_PAINTING_CONFIG, ...JSON.parse(storedPainting) });
        }
        if (storedVideo) {
          setVideoConfigState({ ...DEFAULT_VIDEO_CONFIG, ...JSON.parse(storedVideo) });
        }
        if (storedText) {
          setTextConfigState({ ...DEFAULT_TEXT_CONFIG, ...JSON.parse(storedText) });
        }
        if (storedPrompts) {
          const parsed = JSON.parse(storedPrompts);
          setCustomPromptsState({ ...DEFAULT_TRAIT_PROMPTS, ...parsed });
        }
      } catch (error) {
        console.error('[ConfigContext] Failed to load config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const setPaintingConfig = async (config: ModelConfig) => {
    setPaintingConfigState(config);
    await AsyncStorage.setItem(STORAGE_KEYS.PAINTING_CONFIG, JSON.stringify(config));
  };

  const setVideoConfig = async (config: ModelConfig) => {
    setVideoConfigState(config);
    await AsyncStorage.setItem(STORAGE_KEYS.VIDEO_CONFIG, JSON.stringify(config));
  };

  const setTextConfig = async (config: ModelConfig) => {
    setTextConfigState(config);
    await AsyncStorage.setItem(STORAGE_KEYS.TEXT_CONFIG, JSON.stringify(config));
  };

  const setCustomPrompt = async (traitKey: string, prompt: string) => {
    const updated = { ...customPrompts, [traitKey]: prompt };
    setCustomPromptsState(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updated));
  };

  const resetToDefaults = async () => {
    setPaintingConfigState(DEFAULT_PAINTING_CONFIG);
    setVideoConfigState(DEFAULT_VIDEO_CONFIG);
    setTextConfigState(DEFAULT_TEXT_CONFIG);
    setCustomPromptsState(DEFAULT_TRAIT_PROMPTS);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.PAINTING_CONFIG),
      AsyncStorage.removeItem(STORAGE_KEYS.VIDEO_CONFIG),
      AsyncStorage.removeItem(STORAGE_KEYS.TEXT_CONFIG),
      AsyncStorage.removeItem(STORAGE_KEYS.PROMPTS),
    ]);
  };

  return (
    <ConfigContext.Provider
      value={{
        paintingConfig,
        setPaintingConfig,
        videoConfig,
        setVideoConfig,
        textConfig,
        setTextConfig,
        customPrompts,
        setCustomPrompt,
        resetToDefaults,
        isLoading,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
