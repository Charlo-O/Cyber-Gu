import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Contract'>;
};

const ContractScreen: React.FC<Props> = ({ navigation }) => {
  const [isContractMade, setIsContractMade] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  const handleContract = () => {
    setIsContractMade(true);
    setTimeout(() => {
      navigation.replace('Ritual');
    }, 2000);
  };

  if (isContractMade) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0,255,255,0.1)', 'transparent']}
          style={styles.gradientBL}
        />
        <LinearGradient
          colors={['rgba(255,0,255,0.1)', 'transparent']}
          style={styles.gradientTR}
        />
        <Animated.View style={[styles.centerContent, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.contractedCircle}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa9AA1UqM5mGDTbNK9GlkftewO_il67sMAhsZAjcLhJ969zlhfuLY5R0t8U8yF0Bh42QEuJpR3dHQrKK_V4S-bTSV24OUXsktrD3p2iggOiWNOu6wRLoomur0xSlKOVKH8B9QsWGkxmvFuZW7zSGVKv4Y2xqR6PkhuW7k7LzB6bFLfz7dLLWg9J37GOnQr7OE1sJ0oTupADD2O34Tp0trTAPHr3rhNOuAeBcEqOOR8jKZVsoxnsOEHt6ZfZ7zlocel3LiofjsLRir9' }}
              style={styles.contractImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.contractedText}>契约已签订</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,255,255,0.1)', 'transparent']}
        style={styles.gradientBL}
      />
      <LinearGradient
        colors={['rgba(255,0,255,0.1)', 'transparent']}
        style={styles.gradientTR}
      />

      <View style={styles.mainContent}>
        <Text style={styles.title}>触摸核心以启动</Text>

        <TouchableOpacity onPress={handleContract} activeOpacity={0.8}>
          <Animated.View style={[styles.orbContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.glowCyan} />
            <View style={styles.glowMagenta} />
            <View style={styles.orbInner}>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAww51nU5MleDJcNvzt7KHE6JMtgQ3xR6lnedp6Aw1NtQS_GSmxfxVIG_Gcd_qp6h1Hg4mPIZMrgJ59vnlt8LKCpYwHvVr5fAwwWfCX_Ub5WcF7R6W6h7uZiw2rpHZS2eZHyeX5-X7FsVbEWzfgnTUKmCtH37TvFgm9Hqcr9XAlQ6jxFA_XlbLl5OSW8MzdwdKGcr9COKdg3YJdXQ-nHQILltFm2QUrHMdTRs11m-qLskduZ_3es-LeJAmYiVqYMa18LbtLxnPVt785' }}
                style={styles.orbImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleContract} activeOpacity={0.8}>
          <Text style={styles.buttonText}>签订契约</Text>
        </TouchableOpacity>

        <Animated.Text style={[styles.hint, { opacity: pulseAnim }]}>
          触摸以进行生物识别握手
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A051E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width * 0.5,
    height: height * 0.5,
    opacity: 0.2,
  },
  gradientTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.5,
    height: height * 0.5,
    opacity: 0.2,
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  title: {
    color: '#EAEAEA',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  orbContainer: {
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
  },
  glowCyan: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 128,
    backgroundColor: COLORS.accentCyan,
    opacity: 0.2,
  },
  glowMagenta: {
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: 96,
    backgroundColor: COLORS.accentMagenta,
    opacity: 0.1,
  },
  orbInner: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbImage: {
    width: '90%',
    height: '90%',
    opacity: 0.8,
  },
  button: {
    backgroundColor: '#DC143C',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
    marginTop: SPACING.lg,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractedCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contractImage: {
    width: 128,
    height: 128,
  },
  contractedText: {
    color: COLORS.red500,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    textShadowColor: COLORS.red500,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
});

export default ContractScreen;
