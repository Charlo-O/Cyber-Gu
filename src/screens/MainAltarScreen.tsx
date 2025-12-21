import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Altar'>;
};

const MainAltarScreen: React.FC<Props> = ({ navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const insets = useSafeAreaInsets();
  const drawerNavigation = useNavigation();
  
  // 动画效果
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // 脉冲动画
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    
    // 光晕动画
    const glowLoop = Animated.loop(
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    
    pulseLoop.start();
    glowLoop.start();
    
    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, []);

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    drawerNavigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={openDrawer}>
          <MaterialIcons name="menu" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>主祭坛</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="notifications" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Fortune Card */}
        <View style={styles.fortuneCard}>
          <Text style={styles.fortuneTitle}>算力巅峰</Text>
          <View style={styles.fortuneRow}>
            <Text style={styles.fortuneGood}>宜：</Text>
            <Text style={styles.fortuneText}>代码重构、系统碎片整理、备份。</Text>
          </View>
          <View style={styles.fortuneRow}>
            <Text style={styles.fortuneBad}>忌：</Text>
            <Text style={styles.fortuneText}>周五部署、打开可疑数据包。</Text>
          </View>
        </View>

        {/* The Vessel */}
        <Text style={styles.vesselTitle}>蛊器</Text>
        <Text style={styles.vesselSubtitle}>与蛊器互动以开始仪式。</Text>

        <TouchableOpacity
          style={styles.vesselContainer}
          onPress={() => navigation.navigate('Effigy')}
          activeOpacity={0.8}
        >
          {/* 外层光晕效果 */}
          <Animated.View 
            style={[
              styles.vesselOuterGlow,
              {
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }]
              }
            ]} 
          />
          {/* 中层紫色边框 */}
          <View style={styles.vesselPurpleBorder} />
          {/* 内层光晕 */}
          <Animated.View 
            style={[
              styles.vesselInnerGlow,
              {
                opacity: Animated.add(0.3, Animated.multiply(glowAnim, 0.5)),
                transform: [{ scale: Animated.add(0.98, Animated.multiply(pulseAnim, 0.02)) }]
              }
            ]} 
          />
          {/* 圆形图片 */}
          <View style={styles.vesselImageContainer}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvmW-uGwuf7lcRmE537IPK6yaCXcHD4Lz6XUxqTICpA-KdJtH-2tdsD4y5i28sEP1w3gllUcHPgCsYUA435bZJOgjm-VEE4YNQNPILomSYIN_tRXIIgoiW6G1VmFkesj6gcJ1l8afmr4K2JG5tKLn4BWFQayPyAE4NSD-SwLTIpMLZrK0ey4sDtsQY2FAjFtV3DYQy58eMflWSivgHiFRTZKBCDHNGZEXJNYQq_uPcjsNT86FFCDNSsIvonXRp7rQ8vHnC_MHj3B2F' }}
              style={styles.vesselImage}
              resizeMode="cover"
            />
          </View>
          {/* 施法效果粒子 */}
          <View style={styles.ritualParticles}>
            <View style={[styles.particle, styles.particle1]} />
            <View style={[styles.particle, styles.particle2]} />
            <View style={[styles.particle, styles.particle3]} />
            <View style={[styles.particle, styles.particle4]} />
            <View style={[styles.particle, styles.particle5]} />
            <View style={[styles.particle, styles.particle6]} />
          </View>
        </TouchableOpacity>

        {/* Incense */}
        <View style={styles.incenseContainer}>
          <View style={styles.incenseRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.incenseStick}>
                <View style={[styles.incenseFill, { height: `${30 + i * 20}%` }]} />
              </View>
            ))}
          </View>
          <Text style={styles.incenseText}>CPU密集型香火</Text>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <View style={styles.bottomNavInner}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Altar')}
          >
            <MaterialIcons name="temple-buddhist" size={24} color={COLORS.primary} />
            <Text style={[styles.navLabel, { color: COLORS.primary }]}>主祭坛</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Effigy')}
          >
            <MaterialIcons name="person-add" size={24} color="rgba(255,255,255,0.5)" />
            <Text style={styles.navLabel}>立替身</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Ritual')}
          >
            <MaterialIcons name="auto-fix-high" size={24} color="rgba(255,255,255,0.5)" />
            <Text style={styles.navLabel}>施法</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Karma')}
          >
            <MaterialIcons name="loop" size={24} color="rgba(255,255,255,0.5)" />
            <Text style={styles.navLabel}>业力</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>信号中断</Text>
            <Text style={styles.modalSubtitle}>禁忌代码段</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeComment}>// Error 404: Hope Not Found</Text>
              <Text style={styles.codeLine}>
                <Text style={styles.codePurple}>Motivation</Text>
                <Text style={styles.codeBlue}>.find</Text>
                <Text style={styles.codeWhite}>()</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalClose}>点击撕开</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.sm,
    paddingBottom: 80,
  },
  fortuneCard: {
    borderWidth: 1,
    borderColor: 'rgba(227,88,53,0.2)',
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(227,88,53,0.05)',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  fortuneTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  fortuneRow: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  fortuneGood: {
    color: COLORS.green400,
    fontWeight: 'bold',
    fontSize: 14,
  },
  fortuneBad: {
    color: COLORS.red400,
    fontWeight: 'bold',
    fontSize: 14,
  },
  fortuneText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    flex: 1,
    marginLeft: SPACING.xs,
  },
  vesselTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  vesselSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  vesselContainer: {
    width: width - 32,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  vesselOuterGlow: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 999,
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  vesselPurpleBorder: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#8a2be2',
    backgroundColor: 'transparent',
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  vesselInnerGlow: {
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: 999,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  vesselImageContainer: {
    width: '70%',
    height: '70%',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(138, 43, 226, 0.5)',
    backgroundColor: '#100C14',
  },
  vesselImage: {
    width: '100%',
    height: '100%',
  },
  ritualParticles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8a2be2',
  },
  particle1: {
    top: '10%',
    left: '15%',
    opacity: 0.8,
  },
  particle2: {
    top: '20%',
    right: '10%',
    opacity: 0.6,
  },
  particle3: {
    bottom: '15%',
    left: '8%',
    opacity: 0.7,
  },
  particle4: {
    bottom: '25%',
    right: '12%',
    opacity: 0.9,
  },
  particle5: {
    top: '45%',
    left: '5%',
    opacity: 0.5,
  },
  particle6: {
    top: '35%',
    right: '7%',
    opacity: 0.8,
  },
  incenseContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  incenseRow: {
    flexDirection: 'row',
    gap: 24,
  },
  incenseStick: {
    width: 6,
    height: 80,
    backgroundColor: 'rgba(227,88,53,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  incenseFill: {
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  incenseText: {
    color: 'rgba(227,88,53,0.7)',
    fontSize: 12,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13,5,10,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  bottomNavInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: SPACING.md,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 350,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.red500,
    backgroundColor: 'rgba(26,11,8,0.95)',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.red500,
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  modalSubtitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  codeBlock: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.lg,
  },
  codeComment: {
    color: COLORS.red500,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  codeLine: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  codePurple: {
    color: '#a855f7',
  },
  codeBlue: {
    color: '#60a5fa',
  },
  codeWhite: {
    color: COLORS.white,
  },
  modalClose: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default MainAltarScreen;
