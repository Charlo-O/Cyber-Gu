import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 可用的模型列表
export const AVAILABLE_MODELS = [
  { id: 'Tongyi-MAI/Z-Image-Turbo', name: '通义·疾速', description: '快速生成，适合日常使用' },
  { id: 'stabilityai/stable-diffusion-xl', name: 'SDXL·稳定', description: '高质量写实风格' },
  { id: 'black-forest-labs/FLUX.1-schnell', name: 'FLUX·闪电', description: '极速生成，风格多变' },
];

// 默认提示词
export const DEFAULT_TRAIT_PROMPTS: Record<string, string> = {
  "烦人上司": "cyberpunk style, glitch art, angry boss face, shouting, corporate suit, distorted features, red and black chaotic background, low poly, 3d render, high contrast",
  "前任": "cyberpunk style, glitch art, silhouette of a person walking away, rain, neon lights, melancholic blue and purple atmosphere, broken heart symbol, digital noise, 3d render",
  "小人": "cyberpunk style, glitch art, sneaky villain face, malicious grin, shadowy, toxic green glowing eyes, snake like features, dark alley background, digital distortion, 3d render",
  "Bad Luck": "cyberpunk style, glitch art, broken mirror, black cat, cracked screen effect, ominous dark symbols, chaotic composition, monochrome with red warning signs, 3d render"
};

interface ConfigContextType {
  apiKey: string;
  setApiKey: (key: string) => Promise<void>;
  selectedModel: string;
  setSelectedModel: (modelId: string) => Promise<void>;
  customPrompts: Record<string, string>;
  setCustomPrompt: (traitKey: string, prompt: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoading: boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const STORAGE_KEYS = {
  API_KEY: '@cyber_gu_api_key',
  MODEL: '@cyber_gu_model',
  PROMPTS: '@cyber_gu_prompts',
};

// 默认 API Key
const DEFAULT_API_KEY = "ms-1ad6ef04-cdc3-43a5-b243-8cac6e9bb669";

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>(DEFAULT_API_KEY);
  const [selectedModel, setSelectedModelState] = useState<string>(AVAILABLE_MODELS[0].id);
  const [customPrompts, setCustomPromptsState] = useState<Record<string, string>>(DEFAULT_TRAIT_PROMPTS);
  const [isLoading, setIsLoading] = useState(true);

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [storedKey, storedModel, storedPrompts] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.API_KEY),
          AsyncStorage.getItem(STORAGE_KEYS.MODEL),
          AsyncStorage.getItem(STORAGE_KEYS.PROMPTS),
        ]);

        if (storedKey) setApiKeyState(storedKey);
        if (storedModel) setSelectedModelState(storedModel);
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

  const setApiKey = async (key: string) => {
    setApiKeyState(key);
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key);
  };

  const setSelectedModel = async (modelId: string) => {
    setSelectedModelState(modelId);
    await AsyncStorage.setItem(STORAGE_KEYS.MODEL, modelId);
  };

  const setCustomPrompt = async (traitKey: string, prompt: string) => {
    const updated = { ...customPrompts, [traitKey]: prompt };
    setCustomPromptsState(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(updated));
  };

  const resetToDefaults = async () => {
    setApiKeyState(DEFAULT_API_KEY);
    setSelectedModelState(AVAILABLE_MODELS[0].id);
    setCustomPromptsState(DEFAULT_TRAIT_PROMPTS);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.API_KEY),
      AsyncStorage.removeItem(STORAGE_KEYS.MODEL),
      AsyncStorage.removeItem(STORAGE_KEYS.PROMPTS),
    ]);
  };

  return (
    <ConfigContext.Provider
      value={{
        apiKey,
        setApiKey,
        selectedModel,
        setSelectedModel,
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
