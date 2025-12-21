import { Platform } from 'react-native';

// 默认 API Key (可被用户配置覆盖)
export const DEFAULT_API_KEY = "ms-1ad6ef04-cdc3-43a5-b243-8cac6e9bb669";

// 调试日志
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[ModelScope]', ...args);
}

// CORS 代理 - Web 端使用
const CORS_PROXY = 'https://corsproxy.io/?';

// 备用测试图片 (当 API 不可用时)
const FALLBACK_IMAGES: Record<string, string> = {
  '烦人上司': 'https://picsum.photos/seed/boss/512/512',
  '前任': 'https://picsum.photos/seed/ex/512/512',
  '小人': 'https://picsum.photos/seed/villain/512/512',
  'Bad Luck': 'https://picsum.photos/seed/badluck/512/512',
  'love': 'https://picsum.photos/seed/love/512/512',
  'demote': 'https://picsum.photos/seed/demote/512/512',
  'luck': 'https://picsum.photos/seed/luck/512/512',
};

export const TRAIT_PROMPTS: Record<string, string> = {
  "烦人上司": "cyberpunk style, glitch art, angry boss face, shouting, corporate suit, distorted features, red and black chaotic background, low poly, 3d render, high contrast",
  "前任": "cyberpunk style, glitch art, silhouette of a person walking away, rain, neon lights, melancholic blue and purple atmosphere, broken heart symbol, digital noise, 3d render",
  "小人": "cyberpunk style, glitch art, sneaky villain face, malicious grin, shadowy, toxic green glowing eyes, snake like features, dark alley background, digital distortion, 3d render",
  "Bad Luck": "cyberpunk style, glitch art, broken mirror, black cat, cracked screen effect, ominous dark symbols, chaotic composition, monochrome with red warning signs, 3d render"
};

export const RITUAL_PROMPTS: Record<string, string> = {
  "love": "cyberpunk style, romantic avatar, glowing pink and red hearts, neon love symbols, digital cupid, holographic roses, warm magenta atmosphere, soft glow, 3d render, portrait",
  "demote": "cyberpunk style, dark villain avatar, shadowy figure, toxic green eyes, sinister smile, snake patterns, dark purple and green aura, menacing, 3d render, portrait",
  "luck": "cyberpunk style, fortune avatar, golden coins, lucky clover hologram, sparkling stars, bright golden and cyan glow, prosperity symbols, radiant, 3d render, portrait"
};

const BASE_URL = 'https://api-inference.modelscope.cn/v1';

// 动态配置接口
export interface GenerationConfig {
  apiKey?: string;
  modelId?: string;
}

