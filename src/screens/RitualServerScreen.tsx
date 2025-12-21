import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { getEffigyImage } from '../utils/storage';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RitualServer'>;
};

const RitualServerScreen: React.FC<Props> = ({ navigation }) => {
  const [effigyImage, setEffigyImage] = React.useState<string | null>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      // 获取替身图片
      getEffigyImage().then(setEffigyImage);
      
      // 启动动画
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      
      return () => animation.stop();
    }, [pulseAnim])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Grid Background */}
      <View style={styles.gridBg} />
      <View style={styles.centerLine} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>仪式：驱除坏运</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Server Totem */}
        <View style={styles.totemSection}>
          <Text style={styles.divTag}>{'<div>'}</Text>
          <View style={styles.serverBox}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.serverSlot}>
                <Animated.View style={[styles.serverLed, { opacity: pulseAnim }]} />
              </View>
            ))}
            <MaterialIcons
              name="cable"
              size={24}
              color={COLORS.red500}
              style={styles.cableIcon}
            />
          </View>
          <Text style={styles.totemLabel}>服务器图腾</Text>
        </View>

        {/* Step 1: Upload Logs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>1. 上传日志</Text>
          <View style={styles.logBox}>
            <Text style={styles.logText}>
              Exception in thread "main" java.lang.NullPointerException at com.company.LegacyCode.fixMe(LegacyCode.java:666)
            </Text>
            <View style={styles.logButtons}>
              <TouchableOpacity style={styles.logButton}>
                <MaterialIcons name="content-paste" size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logButton}>
                <MaterialIcons name="upload-file" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
          <Animated.Text style={[styles.statusText, { opacity: pulseAnim }]}>
            正在将BUG转化为赛博经文...
          </Animated.Text>
        </View>

        {/* Step 2: Purify */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>2. 净化</Text>
          <View style={styles.purifyRow}>
            <TouchableOpacity style={styles.purifyBox}>
              <MaterialIcons name="draw" size={36} color={COLORS.matrixGreen} />
              <Text style={styles.purifyLabel}>绘制符文</Text>
            </TouchableOpacity>
            <Text style={styles.plusSign}>+</Text>
            <TouchableOpacity style={styles.purifyBox}>
              <MaterialIcons name="mic" size={36} color={COLORS.matrixGreen} />
              <Text style={styles.purifyLabel}>唱诵</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Step 3: Solution */}
        <View style={styles.actionSection}>
          <Text style={styles.actionLabel}>3. 解决方案</Text>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="bolt" size={24} color={COLORS.black} />
            <Text style={styles.actionText}>揭示修复</Text>
          </TouchableOpacity>
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
  gridBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,255,0,0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(18,18,18,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,0,0.3)',
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.matrixGreen,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  placeholder: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  totemSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divTag: {
    color: COLORS.yellow400,
    fontSize: 56,
    fontWeight: 'bold',
    opacity: 0.1,
    position: 'absolute',
  },
  serverBox: {
    width: 48,
    height: 112,
    backgroundColor: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.zinc700,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.red500,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  serverSlot: {
    width: 32,
    height: 4,
    backgroundColor: COLORS.zinc800,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  serverLed: {
    width: 4,
    height: 4,
    backgroundColor: COLORS.red500,
  },
  cableIcon: {
    position: 'absolute',
    top: -16,
  },
  totemLabel: {
    color: COLORS.zinc400,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.5)',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    color: COLORS.matrixGreen,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: COLORS.matrixGreen,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  logBox: {
    minHeight: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,215,0,0.5)',
    backgroundColor: 'rgba(255,255,0,0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  logText: {
    color: COLORS.red400,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  logButtons: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  logButton: {
    padding: 4,
  },
  statusText: {
    color: COLORS.matrixGreen,
    fontSize: 10,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  purifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  purifyBox: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,255,0,0.5)',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purifyLabel: {
    color: COLORS.zinc400,
    fontSize: 12,
    marginTop: 4,
  },
  plusSign: {
    color: COLORS.zinc600,
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionSection: {
    marginTop: SPACING.lg,
  },
  actionLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 64,
    backgroundColor: COLORS.matrixGreen,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.matrixGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  actionText: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RitualServerScreen;
