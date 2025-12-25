import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Video, ResizeMode } from 'expo-av';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { getEffigyImage } from '../utils/storage';
import { useConfig, DEMOTE_VIDEO_PROMPTS } from '../context/ConfigContext';
import { generateVideoFromImage } from '../utils/videoGeneration';

// CORS 代理 - Web 端图片加载使用
const CORS_PROXY = 'https://corsproxy.io/?';

// 处理图片 URL，Web 端需要代理
function getImageUri(url: string): string {
  if (!url) return '';
  if (url.startsWith('data:') || url.includes('corsproxy.io')) {
    return url;
  }
  if (Platform.OS === 'web' && url.startsWith('http')) {
    return `${CORS_PROXY}${encodeURIComponent(url)}`;
  }
  return url;
}

// 获取屏幕尺寸
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RitualDemote'>;
};

const RitualDemoteScreen: React.FC<Props> = ({ navigation }) => {
  const [effigyImage, setEffigyImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVirusType, setSelectedVirusType] = useState<string | null>(null);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { videoConfig } = useConfig();

  const effigyImageSource = useMemo(() => {
    if (!effigyImage) return null;
    return { uri: getImageUri(effigyImage) };
  }, [effigyImage]);

  const placeholderImageSource = useMemo(() => {
    return {
      uri: getImageUri('https://lh3.googleusercontent.com/aida-public/AB6AXuCwvGuAlvfMI3a4CLhawyAJxQMZnPBTfm2R7RN-ebKPv8YHGrjvYr9xCM9WeQ0ew8WD1o3f8dU9AvhO5ZqvftYthcvYap8HfJmkH0lS7ZKVD_UQsFV_vGd-apgCBy5EneHk2xK8okqaY91oPo0p9ve9ZtY4YJDl7eiEB3_PaAn_qoPaB9gEIJtKiMq5h2czqaY3Sikw4C6Tnn4hQtkQrdn-qF9BvyemOHx0KIaWjyLvg1AlxjPqd68WixHapwvcX0riCPqtTzCpvO49'),
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      getEffigyImage().then(setEffigyImage);
      // Reset video when returning to screen
      setVideoUrl(null);
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSelectVirus = async (virusType: string) => {
    if (isGenerating) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedVirusType(virusType);
  };

  const handleSendPress = async () => {
    if (isGenerating) return;

    if (!selectedVirusType) {
      Alert.alert('请选择病毒', '请先选择要注入的病毒');
      return;
    }

    if (!effigyImage) {
      Alert.alert('缺少目标', '请先在替身工坊创建替身');
      return;
    }

    if (!videoConfig.apiKey) {
      Alert.alert(
        '未配置',
        '请先在魔法书系统中配置视频模型的 API Key\n\n提示：点击右上角进入魔法书系统配置',
        [{ text: '知道了' }]
      );
      return;
    }

    if (!videoConfig.baseUrl) {
      Alert.alert(
        '配置不完整',
        '视频API地址未配置\n请在魔法书系统中完善配置',
        [{ text: '知道了' }]
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsGenerating(true);
    setGeneratingType(selectedVirusType);
    setGenerationStatus('正在准备...');
    setVideoUrl(null);

    try {
      const prompt =
        DEMOTE_VIDEO_PROMPTS[selectedVirusType] || `Apply ${selectedVirusType} effect to the character`;

      const result = await generateVideoFromImage(prompt, effigyImage, videoConfig, (status) => {
        setGenerationStatus(status);
      });

      setVideoUrl(result);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('仪式完成', `${selectedVirusType}效果已生效！`);
    } catch (error) {
      console.error('Video generation failed:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error ? error.message : '视频生成失败';

      if (errorMessage.includes('DNS') || errorMessage.includes('不可用')) {
        Alert.alert(
          '服务暂时不可用',
          errorMessage + '\n\n建议：\n1. 检查网络连接\n2. 稍后重试\n3. 或在魔法书系统中更换API服务商',
          [{ text: '知道了' }]
        );
      } else if (errorMessage.includes('API Key')) {
        Alert.alert('API配置错误', errorMessage, [
          { text: '取消', style: 'cancel' },
          { text: '去配置', onPress: () => navigation.navigate('Grimoire') },
        ]);
      } else {
        Alert.alert('仪式失败', errorMessage, [{ text: '知道了' }]);
      }
    } finally {
      setIsGenerating(false);
      setGeneratingType(null);
      setGenerationStatus('');
    }
  };

  const virusItems = [
    { icon: 'science' as const, label: '胡言乱语' },
    { icon: 'quiz' as const, label: '悖论' },
    { icon: 'sentiment-very-dissatisfied' as const, label: '讽刺' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Decorative Shapes */}
      <View style={[styles.decorShape, styles.decorLeft]} />
      <View style={[styles.decorShape, styles.decorRight]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>仪式：降智蛊</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Target */}
          <View style={styles.targetContainer}>
          <View style={styles.avatarGlow} />
          <View style={styles.avatarBorder} />
          <View style={styles.avatar}>
            {videoUrl ? (
              // 显示生成的视频
              <Video
                source={{ uri: videoUrl }}
                style={styles.avatarImage}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted={false}
              />
            ) : isGenerating ? (
              // 显示加载状态
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.glitchPurple} />
                <Text style={styles.loadingText}>{generationStatus}</Text>
              </View>
            ) : effigyImage ? (
              <Image source={effigyImageSource as any} style={styles.avatarImage} />
            ) : (
              <Image
                source={placeholderImageSource as any}
                style={[styles.avatarImage, { opacity: 0.8 }]}
              />
            )}
          </View>
          {/* Floating Curses */}
          <Text style={[styles.floatingText, styles.floatingYellow]}>NullPointer</Text>
          <Text style={[styles.floatingText, styles.floatingCyan]}>sys.core.dump</Text>
          <Text style={[styles.floatingText, styles.floatingRed]}>SegFault</Text>
          {/* Spinner */}
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <MaterialIcons name="hourglass-empty" size={56} color={COLORS.glitchPurple} />
          </Animated.View>
        </View>

        {/* Step 1: Inject */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. 注入</Text>
          <Text style={styles.cardSubtitle}>选择注入的病毒</Text>
          <View style={styles.virusGrid}>
            {virusItems.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[
                  styles.virusItem,
                  selectedVirusType === item.label && styles.virusItemActive,
                  isGenerating && generatingType !== item.label && styles.virusItemDisabled,
                ]}
                onPress={() => handleSelectVirus(item.label)}
                disabled={isGenerating}
              >
                {isGenerating && generatingType === item.label ? (
                  <ActivityIndicator size="small" color={COLORS.glitchPurple} />
                ) : (
                  <MaterialIcons name={item.icon} size={28} color={COLORS.glitchPurple} />
                )}
                <Text style={styles.virusLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Step 2: Spell */}
        <View style={[styles.card, styles.cardYellow]}>
          <Text style={[styles.cardTitle, styles.cardTitleYellow]}>2. 咒语</Text>
          <View style={styles.spellContainer}>
            <View style={styles.spellTag}>
              <View style={styles.spellDot} />
              <Text style={styles.spellText}>降智符</Text>
              <Text style={styles.spellValue}>INT-50</Text>
            </View>
          </View>
          <Text style={styles.statusText}>状态：逻辑电路超载...</Text>
        </View>

        {/* Step 3: Send */}
        <View style={styles.sendSection}>
          <Text style={styles.sendLabel}>3. 发送脑波</Text>
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.8}
            onPress={handleSendPress}
            disabled={isGenerating}
          >
            <View style={styles.sendButtonPing} />
            <MaterialIcons name="radar" size={36} color={COLORS.white} />
            <Text style={styles.sendButtonText}>发送</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  decorShape: {
    position: 'absolute',
    backgroundColor: 'rgba(39,39,46,0.5)',
    borderWidth: 1,
  },
  decorLeft: {
    left: -64,
    top: '25%',
    width: 128,
    height: 128,
    borderColor: 'rgba(138,43,226,0.5)',
    transform: [{ rotate: '-12deg' }],
  },
  decorRight: {
    right: -96,
    bottom: '25%',
    width: 192,
    height: 192,
    borderColor: 'rgba(255,215,0,0.5)',
    borderWidth: 2,
    transform: [{ rotate: '6deg' }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(18,18,18,0.8)',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.glitchPurple,
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 48,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 20,
  },
  targetContainer: {
    width: Math.min(256, screenWidth * 0.7),
    height: Math.min(256, screenWidth * 0.7),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  avatarGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Math.min(128, screenWidth * 0.35),
    borderWidth: 2,
    borderColor: COLORS.glitchPurple,
    opacity: 0.7,
  },
  avatarBorder: {
    position: 'absolute',
    width: '92%',
    height: '92%',
    borderRadius: Math.min(118, screenWidth * 0.32),
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.5)',
  },
  avatar: {
    width: Math.min(224, screenWidth * 0.6),
    height: Math.min(224, screenWidth * 0.6),
    borderRadius: Math.min(112, screenWidth * 0.3),
    backgroundColor: '#100C14',
    borderWidth: 2,
    borderColor: 'rgba(138,43,226,0.3)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  floatingText: {
    position: 'absolute',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  floatingYellow: {
    left: 16,
    top: 40,
    color: COLORS.warningYellow,
    transform: [{ rotate: '-12deg' }],
  },
  floatingCyan: {
    right: 8,
    top: 96,
    color: COLORS.accentCyan,
    fontSize: 12,
    transform: [{ rotate: '6deg' }],
  },
  floatingRed: {
    right: 0,
    bottom: 48,
    color: COLORS.red500,
    transform: [{ rotate: '-3deg' }],
  },
  spinner: {
    position: 'absolute',
    opacity: 0.8,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.5)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardYellow: {
    borderColor: 'rgba(255,215,0,0.5)',
  },
  cardTitle: {
    color: COLORS.glitchPurple,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardTitleYellow: {
    color: COLORS.warningYellow,
  },
  cardSubtitle: {
    color: COLORS.zinc400,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  virusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  virusItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.3)',
    backgroundColor: 'rgba(138,43,226,0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  virusLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  spellContainer: {
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,215,0,0.5)',
    backgroundColor: 'rgba(255,255,0,0.1)',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  spellTag: {
    backgroundColor: 'rgba(120,80,0,0.4)',
    borderWidth: 1,
    borderColor: COLORS.warningYellow,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  spellDot: {
    position: 'absolute',
    top: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.warningYellow,
  },
  spellText: {
    color: COLORS.warningYellow,
    fontSize: 10,
  },
  spellValue: {
    color: '#fef08a',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusText: {
    color: COLORS.zinc500,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: SPACING.sm,
  },
  sendSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  sendLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  sendButton: {
    width: Math.min(96, screenWidth * 0.25),
    height: Math.min(96, screenWidth * 0.25),
    borderRadius: Math.min(48, screenWidth * 0.125),
    backgroundColor: COLORS.glitchPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonPing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Math.min(48, screenWidth * 0.125),
    backgroundColor: 'rgba(138,43,226,0.5)',
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  // Loading and video styles
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  loadingText: {
    color: COLORS.glitchPurple,
    fontSize: 12,
    marginTop: SPACING.sm,
    fontFamily: 'monospace',
  },
  virusItemActive: {
    borderColor: COLORS.glitchPurple,
    backgroundColor: 'rgba(138,43,226,0.3)',
  },
  virusItemDisabled: {
    opacity: 0.5,
  },
});

export default RitualDemoteScreen;
