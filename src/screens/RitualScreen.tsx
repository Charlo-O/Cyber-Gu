import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
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

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Ritual'>;
};

const RitualScreen: React.FC<Props> = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [effigyImage, setEffigyImage] = useState<string | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      getEffigyImage().then(setEffigyImage);
    }, [])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rituals = [
    { id: 'love', name: '桃花', subName: 'Love', icon: 'favorite' as const, route: 'RitualLove' as const },
    { id: 'demote', name: '小人', subName: 'Demote', icon: 'psychology' as const, route: 'RitualDemote' as const },
    { id: 'luck', name: '好运', subName: 'Luck', icon: 'auto-awesome' as const, route: 'RitualServer' as const },
  ];

  const handleTap = () => {
    if (progress < 100) {
      setProgress(prev => Math.min(prev + 5, 100));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>施法仪式</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Target Name */}
        <Text style={styles.targetTitle}>目标对象</Text>

        {/* Target Avatar */}
        <TouchableOpacity onPress={handleTap} activeOpacity={0.8}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatarBorder} />
            <View style={styles.avatar}>
              {effigyImage ? (
                <Image source={{ uri: getImageUri(effigyImage) }} style={styles.avatarImage} />
              ) : (
                <Image
                  source={{ uri: getImageUri('https://lh3.googleusercontent.com/aida-public/AB6AXuCwvGuAlvfMI3a4CLhawyAJxQMZnPBTfm2R7RN-ebKPv8YHGrjvYr9xCM9WeQ0ew8WD1o3f8dU9AvhO5ZqvftYthcvYap8HfJmkH0lS7ZKVD_UQsFV_vGd-apgCBy5EneHk2xK8okqaY91oPo0p9ve9ZtY4YJDl7eiEB3_PaAn_qoPaB9gEIJtKiMq5h2czqaY3Sikw4C6Tnn4hQtkQrdn-qF9BvyemOHx0KIaWjyLvg1AlxjPqd68WixHapwvcX0riCPqtTzCpvO49') }}
                  style={styles.avatarImage}
                />
              )}
            </View>
            {/* Floating Curses */}
            <Text style={[styles.floatingText, styles.floatingBug]}>Bug--;</Text>
            <Text style={[styles.floatingText, styles.floatingError]}>Error: 404</Text>
            <Text style={[styles.floatingText, styles.floatingLuck]}>Luck++;</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>仪式进度</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <Text style={styles.tapHint}>疯狂点击头像以施法</Text>
      </View>

      {/* Ritual Selection */}
      <View style={styles.ritualSelection}>
        <View style={styles.ritualGrid}>
          {rituals.map((ritual, index) => (
            <TouchableOpacity
              key={ritual.id}
              style={[
                styles.ritualCard,
                { transform: [{ rotate: index === 0 ? '5deg' : index === 2 ? '-5deg' : '0deg' }] },
              ]}
              onPress={() => navigation.navigate(ritual.route)}
            >
              <MaterialIcons name={ritual.icon} size={28} color={COLORS.primary} />
              <Text style={styles.ritualName}>{ritual.name}</Text>
              <Text style={styles.ritualSubName}>{ritual.subName}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    justifyContent: 'space-between',
  },
  targetTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  avatarContainer: {
    width: 256,
    height: 256,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  avatarGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 128,
    borderWidth: 2,
    borderColor: 'rgba(227,88,53,0.5)',
  },
  avatarBorder: {
    position: 'absolute',
    width: '92%',
    height: '92%',
    borderRadius: 118,
    borderWidth: 1,
    borderColor: 'rgba(227,88,53,0.3)',
  },
  avatar: {
    width: 224,
    height: 224,
    borderRadius: 112,
    backgroundColor: '#171311',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  floatingText: {
    position: 'absolute',
    fontSize: 14,
  },
  floatingBug: {
    left: 16,
    top: 40,
    color: COLORS.primary,
    transform: [{ rotate: '-12deg' }],
  },
  floatingError: {
    right: 8,
    top: 96,
    color: COLORS.accentCyan,
    fontSize: 12,
    transform: [{ rotate: '6deg' }],
  },
  floatingLuck: {
    left: 0,
    bottom: 32,
    color: COLORS.green400,
    transform: [{ rotate: '3deg' }],
  },
  progressSection: {
    marginBottom: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    color: COLORS.zinc400,
    fontSize: 16,
    fontWeight: '500',
  },
  progressValue: {
    color: COLORS.zinc400,
    fontSize: 16,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.zinc800,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  tapHint: {
    color: COLORS.zinc400,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  ritualSelection: {
    height: 160,
    paddingHorizontal: SPACING.md,
  },
  ritualGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  ritualCard: {
    flex: 1,
    height: 112,
    backgroundColor: 'rgba(227,88,53,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(227,88,53,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  ritualName: {
    color: COLORS.zinc400,
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  ritualSubName: {
    color: COLORS.zinc400,
    fontSize: 12,
  },
});

export default RitualScreen;
