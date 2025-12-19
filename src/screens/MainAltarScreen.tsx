import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Altar'>;
};

const MainAltarScreen: React.FC<Props> = ({ navigation }) => {
  const [showModal, setShowModal] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton}>
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
          <View style={styles.vesselGlow} />
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvmW-uGwuf7lcRmE537IPK6yaCXcHD4Lz6XUxqTICpA-KdJtH-2tdsD4y5i28sEP1w3gllUcHPgCsYUA435bZJOgjm-VEE4YNQNPILomSYIN_tRXIIgoiW6G1VmFkesj6gcJ1l8afmr4K2JG5tKLn4BWFQayPyAE4NSD-SwLTIpMLZrK0ey4sDtsQY2FAjFtV3DYQy58eMflWSivgHiFRTZKBCDHNGZEXJNYQq_uPcjsNT86FFCDNSsIvonXRp7rQ8vHnC_MHj3B2F' }}
            style={styles.vesselImage}
            resizeMode="contain"
          />
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
    padding: SPACING.md,
    paddingBottom: 100,
  },
  fortuneCard: {
    borderWidth: 1,
    borderColor: 'rgba(227,88,53,0.2)',
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(227,88,53,0.05)',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  fortuneTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  fortuneRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  fortuneGood: {
    color: COLORS.green400,
    fontWeight: 'bold',
    fontSize: 16,
  },
  fortuneBad: {
    color: COLORS.red400,
    fontWeight: 'bold',
    fontSize: 16,
  },
  fortuneText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  vesselTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  vesselSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  vesselContainer: {
    width: width - 32,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  vesselGlow: {
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: 999,
    backgroundColor: 'rgba(227,88,53,0.2)',
  },
  vesselImage: {
    width: '100%',
    height: '100%',
  },
  incenseContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
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
