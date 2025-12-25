import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useConfig, DEFAULT_TRAIT_PROMPTS, ModelConfig } from '../context/ConfigContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Grimoire'>;
};

type ModelType = 'painting' | 'video' | 'text';

const MODEL_TYPE_INFO: Record<ModelType, { title: string; icon: string; color: string; desc: string }> = {
  painting: { title: '绘画模型', icon: 'brush', color: COLORS.accentCyan, desc: '用于生成替身图像' },
  video: { title: '视频模型', icon: 'videocam', color: COLORS.accentMagenta, desc: '用于生成降智蛊视频' },
  text: { title: '文本模型', icon: 'chat', color: COLORS.primary, desc: '用于文本生成和对话' },
};

const GrimoireScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    paintingConfig,
    setPaintingConfig,
    videoConfig,
    setVideoConfig,
    textConfig,
    setTextConfig,
    customPrompts,
    setCustomPrompt,
    resetToDefaults,
  } = useConfig();

  // 临时编辑状态
  const [editingModel, setEditingModel] = useState<ModelType | null>(null);
  const [tempConfig, setTempConfig] = useState<ModelConfig>({ baseUrl: '', apiKey: '', model: '' });
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = useState('');

  // 获取当前配置
  const getConfig = (type: ModelType): ModelConfig => {
    switch (type) {
      case 'painting': return paintingConfig;
      case 'video': return videoConfig;
      case 'text': return textConfig;
    }
  };

  // 保存配置
  const saveConfig = async (type: ModelType, config: ModelConfig) => {
    switch (type) {
      case 'painting': await setPaintingConfig(config); break;
      case 'video': await setVideoConfig(config); break;
      case 'text': await setTextConfig(config); break;
    }
  };

  const handleEditModel = (type: ModelType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingModel(type);
    setTempConfig({ ...getConfig(type) });
  };

  const handleSaveModel = async () => {
    if (editingModel) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await saveConfig(editingModel, tempConfig);
      setEditingModel(null);
      Alert.alert('✓ 配置已保存', `${MODEL_TYPE_INFO[editingModel].title}配置已更新`);
    }
  };

  const handleEditPrompt = (traitKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingPrompt(traitKey);
    setTempPrompt(customPrompts[traitKey] || DEFAULT_TRAIT_PROMPTS[traitKey] || '');
  };

  const handleSavePrompt = async () => {
    if (editingPrompt) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await setCustomPrompt(editingPrompt, tempPrompt);
      setEditingPrompt(null);
    }
  };

  const handleReset = async () => {
    Alert.alert(
      '⚠ 重置确认',
      '确定要将所有配置恢复为默认值吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定重置',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await resetToDefaults();
            Alert.alert('已重置', '所有配置已恢复默认');
          },
        },
      ]
    );
  };

  // 渲染模型配置卡片
  const renderModelCard = (type: ModelType) => {
    const info = MODEL_TYPE_INFO[type];
    const config = getConfig(type);
    return (
      <TouchableOpacity
        key={type}
        style={[styles.modelCard, { borderColor: info.color }]}
        onPress={() => handleEditModel(type)}
      >
        <View style={styles.modelCardHeader}>
          <MaterialIcons name={info.icon as any} size={24} color={info.color} />
          <Text style={[styles.modelCardTitle, { color: info.color }]}>{info.title}</Text>
        </View>
        <Text style={styles.modelCardDesc}>{info.desc}</Text>
        <View style={styles.modelCardInfo}>
          <Text style={styles.modelCardLabel}>模型: </Text>
          <Text style={styles.modelCardValue} numberOfLines={1}>{config.model || '未配置'}</Text>
        </View>
        <View style={styles.modelCardInfo}>
          <Text style={styles.modelCardLabel}>API Key: </Text>
          <Text style={styles.modelCardValue}>
            {config.apiKey ? '••••••••' + config.apiKey.slice(-4) : '未配置'}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" style={styles.modelCardArrow} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.accentCyan} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>魔法书系统</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <MaterialIcons name="refresh" size={20} color={COLORS.accentMagenta} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Model Configuration Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="settings" size={20} color={COLORS.accentCyan} />
            <Text style={styles.sectionTitle}>大模型配置</Text>
          </View>
          <Text style={styles.sectionDesc}>配置绘画、视频、文本大模型（OpenAI兼容格式）</Text>
          {(['painting', 'video', 'text'] as ModelType[]).map(renderModelCard)}
        </View>

        {/* Custom Prompts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>咒语编辑器</Text>
          </View>
          <Text style={styles.sectionDesc}>自定义每种替身的生成咒语</Text>
          {Object.keys(DEFAULT_TRAIT_PROMPTS).map((traitKey) => (
            <TouchableOpacity
              key={traitKey}
              style={styles.promptItem}
              onPress={() => handleEditPrompt(traitKey)}
            >
              <View style={styles.promptInfo}>
                <Text style={styles.promptLabel}>{traitKey}</Text>
                <Text style={styles.promptPreview} numberOfLines={1}>
                  {customPrompts[traitKey]?.substring(0, 40)}...
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Custom Trait */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('即将推出', '自定义替身类型功能正在开发中...');
          }}
        >
          <MaterialIcons name="add-circle-outline" size={24} color={COLORS.accentCyan} />
          <Text style={styles.addButtonText}>添加自定义替身类型</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Model Config Editor Modal */}
      <Modal visible={!!editingModel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.configModal]}>
            <Text style={styles.modalTitle}>
              配置{editingModel ? MODEL_TYPE_INFO[editingModel].title : ''}
            </Text>
            
            <Text style={styles.inputLabel}>Base URL</Text>
            <TextInput
              style={styles.configInput}
              value={tempConfig.baseUrl}
              onChangeText={(text) => setTempConfig({ ...tempConfig, baseUrl: text })}
              placeholder="https://api.example.com/v1"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>API Key</Text>
            <TextInput
              style={styles.configInput}
              value={tempConfig.apiKey}
              onChangeText={(text) => setTempConfig({ ...tempConfig, apiKey: text })}
              placeholder="sk-xxxxxxxx..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>模型名称</Text>
            <TextInput
              style={styles.configInput}
              value={tempConfig.model}
              onChangeText={(text) => setTempConfig({ ...tempConfig, model: text })}
              placeholder="gpt-4o / sora-2 / ..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.promptActions}>
              <TouchableOpacity
                style={styles.promptCancelBtn}
                onPress={() => setEditingModel(null)}
              >
                <Text style={styles.promptCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.promptSaveBtn} onPress={handleSaveModel}>
                <Text style={styles.promptSaveText}>保存配置</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Prompt Editor Modal */}
      <Modal visible={!!editingPrompt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.promptModal]}>
            <Text style={styles.modalTitle}>编辑咒语: {editingPrompt}</Text>
            <TextInput
              style={styles.promptEditor}
              value={tempPrompt}
              onChangeText={setTempPrompt}
              placeholder="输入生成提示词..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <View style={styles.promptActions}>
              <TouchableOpacity
                style={styles.promptCancelBtn}
                onPress={() => setEditingPrompt(null)}
              >
                <Text style={styles.promptCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.promptSaveBtn} onPress={handleSavePrompt}>
                <Text style={styles.promptSaveText}>保存咒语</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  resetButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(0, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.1)',
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  sectionDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    color: COLORS.white,
    fontSize: 14,
  },
  saveButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.accentCyan,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  modelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  modelName: {
    color: COLORS.accentMagenta,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modelDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  promptInfo: {
    flex: 1,
  },
  promptLabel: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  promptPreview: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    color: COLORS.accentCyan,
    fontSize: 14,
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    padding: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modelOptionSelected: {
    borderWidth: 1,
    borderColor: COLORS.accentCyan,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
  },
  modelOptionName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modelOptionDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  modalClose: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  promptModal: {
    maxHeight: '80%',
  },
  promptEditor: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(227, 88, 53, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.white,
    fontSize: 13,
    minHeight: 150,
  },
  promptActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  promptCancelBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  promptCancelText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  promptSaveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  promptSaveText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Model card styles
  modelCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  modelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  modelCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  modelCardDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  modelCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modelCardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  modelCardValue: {
    color: COLORS.white,
    fontSize: 12,
    flex: 1,
  },
  modelCardArrow: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
  },
  // Config modal styles
  configModal: {
    maxHeight: '85%',
  },
  inputLabel: {
    color: COLORS.accentCyan,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  configInput: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    color: COLORS.white,
    fontSize: 14,
  },
});

export default GrimoireScreen;
