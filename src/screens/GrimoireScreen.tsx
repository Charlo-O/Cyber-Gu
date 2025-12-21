import React, { useState } from 'react';
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
import { useConfig, AVAILABLE_MODELS, DEFAULT_TRAIT_PROMPTS } from '../context/ConfigContext';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Grimoire'>;
};

const GrimoireScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const {
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    customPrompts,
    setCustomPrompt,
    resetToDefaults,
  } = useConfig();

  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = useState('');
  const [showModelPicker, setShowModelPicker] = useState(false);

  const handleSaveApiKey = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setApiKey(tempApiKey);
    Alert.alert('✓ 灵力源已更新', '新的 API Key 已生效');
  };

  const handleSelectModel = async (modelId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setSelectedModel(modelId);
    setShowModelPicker(false);
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
            setTempApiKey(apiKey);
            Alert.alert('已重置', '所有配置已恢复默认');
          },
        },
      ]
    );
  };

  const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel);

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
        {/* API Key Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="vpn-key" size={20} color={COLORS.accentCyan} />
            <Text style={styles.sectionTitle}>灵力源 (API Key)</Text>
          </View>
          <Text style={styles.sectionDesc}>输入你的 ModelScope API Key 以获取更多召唤次数</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={tempApiKey}
              onChangeText={setTempApiKey}
              placeholder="ms-xxxxxxxx-xxxx-xxxx..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              secureTextEntry
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveApiKey}>
              <MaterialIcons name="check" size={20} color={COLORS.backgroundDark} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Model Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="auto-awesome" size={20} color={COLORS.accentMagenta} />
            <Text style={styles.sectionTitle}>召唤阵法 (模型选择)</Text>
          </View>
          <Text style={styles.sectionDesc}>不同的阵法产生不同风格的替身</Text>
          <TouchableOpacity
            style={styles.modelSelector}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowModelPicker(true);
            }}
          >
            <View>
              <Text style={styles.modelName}>{selectedModelInfo?.name || '未选择'}</Text>
              <Text style={styles.modelDesc}>{selectedModelInfo?.description}</Text>
            </View>
            <MaterialIcons name="expand-more" size={24} color={COLORS.accentCyan} />
          </TouchableOpacity>
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

      {/* Model Picker Modal */}
      <Modal visible={showModelPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择召唤阵法</Text>
            {AVAILABLE_MODELS.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelOption,
                  selectedModel === model.id && styles.modelOptionSelected,
                ]}
                onPress={() => handleSelectModel(model.id)}
              >
                <View>
                  <Text style={styles.modelOptionName}>{model.name}</Text>
                  <Text style={styles.modelOptionDesc}>{model.description}</Text>
                </View>
                {selectedModel === model.id && (
                  <MaterialIcons name="check-circle" size={24} color={COLORS.accentCyan} />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowModelPicker(false)}
            >
              <Text style={styles.modalCloseText}>关闭</Text>
            </TouchableOpacity>
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
});

export default GrimoireScreen;
