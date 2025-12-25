import { Platform } from 'react-native';
import { ModelConfig } from '../context/ConfigContext';

// 调试日志
const DEBUG = true;
function log(...args: unknown[]) {
  if (DEBUG) console.log('[VideoGeneration]', ...args);
}

// CORS 代理 - Web 端使用
const CORS_PROXY = 'https://corsproxy.io/?';

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = (baseUrl || '').trim();
  if (!trimmed) return '';
  return trimmed.replace('api.qingyuntop.cn', 'api.qingyuntop.top');
}

function isApimartBaseUrl(baseUrl: string): boolean {
  return normalizeBaseUrl(baseUrl).includes('api.apimart.ai');
}

function normalizeSoraDurationSeconds(model: string, duration: number | undefined): number | undefined {
  if (!model.startsWith('sora')) return duration;
  const isPro = model.includes('pro');
  const d = typeof duration === 'number' && Number.isFinite(duration) ? duration : undefined;
  if (isPro) {
    if (!d || d <= 15) return 15;
    return 25;
  }
  if (!d || d <= 10) return 10;
  return 15;
}

function extractApimartTaskId(data: any): string | undefined {
  const taskId = data?.data?.[0]?.task_id;
  return typeof taskId === 'string' && taskId ? taskId : undefined;
}

function extractApimartVideoUrl(taskData: any): string | undefined {
  const videos = taskData?.result?.videos;
  if (!Array.isArray(videos) || videos.length === 0) return undefined;
  const first = videos[0];
  if (typeof first === 'string') return first;
  const url = first?.url || first?.video_url;
  if (Array.isArray(url)) {
    const firstUrl = url[0];
    return typeof firstUrl === 'string' && firstUrl ? firstUrl : undefined;
  }
  return typeof url === 'string' && url ? url : undefined;
}

function joinApiUrl(baseUrl: string, path: string): string {
  const base = normalizeBaseUrl(baseUrl).replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/v1') && p.startsWith('/v1/')) {
    return `${base}${p.slice('/v1'.length)}`;
  }
  return `${base}${p}`;
}

function proxyUrl(url: string): string {
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

async function fetchWithProxyFallback(url: string, init: any): Promise<any> {
  if (Platform.OS !== 'web') {
    return fetch(url, init);
  }

  if (url.includes('api.apimart.ai')) {
    return fetch(proxyUrl(url), init);
  }

  try {
    return await fetch(url, init);
  } catch (e) {
    log('Direct fetch failed on web, retrying with CORS proxy:', e);
    return fetch(proxyUrl(url), init);
  }
}

// 视频生成任务状态
export interface VideoTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  progress?: number;
  estimatedTime?: number;
}

// 图生视频参数
export interface ImageToVideoParams {
  prompt: string;
  imageUrl: string;
  config: ModelConfig;
  duration?: number; // 视频时长，默认5秒
}

export interface TextToVideoParams {
  prompt: string;
  config: ModelConfig;
  duration?: number;
  aspectRatio?: '16:9' | '9:16';
  private?: boolean;
}

export async function createTextToVideoTask(params: TextToVideoParams): Promise<string> {
  const { prompt, config, duration, aspectRatio = '9:16', private: isPrivate = true } = params;

  if (!config.apiKey) {
    throw new Error('请先在魔法书系统中配置视频模型的 API Key');
  }

  if (!config.baseUrl) {
    throw new Error('视频API地址未配置，请在魔法书系统中设置');
  }

  const model = (config.model || '').trim();
  if (!model) {
    throw new Error('视频模型未配置，请在魔法书系统中设置模型名称');
  }

  if (!prompt) {
    throw new Error('提示词不能为空');
  }

  const apimart = isApimartBaseUrl(config.baseUrl);
  if (!apimart) {
    throw new Error('当前视频服务不支持文本转视频，请切换到 Apimart (https://api.apimart.ai)');
  }

  const apiUrl = joinApiUrl(config.baseUrl, '/v1/videos/generations');
  const soraDuration = normalizeSoraDurationSeconds(model, duration);

  const requestBody = {
    model,
    prompt,
    duration: soraDuration,
    aspect_ratio: aspectRatio,
    private: isPrivate,
  };

  const response = await fetchWithProxyFallback(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`视频生成服务返回错误 (${response.status}): ${errorText.substring(0, 300)}`);
  }

  const data = await response.json();
  const taskId = extractApimartTaskId(data);
  if (!taskId) {
    throw new Error('未能获取视频生成任务ID');
  }

  return taskId;
}

