import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Karma'>;
};

const KarmaScreen: React.FC<Props> = ({ navigation }) => {
  const [shieldEnabled, setShieldEnabled] = React.useState(true);
  const insets = useSafeAreaInsets();

  const logs = [
    { type: 'Curse', name: '数字诅咒', time: '3小时前', color: COLORS.red500, bg: 'rgba(239,68,68,0.1)', icon: 'dangerous' as const, hash: '0x7a2...7e2' },
    { type: 'Blessing', name: '数字祝福', time: '1天前', color: COLORS.green500, bg: 'rgba(34,197,94,0.1)', icon: 'spa' as const, hash: '0x1f4...8a3' },
    { type: 'Deflect', name: '护盾激活', time: '2天前', color: COLORS.blue500, bg: 'rgba(59,130,246,0.1)', icon: 'security' as const, hash: '0x9d7...b6c' },
    { type: 'Curse', name: '数字诅咒', time: '2024-05-20', color: COLORS.red500, bg: 'rgba(239,68,68,0.1)', icon: 'dangerous' as const, hash: '0x3d5...f0c' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>业力账本</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={96} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>罪孽分数</Text>
            <Text style={styles.profileScore}>789</Text>
            <Text style={styles.profileId}>0xCyberGuUser</Text>
          </View>
        </View>

        {/* Shield Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>回旋护盾</Text>
            <Text style={styles.settingDesc}>防止诅咒反弹。</Text>
          </View>
          <Switch
            value={shieldEnabled}
            onValueChange={setShieldEnabled}
            trackColor={{ false: COLORS.zinc700, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaText}>进入救赎</Text>
        </TouchableOpacity>

        {/* Log List */}
        <Text style={styles.logTitle}>账目</Text>
        {logs.map((item, idx) => (
          <View key={idx} style={styles.logItem}>
            <View style={[styles.logIcon, { backgroundColor: item.bg }]}>
              <MaterialIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.logInfo}>
              <View style={styles.logHeader}>
                <Text style={styles.logName}>{item.name}</Text>
                <Text style={styles.logTime}>{item.time}</Text>
              </View>
              <Text style={styles.logHash}>{item.hash}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(227,88,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileLabel: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileScore: {
    color: COLORS.red500,
    fontSize: 30,
    fontWeight: 'bold',
  },
  profileId: {
    color: COLORS.zinc500,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.zinc900,
    borderWidth: 1,
    borderColor: COLORS.zinc800,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingDesc: {
    color: COLORS.zinc500,
    fontSize: 12,
    marginTop: 2,
  },
  ctaButton: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.zinc900,
    borderWidth: 1,
    borderColor: COLORS.zinc800,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logTime: {
    color: COLORS.zinc500,
    fontSize: 14,
  },
  logHash: {
    color: COLORS.zinc500,
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

export default KarmaScreen;
