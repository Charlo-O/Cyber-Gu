import React, { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { generateImage, TRAIT_PROMPTS } from '../utils/modelScope';
import { saveEffigyImage, saveEffigyTrait, getEffigyImage } from '../utils/storage';

const { width } = Dimensions.get('window');
const TRAITS = ['烦人上司', '前任', '小人', 'Bad Luck'] as const;

// CORS 代理 - Web 端图片加载使用
const CORS_PROXY = 'https://corsproxy.io/?';

// 处理图片 URL，Web 端需要代理
function getImageUri(url: string): string {
  if (!url) return '';
  // 如果是 base64 或已经是代理 URL，直接返回
  if (url.startsWith('data:') || url.includes('corsproxy.io')) {
    return url;
  }
  // Web 端外部 URL 需要代理
  if (Platform.OS === 'web' && url.startsWith('http')) {
    return `${CORS_PROXY}${encodeURIComponent(url)}`;
  }
  return url;
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
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getEffigyImage().then((image) => {
      if (image) {
        console.log('[EffigyScreen] Loaded image from storage:', image.substring(0, 100));
        setGeneratedImage(image);
      } else {
        console.log('[EffigyScreen] No image in storage');
      }
    });
  }, []);

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

    try {
      const prompt = TRAIT_PROMPTS[selectedTrait];
      const imageUrl = await generateImage(prompt, uploadedImage);
      console.log('[EffigyScreen] Generated image URL:', imageUrl.substring(0, 100));
      setGeneratedImage(imageUrl);
      await saveEffigyImage(imageUrl);
      await saveEffigyTrait(selectedTrait);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      console.error('Image generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
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

        {/* Loading Indicator */}
        {isGenerating && (
          <View style={styles.loadingSection}>
            <Text style={styles.loadingText}>正在解析灵魂数据...</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Image Display */}
        <View style={styles.imageContainer}>
          {isGenerating ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="large" color={COLORS.accentMagenta} />
              <Text style={styles.generatingText}>正在生成 {selectedTrait} 替身...</Text>
            </View>
          ) : generatedImage ? (
            <View style={styles.imageWrapper}>
              <Image 
                source={{ uri: getImageUri(generatedImage) }} 
                style={styles.image}
                onLoad={() => console.log('[EffigyScreen] Generated image loaded successfully')}
                onError={(e) => console.error('[EffigyScreen] Generated image load error:', e.nativeEvent)}
              />
              <TouchableOpacity style={styles.refreshButton} onPress={handleGenerateImage}>
                <MaterialIcons name="refresh" size={16} color={COLORS.accentCyan} />
                <Text style={styles.refreshText}>重新生成</Text>
              </TouchableOpacity>
              <View style={styles.imageLabel}>
                <Text style={styles.imageLabelText}>AI生成 · {selectedTrait}</Text>
              </View>
            </View>
          ) : uploadedImage ? (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: uploadedImage }} style={styles.image} />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => { setUploadedImage(null); setGeneratedImage(null); }}
              >
                <MaterialIcons name="close" size={16} color={COLORS.accentCyan} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadPlaceholder} onPress={handlePickImage}>
              <MaterialIcons name="add-photo-alternate" size={48} color="rgba(0,255,255,0.5)" />
              <Text style={styles.uploadText}>点击上传图片</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Trait Selection */}
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
                setGeneratedImage(null);
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

      {/* CTA Button */}
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
    width: 256,
    height: 256,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  imagePlaceholder: {
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 1,
    borderColor: 'rgba(255,0,255,0.3)',
    backgroundColor: 'rgba(255,0,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingText: {
    color: COLORS.accentMagenta,
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  imageWrapper: {
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: '#171311',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  refreshButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,18,18,0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    gap: 4,
  },
  refreshText: {
    color: COLORS.accentCyan,
    fontSize: 12,
  },
  imageLabel: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(18,18,18,0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  imageLabelText: {
    color: COLORS.accentMagenta,
    fontSize: 12,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(18,18,18,0.8)',
    padding: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  uploadPlaceholder: {
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