// 创建图生视频任务 (统一视频格式)
export async function createImageToVideoTask(params: ImageToVideoParams): Promise<string> {
  const { prompt, imageUrl, config, duration = 5 } = params;
  
  if (!config.apiKey) {
    throw new Error('请先在魔法书系统中配置视频模型的 API Key');
  }

  if (!config.baseUrl) {
    throw new Error('视频API地址未配置，请在魔法书系统中设置');
  }

  log('Creating image-to-video task with prompt:', prompt.substring(0, 50) + '...');
  log('Image URL:', imageUrl.substring(0, 100) + '...');
  log('Model:', config.model);

  const model = (config.model || '').trim();
  if (!model) {
    throw new Error('视频模型未配置，请在魔法书系统中设置模型名称');
  }

  const normalizedImageUrl = (imageUrl || '').trim();
  const apimart = isApimartBaseUrl(config.baseUrl);
  if (apimart) {
    if (!/^https?:\/\//i.test(normalizedImageUrl) && !/^data:image\//i.test(normalizedImageUrl)) {
      throw new Error('图生视频需要公网图片链接（http/https）或base64 Data URI图片');
    }
  } else if (!/^https?:\/\//i.test(normalizedImageUrl)) {
    throw new Error('图生视频需要公网图片链接（http/https）。请先生成并保存替身图片后再做法。');
  }

  const isSora = model.startsWith('sora');

  const apiUrl = apimart
    ? joinApiUrl(config.baseUrl, '/v1/videos/generations')
    : joinApiUrl(config.baseUrl, '/v1/video/create');

  const soraDuration = normalizeSoraDurationSeconds(model, duration);

  const requestBody = apimart
    ? {
        model,
        prompt,
        duration: soraDuration,
        aspect_ratio: '9:16',
        private: true,
        image_urls: [normalizedImageUrl],
      }
    : isSora
      ? {
          images: [normalizedImageUrl],
          model,
          orientation: 'portrait',
          prompt,
          size: 'small',
          duration: soraDuration,
          watermark: false,
          private: true,
        }
      : {
          enable_upsample: true,
          enhance_prompt: true,
          images: [normalizedImageUrl],
          model,
          prompt,
          aspect_ratio: '9:16',
        };

  log('API URL:', apiUrl);

  let response;
  try {
    response = await fetchWithProxyFallback(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    log('Network error:', error);
    if (error instanceof TypeError) {
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        throw new Error('无法连接到视频生成服务，请检查：\n1. 网络连接是否正常\n2. API地址是否正确\n3. 服务是否可用');
      }
    }
    throw new Error(`网络请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  if (!response.ok) {
    let errorMessage = `视频生成服务返回错误 (${response.status})`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          errorData?.error ||
          errorMessage;
      } else {
        const errorText = await response.text();
        // 检查是否是HTML错误页面（如Cloudflare错误）
        if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
          if (errorText.includes('Origin DNS error') || errorText.includes('Cloudflare')) {
            throw new Error('视频生成服务暂时不可用（DNS解析失败）\n请稍后重试或更换API服务商');
          }
          throw new Error('视频生成服务暂时不可用\n请稍后重试或联系服务提供商');
        }
        errorMessage = errorText.substring(0, 200) || errorMessage;
      }
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message.includes('视频生成服务')) {
        throw parseError;
      }
      log('Error parsing response:', parseError);
    }
    log('Error response:', errorMessage);
    throw new Error(errorMessage);
  }

  const data = await response.json();
  log('Task created:', JSON.stringify(data, null, 2));

  // 返回任务ID
  const taskId = apimart
    ? extractApimartTaskId(data)
    : (data.id || data.task_id || data.data?.id || data.data?.task_id);
  if (!taskId) {
    throw new Error('未能获取视频生成任务ID');
  }

  return taskId;
}

// 查询视频生成任务状态
export async function queryVideoTask(taskId: string, config: ModelConfig): Promise<VideoTask> {
  if (!config.apiKey) {
    throw new Error('请先配置视频模型的 API Key');
  }

  log('Querying video task:', taskId);

  const apimart = isApimartBaseUrl(config.baseUrl);
  const apimartNoCache = apimart ? `&_t=${Date.now()}` : '';
  const apiUrl = apimart
    ? `${joinApiUrl(config.baseUrl, `/v1/tasks/${encodeURIComponent(taskId)}`)}?language=zh${apimartNoCache}`
    : `${joinApiUrl(config.baseUrl, '/v1/video/query')}?id=${encodeURIComponent(taskId)}`;

  const response = await fetchWithProxyFallback(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(apimart
        ? {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        : null),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    log('Error response:', errorText);
    throw new Error(`查询任务失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  log('Task status:', JSON.stringify(data, null, 2));

  const apimartPayload = apimart && data && typeof data === 'object' && 'data' in data ? (data as any).data : data;

  // 解析任务状态
  const status = apimart
    ? (apimartPayload?.status || 'pending')
    : (
        data.status ||
        data.detail?.status ||
        data.detail?.pending_info?.status ||
        data.task_status ||
        data.state ||
        'pending'
      );
  const normalizedStatus = normalizeStatus(status);

  const result: VideoTask = {
    taskId,
    status: normalizedStatus,
  };

  if (apimart) {
    const p = apimartPayload?.progress;
    result.progress = typeof p === 'number' ? p : undefined;
    const eta = apimartPayload?.estimated_time;
    result.estimatedTime = typeof eta === 'number' ? eta : undefined;
  }

  // 如果完成，获取视频URL
  if (normalizedStatus === 'completed') {
    result.videoUrl = apimart
      ? extractApimartVideoUrl(apimartPayload)
      : (
          data.video_url ||
          data.detail?.url ||
          data.detail?.video_url ||
          data.output?.video_url ||
          data.data?.video_url ||
          data.result?.video_url ||
          (data.videos && data.videos[0]?.url)
        );
  }

  // 如果失败，获取错误信息
  if (normalizedStatus === 'failed') {
    result.error = apimart
      ? (apimartPayload?.error?.message || apimartPayload?.error?.type || apimartPayload?.message || '视频生成失败')
      : (data.error || data.message || data.detail?.failure_reason || '视频生成失败');
  }

  return result;
}

// 标准化状态
function normalizeStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'completed' || lowerStatus === 'succeed' || lowerStatus === 'success') {
    return 'completed';
  }
  if (lowerStatus === 'failed' || lowerStatus === 'error') {
    return 'failed';
  }
  if (lowerStatus === 'cancelled' || lowerStatus === 'canceled') {
    return 'failed';
  }
  if (lowerStatus === 'queued' || lowerStatus === 'queueing') {
    return 'pending';
  }
  if (lowerStatus === 'processing' || lowerStatus === 'running') {
    return 'processing';
  }
  return 'pending';
}

