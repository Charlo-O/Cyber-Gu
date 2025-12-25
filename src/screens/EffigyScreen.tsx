import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { generateImage, TRAIT_PROMPTS } from '../utils/modelScope';
import { saveEffigyImage, saveEffigyTrait, getEffigyImage, getEffigyTrait } from '../utils/storage';
import { useConfig } from '../context/ConfigContext';

const { width } = Dimensions.get('window');
const TRAITS = ['烦人上司', '前任', '小人', 'Bad Luck'] as const;

// CORS 代理 - Web 端图片加载使用
const CORS_PROXY = 'https://corsproxy.io/?';
// 最大重试次数
const MAX_RETRIES = 3;

const IMAGE_HEADERS = {
  Accept: 'image/*',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
};

// 优化：更加稳健的 URL 处理
const getUniqueUrl = (url: string): string => {
  if (!url) return '';
  // 如果是 base64 数据或已经是代理URL，直接返回
  if (url.startsWith('data:') || url.includes('corsproxy.io')) {
    return url;
  }
  
  try {
    // 解析URL以正确处理参数
    const urlObj = new URL(url);
    // 移除旧的时间戳参数
    urlObj.searchParams.delete('_t');
    // 添加新的时间戳防止缓存
    urlObj.searchParams.set('_t', Date.now().toString());
    return urlObj.toString();
  } catch (e) {
    console.warn('Invalid URL format, falling back to simple timestamp:', url);
    // 如果URL解析失败，使用简单的方法添加时间戳
    const separator = url.includes('?') ? '&' : '?';
    return `${url.split('?')[0]}${separator}_t=${Date.now()}`;
  }
};

// 获取图片URI，支持CORS代理和重试逻辑
function getImageUri(url: string, retryCount: number = 0): string {
  if (!url) return '';
  
  // 如果是base64数据，直接返回
  if (url.startsWith('data:')) return url;
  
  try {
    // 如果是web平台并且是http(s) URL，使用CORS代理
    if (Platform.OS === 'web' && (url.startsWith('http://') || url.startsWith('https://'))) {
      // 如果已经是代理URL，直接返回
      if (url.includes('corsproxy.io')) {
        return url;
      }
      
      // 对URL进行编码，确保只编码一次
      const encodedUrl = encodeURIComponent(url);
      // 添加重试参数
      const retrySuffix = retryCount > 0 ? `&retry=${retryCount}` : '';
      return `${CORS_PROXY}${encodedUrl}${retrySuffix}`;
    }
    
    // 对于非web平台或非http(s) URL，直接返回原URL（添加时间戳防止缓存）
    return getUniqueUrl(url);
  } catch (e) {
    console.error('Error processing image URL:', e);
    return url; // 出错时返回原URL
  }
}

type TraitType = typeof TRAITS[number];

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Effigy'>;
};

const EffigyScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedTrait, setSelectedTrait] = useState<TraitType>('烦人上司');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [hasImageLoaded, setHasImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const insets = useSafeAreaInsets();
  const { paintingConfig, customPrompts } = useConfig();

  const generatedImageSource = useMemo(() => {
    if (!generatedImage) return null;
    const uri = getImageUri(generatedImage, retryCount);
    if (Platform.OS === 'web') {
      return { uri };
    }
    return { uri, headers: IMAGE_HEADERS };
  }, [generatedImage, retryCount]);

  const uploadedImageSource = useMemo(() => {
    if (!uploadedImage) return null;
    return { uri: uploadedImage };
  }, [uploadedImage]);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const [savedImage, savedTrait] = await Promise.all([
          getEffigyImage(),
          getEffigyTrait()
        ]);
        
        if (savedImage) {
          console.log('[EffigyScreen] Loaded image from storage');
          setGeneratedImage(getUniqueUrl(savedImage));
        }
        
        if (savedTrait && TRAITS.includes(savedTrait as TraitType)) {
          setSelectedTrait(savedTrait as TraitType);
        }
      } catch (error) {
        console.error('[EffigyScreen] Error loading saved data:', error);
      }
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    if (generatedImage) {
      setHasImageLoaded(false);
    }
  }, [generatedImage]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const base64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setUploadedImage(base64);
      setGeneratedImage(null);
      setError(null);
    }
  };

  const handleGenerateImage = async () => {
    if (isGenerating) return;
    if (!uploadedImage) {
      setError('请先上传图片');
      return;
    }

    setIsGenerating(true);
    setError(null);
    // setGeneratedImage(null); // 保持旧图片显示，避免闪烁

    try {
      // 使用自定义提示词，如果没有则使用默认
      const prompt = customPrompts[selectedTrait] || TRAIT_PROMPTS[selectedTrait];
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('[EffigyScreen] Generating...');
      
      let imageUrl = await generateImage(prompt, uploadedImage, {
        apiKey: paintingConfig.apiKey,
        modelId: paintingConfig.model,
      });
      
      // 这里的 imageUrl 可能是 http 的，确保在 app.json 中开启了 usesCleartextTraffic
      console.log('[EffigyScreen] Raw URL:', imageUrl); 

      // 添加时间戳防止缓存
      const finalUrl = getUniqueUrl(imageUrl);
      
      setGeneratedImage(finalUrl);
      
      // 异步保存，不阻塞UI显示
      saveEffigyImage(imageUrl).catch(console.error);
      saveEffigyTrait(selectedTrait).catch(console.error);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成失败，请重试';
      console.error('[EffigyScreen] Error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.accentCyan} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>立替身</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Target Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>输入目标ID //</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter Target ID"
              placeholderTextColor="rgba(224,224,224,0.5)"
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handlePickImage}
              disabled={isGenerating}
            >
              <MaterialIcons name="photo-camera" size={24} color={COLORS.accentCyan} />
            </TouchableOpacity>
          </View>
        </View>

        {isGenerating && (
          <View style={styles.loadingSection}>
            <Text style={styles.loadingText}>正在解析灵魂数据...</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View 
          style={styles.imageContainer}
          collapsable={false}
        >
          {generatedImage ? (
            <View 
              style={styles.imageWrapper}
              collapsable={false}
            >
              <Image 
                source={generatedImageSource as any}
                style={styles.image}
                onLoadStart={() => setIsImageLoading(true)}
                onLoad={() => {
                  setIsImageLoading(false);
                  setHasImageLoaded(true);
                }}
                onLoadEnd={() => {
                  setIsImageLoading(false);
                  setHasImageLoaded(true);
                  // 重置重试计数当图片加载成功时
                  if (retryCount > 0) {
                    setRetryCount(0);
                  }
                }}
                onError={(e) => {
                  console.error('[EffigyScreen] Image load error:', e.nativeEvent);
                  setIsImageLoading(false);
                  setHasImageLoaded(false);
                  
                  // 如果重试次数未达到最大值，则重试
                  if (retryCount < MAX_RETRIES) {
                    const newRetryCount = retryCount + 1;
                    console.log(`[EffigyScreen] Retrying image load (${newRetryCount}/${MAX_RETRIES})`);
                    
                    setRetryCount(newRetryCount);
                    
                    // 使用setTimeout避免立即重试，给网络一个恢复的机会
                    setTimeout(() => {
                      setGeneratedImage(prev => {
                        if (!prev) return null;
                        // 使用新的重试计数重新生成URL
                        return getImageUri(prev, newRetryCount);
                      });
                    }, 1000 * newRetryCount); // 指数退避
                  } else {
                    // 如果重试次数达到最大值，尝试直接加载原始URL（不通过代理）
                    if (generatedImage && generatedImage.includes('corsproxy.io')) {
                      console.log('[EffigyScreen] Retry limit reached, trying direct URL');
                      const directUrl = generatedImage.replace(/^https?:\/\/corsproxy\.io\/\?/, '');
                      setGeneratedImage(decodeURIComponent(directUrl));
                    } else {
                      setError('图片加载失败，请检查网络或稍后重试');
                    }
                  }
                }}
              />
              {(isGenerating || (isImageLoading && !hasImageLoaded)) && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  zIndex: 20
                }}>
                  <ActivityIndicator size="large" color={COLORS.accentCyan} />
                  {isGenerating && (
                    <Text style={{color: COLORS.accentCyan, marginTop: 10, fontWeight: 'bold'}}>
                      正在生成新替身...
                    </Text>
                  )}
                </View>
              )}
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={handleGenerateImage}
                disabled={isGenerating}
              >
                <MaterialIcons name="refresh" size={16} color={COLORS.accentCyan} />
                <Text style={styles.refreshText}>重新生成</Text>
              </TouchableOpacity>
              <View style={styles.imageLabel}>
                <Text style={styles.imageLabelText}>AI生成 · {selectedTrait}</Text>
              </View>
            </View>
          ) : isGenerating ? (
            <View style={styles.uploadPlaceholder}>
              <ActivityIndicator size="large" color={COLORS.accentMagenta} />
              <Text style={[styles.uploadText, { marginTop: 20 }]}>正在生成 {selectedTrait} 替身...</Text>
            </View>
          ) : uploadedImage ? (
            <View style={styles.imageWrapper}>
              <Image 
                source={uploadedImageSource as any}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => { 
                  setUploadedImage(null); 
                  setGeneratedImage(null); 
                }}
              >
                <MaterialIcons name="close" size={20} color={COLORS.accentCyan} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadPlaceholder} 
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add-a-photo" size={48} color="rgba(0, 255, 255, 0.5)" />
              <Text style={styles.uploadText}>点击上传图片</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.traitTitle}>注入特征 //</Text>
        <View style={styles.traitContainer}>
          {TRAITS.map((trait) => (
            <TouchableOpacity
              key={trait}
              style={[
                styles.traitButton,
                selectedTrait === trait && styles.traitButtonActive,
              ]}
              onPress={() => {
                setSelectedTrait(trait);
                // 切换特征时不要立即清除 generatedImage，用户体验更好
              }}
              disabled={isGenerating}
            >
              <Text
                style={[
                  styles.traitText,
                  selectedTrait === trait && styles.traitTextActive,
                ]}
              >
                {trait}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.injectedText}>
          已注入: <Text style={styles.injectedValue}>{selectedTrait}</Text>
        </Text>
      </ScrollView>

      <View style={styles.ctaContainer}>
        {generatedImage ? (
          <TouchableOpacity
            style={styles.ctaButtonMagenta}
            onPress={() => navigation.navigate('Ritual')}
          >
            <Text style={styles.ctaText}>开始做法</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.ctaButtonCyan, (!uploadedImage || isGenerating) && styles.ctaDisabled]}
            onPress={handleGenerateImage}
            disabled={isGenerating || !uploadedImage}
          >
            <Text style={styles.ctaTextDark}>
              {isGenerating ? '生成中...' : '生成替身'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 120,
  },
  inputSection: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.accentCyan,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  inputRow: {
    flexDirection: 'row',
  },
  textInput: {
    flex: 1,
    height: 56,
    backgroundColor: '#0A0F1E',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.5)',
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderBottomLeftRadius: BORDER_RADIUS.md,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
  },
  cameraButton: {
    width: 56,
    height: 56,
    backgroundColor: '#0A0F1E',
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.5)',
    borderLeftWidth: 0,
    borderTopRightRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSection: {
    marginBottom: SPACING.md,
  },
  loadingText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.accentCyan,
  },
  errorSection: {
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.red400,
    fontSize: 14,
  },
  imageContainer: {
    width: width - 40,
    height: width - 40,
    marginVertical: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  refreshText: {
    color: '#00ffff',
    marginLeft: 5,
    fontSize: 12,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    zIndex: 10,
  },
  imageLabelText: {
    color: '#00ffff',
    textAlign: 'center',
    fontSize: 12,
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,255,255,0.5)',
  },
  uploadText: {
    color: 'rgba(0,255,255,0.5)',
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  traitTitle: {
    color: COLORS.accentCyan,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  traitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  traitButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.5)',
    backgroundColor: 'transparent',
  },
  traitButtonActive: {
    backgroundColor: 'rgba(0,255,255,0.3)',
    borderColor: COLORS.accentCyan,
  },
  traitText: {
    color: COLORS.accentCyan,
    fontSize: 14,
    fontWeight: '500',
  },
  traitTextActive: {
    fontWeight: 'bold',
  },
  injectedText: {
    color: 'rgba(224,224,224,0.7)',
    fontSize: 14,
    marginTop: SPACING.md,
  },
  injectedValue: {
    color: COLORS.accentMagenta,
    fontWeight: '500',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.backgroundDark,
  },
  ctaButtonCyan: {
    height: 56,
    backgroundColor: COLORS.accentCyan,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  ctaButtonMagenta: {
    height: 56,
    backgroundColor: COLORS.accentMagenta,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  ctaDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaTextDark: {
    color: COLORS.backgroundDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EffigyScreen;