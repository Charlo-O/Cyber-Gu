import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { getEffigyImage } from '../utils/storage';

const { width } = Dimensions.get('window');

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

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RitualLove'>;
};

const RitualLoveScreen: React.FC<Props> = ({ navigation }) => {
  const [effigyImage, setEffigyImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      getEffigyImage().then(setEffigyImage);
    }, [])
  );

  const payloads = [
    { name: '推拉战术', icon: 'local-fire-department' as const, colors: ['#ef4444', '#f97316'] as const },
    { name: '深度共情', icon: 'water-drop' as const, colors: ['#60a5fa', '#6366f1'] as const },
    { name: '混沌/幽默', icon: 'casino' as const, colors: ['#a855f7', '#ec4899'] as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>项目：桃花蛊</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>系统：在线</Text>
          </View>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Target */}
        <View style={styles.targetSection}>
          <View style={styles.decorLine} />
          <View style={[styles.decorLine, styles.decorLineRight]} />
          
          <View style={styles.targetCircle}>
            <View style={styles.targetGlow} />
            <Image
              source={{ uri: getImageUri(effigyImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD37NcNJ2Vo5_jkZJuXjtzEanUo2vW9I7P7eGJxYIpPpsq8m0xjQ2noIWBHNwrrlrAZDCKiPRTHZFd1yZo3XwNpasHWRxO9twI_n76Pi0uHSC1Ri93D08DLg11ycCyouM4Srzc7Rsyuks4F1mOCLCkl6kVl_stt4Bn0X0ZphJmi3o8gtmx4wg4vTxJGgkoUXhw8kNvGvjq4GOOjHPklNuGMXsU_V4iaTJTDVgxcXGtu21x6DYR47Qud1ef2nc27wT5NvcHSjWVpZI64') }}
              style={styles.targetImage}
            />
            <View style={styles.targetLabel}>
              <Text style={styles.targetLabelText}>目标_01 // 休眠中</Text>
            </View>
          </View>
        </View>

        {/* Phase 1 */}
        <View style={styles.phaseSection}>
          <View style={styles.phaseHeader}>
            <MaterialIcons name="input" size={16} color={COLORS.neonBlue} />
            <Text style={styles.phaseTitle}>第一阶段：数据注入</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="> 在此粘贴聊天记录或神经数据..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.uploadButton}>
              <MaterialIcons name="upload-file" size={20} color={COLORS.neonBlue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Phase 2 */}
        <View style={styles.phaseSection}>
          <View style={styles.phaseHeader}>
            <MaterialIcons name="psychology" size={16} color={COLORS.steamwavePink} />
            <Text style={[styles.phaseTitle, { color: COLORS.steamwavePink }]}>第二阶段：神经模拟</Text>
          </View>

          <View style={styles.statsRow}>
            {/* Radar placeholder */}
            <View style={styles.radarBox}>
              <Text style={styles.radarText}>扫描中...</Text>
            </View>
            
            {/* Stats */}
            <View style={styles.statsColumn}>
              <View style={styles.statBox}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>信任度</Text>
                  <Text style={styles.statValue}>42%</Text>
                </View>
                <View style={styles.statBar}>
                  <View style={[styles.statFill, { width: '42%' }]} />
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>多巴胺</Text>
                <Text style={styles.statValueBig}>危急</Text>
              </View>
            </View>
          </View>

          {/* Payloads */}
          <Text style={styles.payloadLabel}>选择病毒载荷：</Text>
          {payloads.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.payloadItem}>
              <LinearGradient
                colors={item.colors}
                style={styles.payloadIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name={item.icon} size={16} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.payloadName}>{item.name}</Text>
              <MaterialIcons name="play-circle" size={24} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <View style={styles.loveBoost}>
          <Text style={styles.loveBoostText}>爱意 +10</Text>
        </View>
        <TouchableOpacity style={styles.ctaButton}>
          <MaterialIcons name="auto-fix-high" size={24} color="#181016" />
          <Text style={styles.ctaText}>复制并实施</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#230f1c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(35,15,28,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#3a2733',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.steamwavePink,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neonBlue,
  },
  statusText: {
    color: COLORS.neonBlue,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 150,
  },
  targetSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  decorLine: {
    position: 'absolute',
    left: '25%',
    top: 0,
    width: 1,
    height: 96,
    backgroundColor: COLORS.neonBlue,
    opacity: 0.5,
  },
  decorLineRight: {
    left: 'auto',
    right: '25%',
  },
  targetCircle: {
    width: 208,
    height: 208,
    borderRadius: 104,
    borderWidth: 4,
    borderColor: 'rgba(255,113,206,0.4)',
    backgroundColor: COLORS.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  targetGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,113,206,0.2)',
  },
  targetImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  targetLabel: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(1,205,254,0.3)',
  },
  targetLabelText: {
    color: COLORS.neonBlue,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  phaseSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  phaseTitle: {
    color: COLORS.neonBlue,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  inputContainer: {
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: '#3a2733',
    borderRadius: BORDER_RADIUS.xl,
    padding: 4,
  },
  textArea: {
    backgroundColor: '#181016',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: 'monospace',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  radarBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.sm,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarText: {
    color: COLORS.neonBlue,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statsColumn: {
    flex: 1,
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: SPACING.sm,
    justifyContent: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    backgroundColor: COLORS.steamwavePink,
    shadowColor: COLORS.steamwavePink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  statValueBig: {
    color: COLORS.neonBlue,
    fontSize: 20,
    fontWeight: 'bold',
  },
  payloadLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  payloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    paddingRight: SPACING.md,
    marginBottom: SPACING.sm,
  },
  payloadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payloadName: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(24,16,22,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#3a2733',
    padding: SPACING.md,
    paddingBottom: 40,
  },
  loveBoost: {
    position: 'absolute',
    top: -48,
    right: 24,
    backgroundColor: COLORS.steamwavePink,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.steamwavePink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  loveBoostText: {
    color: '#181016',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.steamwavePink,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: COLORS.steamwavePink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  ctaText: {
    color: '#181016',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RitualLoveScreen;