// 等待视频生成完成 (轮询)
export async function waitForVideoCompletion(
  taskId: string, 
  config: ModelConfig,
  onProgress?: (status: string) => void,
  maxWaitMs: number = 900000 // 最长等待15分钟
): Promise<string> {
  const startTime = Date.now();
  const pollInterval = 3000; // 每3秒查询一次

  let effectiveMaxWaitMs = maxWaitMs;
  let adjusted = false;
  let transientErrorCount = 0;

  while (Date.now() - startTime < effectiveMaxWaitMs) {
    let task: VideoTask;
    try {
      task = await queryVideoTask(taskId, config);
      transientErrorCount = 0;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isTransient =
        msg.includes('524') ||
        msg.includes('Failed to fetch') ||
        msg.includes('Network request failed') ||
        msg.includes('net::ERR_FAILED') ||
        msg.includes('CORS');

      if (!isTransient) {
        throw e;
      }

      transientErrorCount += 1;
      log('Transient error when polling task, will retry:', msg);

      if (transientErrorCount >= 25) {
        throw new Error('查询任务多次失败，请检查网络或稍后重试');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      continue;
    }

    if (!adjusted && typeof task.estimatedTime === 'number') {
      const suggested = (task.estimatedTime + 120) * 1000;
      if (suggested > effectiveMaxWaitMs) {
        effectiveMaxWaitMs = suggested;
      }
      adjusted = true;
    }
    
    if (onProgress) {
      onProgress(task.status);
    }

    if (task.status === 'completed' && task.videoUrl) {
      log('Video generation completed:', task.videoUrl);
      return task.videoUrl;
    }

    if (task.status === 'failed') {
      throw new Error(task.error || '视频生成失败');
    }

    // 等待后继续轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('视频生成超时');
}

// 一站式图生视频
export async function generateVideoFromImage(
  prompt: string,
  imageUrl: string,
  config: ModelConfig,
  onProgress?: (status: string) => void
): Promise<string> {
  // 验证输入
  if (!imageUrl) {
    throw new Error('请先上传图片');
  }

  if (!prompt) {
    throw new Error('提示词不能为空');
  }

  try {
    // 显示初始状态
    onProgress?.('正在准备...');

    // 创建任务
    onProgress?.('正在创建视频生成任务...');
    const taskId = await createImageToVideoTask({
      prompt,
      imageUrl,
      config,
    });

    // 等待完成
    onProgress?.('正在生成视频...');
    return await waitForVideoCompletion(taskId, config, (status) => {
      // 转换状态为用户友好的消息
      const statusMessages: Record<string, string> = {
        'pending': '排队等待中...',
        'processing': '正在生成视频...',
        'completed': '视频生成完成！',
        'failed': '视频生成失败'
      };
      onProgress?.(statusMessages[status] || status);
    });
  } catch (error) {
    onProgress?.('生成失败');
    
    // 提供更友好的错误信息
    const errorMessage = error instanceof Error ? error.message : '视频生成失败';
    
    // 根据错误类型提供更具体的建议
    if (errorMessage.includes('API Key')) {
      throw new Error('API Key 无效或未配置\n请在魔法书系统中检查配置');
    } else if (errorMessage.includes('DNS') || errorMessage.includes('不可用') || errorMessage.includes('无法连接')) {
      throw new Error(errorMessage);
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      throw new Error('API Key 无效或已过期\n请在魔法书系统中更新配置');
    } else if (errorMessage.includes('429')) {
      throw new Error('请求过于频繁\n请稍后再试');
    } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
      throw new Error('视频生成服务暂时不可用\n请稍后重试');
    } else {
      throw new Error(`视频生成失败: ${errorMessage}`);
    }
  }
}

// 一站式文生视频（Apimart/Sora2）
export async function generateVideoFromText(
  prompt: string,
  config: ModelConfig,
  onProgress?: (status: string) => void,
  options?: {
    duration?: number;
    aspectRatio?: '16:9' | '9:16';
    private?: boolean;
    maxWaitMs?: number;
  }
): Promise<string> {
  if (!prompt) {
    throw new Error('提示词不能为空');
  }

  onProgress?.('正在创建视频生成任务...');
  const taskId = await createTextToVideoTask({
    prompt,
    config,
    duration: options?.duration,
    aspectRatio: options?.aspectRatio,
    private: options?.private,
  });

  onProgress?.('正在生成视频...');
  return waitForVideoCompletion(
    taskId,
    config,
    (status) => {
      const statusMessages: Record<string, string> = {
        pending: '排队等待中...',
        processing: '正在生成视频...',
        completed: '视频生成完成！',
        failed: '视频生成失败',
      };
      onProgress?.(statusMessages[status] || status);
    },
    options?.maxWaitMs
  );
}
