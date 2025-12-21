import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface DrawerItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description?: string;
  onPress: () => void;
  color?: string;
}

const DrawerItem: React.FC<DrawerItemProps> = ({ icon, label, description, onPress, color = COLORS.accentCyan }) => (
  <TouchableOpacity
    style={styles.drawerItem}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { borderColor: color }]}>
      <MaterialIcons name={icon} size={22} color={color} />
    </View>
    <View style={styles.itemTextContainer}>
      <Text style={[styles.itemLabel, { color }]}>{label}</Text>
      {description && <Text style={styles.itemDesc}>{description}</Text>}
    </View>
    <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.2)" />
  </TouchableOpacity>
);

const DrawerContent = (props: DrawerContentComponentProps) => {
  const insets = useSafeAreaInsets();
  const { navigation } = props;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="auto-awesome" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>赛博蛊术</Text>
        <Text style={styles.subtitle}>CYBER GU</Text>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Main Section */}
        <Text style={styles.sectionLabel}>控制中心</Text>
        
        <DrawerItem
          icon="menu-book"
          label="魔法书系统"
          description="自定义模型与咒语"
          color={COLORS.accentMagenta}
          onPress={() => navigation.navigate('Grimoire')}
        />

        <DrawerItem
          icon="temple-buddhist"
          label="主祭坛"
          description="返回主界面"
          onPress={() => navigation.navigate('Altar')}
        />

        <View style={styles.divider} />

        {/* Quick Access */}
        <Text style={styles.sectionLabel}>快捷入口</Text>

        <DrawerItem
          icon="person-add"
          label="立替身"
          onPress={() => navigation.navigate('Effigy')}
        />

        <DrawerItem
          icon="auto-fix-high"
          label="施法"
          onPress={() => navigation.navigate('Ritual')}
        />

        <DrawerItem
          icon="loop"
          label="业力"
          onPress={() => navigation.navigate('Karma')}
        />
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Text style={styles.version}>v1.1.0 · 魔法书更新</Text>
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
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(227, 88, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(227, 88, 53, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    letterSpacing: 6,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: SPACING.md,
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  version: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
  },
});

export default DrawerContent;