// 同步模式调用 - 支持动态配置
export async function generateImage(
  prompt: string, 
  inputImage?: string, 
  config?: GenerationConfig
): Promise<string> {
  const apiKey = config?.apiKey || DEFAULT_API_KEY;
  const modelId = config?.modelId || "Tongyi-MAI/Z-Image-Turbo";
  
  const requestBody: Record<string, unknown> = {
    model: modelId,
    prompt: prompt
  };

  if (inputImage) {
    requestBody.image = inputImage;
  }

  log('Starting image generation with prompt:', prompt.substring(0, 50) + '...');
  log('Has input image:', !!inputImage);
  log('Platform:', Platform.OS);

  // Web 端使用 CORS 代理
  const apiUrl = Platform.OS === 'web' 
    ? `${CORS_PROXY}${encodeURIComponent(`${BASE_URL}/images/generations`)}`
    : `${BASE_URL}/images/generations`;

  log('API URL:', apiUrl);

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
  } catch (fetchError) {
    log('Fetch error (likely CORS):', fetchError);
    // 如果 CORS 失败，使用备用图片
    const traitKey = Object.keys(TRAIT_PROMPTS).find(k => TRAIT_PROMPTS[k] === prompt) ||
                     Object.keys(RITUAL_PROMPTS).find(k => RITUAL_PROMPTS[k] === prompt);
    if (traitKey && FALLBACK_IMAGES[traitKey]) {
      log('Using fallback image for:', traitKey);
      return FALLBACK_IMAGES[traitKey];
    }
    throw new Error(`网络请求失败: ${fetchError}`);
  }

  log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    log('Error response:', errorText);
    throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  log('Response data:', JSON.stringify(data, null, 2));
  
  // 解析各种可能的返回格式
  let imageUrl: string | null = null;

  // 格式1: { data: [{ url: "..." }] }
  if (data.data && Array.isArray(data.data) && data.data.length > 0) {
    if (data.data[0].url) {
      imageUrl = data.data[0].url;
      log('Found image URL in data[0].url');
    } else if (data.data[0].b64_json) {
      imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
      log('Found image in data[0].b64_json');
    }
  }
  
  // 格式2: { output_images: ["..."] }
  if (!imageUrl && data.output_images && Array.isArray(data.output_images) && data.output_images.length > 0) {
    imageUrl = data.output_images[0];
    log('Found image in output_images[0]');
  }

  // 格式3: { images: [{ url: "..." }] } 或 { images: ["..."] }
  if (!imageUrl && data.images && Array.isArray(data.images) && data.images.length > 0) {
    if (typeof data.images[0] === 'string') {
      imageUrl = data.images[0];
    } else if (data.images[0].url) {
      imageUrl = data.images[0].url;
    }
    log('Found image in images array');
  }

  // 格式4: { output: { images: [...] } }
  if (!imageUrl && data.output && data.output.images && Array.isArray(data.output.images)) {
    imageUrl = data.output.images[0];
    log('Found image in output.images');
  }

  // 格式5: { result: { images: [...] } }
  if (!imageUrl && data.result && data.result.images && Array.isArray(data.result.images)) {
    imageUrl = data.result.images[0];
    log('Found image in result.images');
  }

  // 格式6: 直接返回 URL 字符串
  if (!imageUrl && typeof data === 'string' && data.startsWith('http')) {
    imageUrl = data;
    log('Response is direct URL string');
  }

  if (imageUrl) {
    log('Final image URL:', imageUrl.substring(0, 100) + '...');
    return imageUrl;
  }

  log('Could not parse image from response');
  throw new Error(`未找到生成的图片。API返回: ${JSON.stringify(data).substring(0, 200)}`);
}

// 备用：异步模式 (仅用于原生 App，不用于 Web)
export async function generateImageAsync(prompt: string, inputImage?: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Web 端使用同步模式避免 CORS
    return generateImage(prompt, inputImage);
  }

  const requestBody: Record<string, unknown> = {
    model: "Tongyi-MAI/Z-Image-Turbo",
    prompt: prompt
  };

  if (inputImage) {
    requestBody.image = inputImage;
  }

  // 原生端可以使用异步模式
  const startResponse = await fetch(`${BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEFAULT_API_KEY}`,
      'Content-Type': 'application/json',
      'X-ModelScope-Async-Mode': 'true'
    },
    body: JSON.stringify(requestBody)
  });

  if (!startResponse.ok) {
    throw new Error(`Start task failed: ${startResponse.statusText}`);
  }

  const startData = await startResponse.json();
  const taskId = startData.task_id;

  // Poll Status
  let retries = 0;
  const maxRetries = 60; // 最多等待 60 秒
  
  while (retries < maxRetries) {
    const statusResponse = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DEFAULT_API_KEY}`,
        'X-ModelScope-Task-Type': 'image_generation'
      }
    });

    if (!statusResponse.ok) {
      throw new Error(`Check status failed: ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();

    if (statusData.task_status === 'SUCCEED') {
      if (statusData.output_images && statusData.output_images.length > 0) {
        return statusData.output_images[0];
      } else {
        throw new Error('Task succeeded but no image output found');
      }
    } else if (statusData.task_status === 'FAILED') {
      throw new Error('Image generation task failed');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    retries++;
  }

  throw new Error('图片生成超时');
}
