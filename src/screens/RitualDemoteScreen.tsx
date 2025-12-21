import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { getEffigyImage } from '../utils/storage';

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
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      getEffigyImage().then(setEffigyImage);
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
            {effigyImage ? (
              <Image source={{ uri: getImageUri(effigyImage) }} style={styles.avatarImage} />
            ) : (
              <Image
                source={{ uri: getImageUri('https://lh3.googleusercontent.com/aida-public/AB6AXuCwvGuAlvfMI3a4CLhawyAJxQMZnPBTfm2R7RN-ebKPv8YHGrjvYr9xCM9WeQ0ew8WD1o3f8dU9AvhO5ZqvftYthcvYap8HfJmkH0lS7ZKVD_UQsFV_vGd-apgCBy5EneHk2xK8okqaY91oPo0p9ve9ZtY4YJDl7eiEB3_PaAn_qoPaB9gEIJtKiMq5h2czqaY3Sikw4C6Tnn4hQtkQrdn-qF9BvyemOHx0KIaWjyLvg1AlxjPqd68WixHapwvcX0riCPqtTzCpvO49') }}
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
          <Text style={styles.cardSubtitle}>拖动病毒瓶到目标</Text>
          <View style={styles.virusGrid}>
            {virusItems.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.virusItem}>
                <MaterialIcons name={item.icon} size={28} color={COLORS.glitchPurple} />
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
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.8}>
            <View style={styles.sendButtonPing} />
            <MaterialIcons name="radar" size={36} color={COLORS.white} />
            <Text style={styles.sendButtonText}>按住</Text>
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
    color: COLORS.white,
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
});

export default RitualDemoteScreen;
