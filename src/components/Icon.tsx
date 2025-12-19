import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface IconProps {
  name: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = COLORS.white 
}) => {
  return <MaterialIcons name={name} size={size} color={color} />;
};

// 图标名称映射 (Material Symbols -> MaterialIcons)
export const ICON_MAP = {
  'arrow_back_ios': 'arrow-back-ios',
  'arrow_back_ios_new': 'arrow-back-ios',
  'arrow_back': 'arrow-back',
  'menu': 'menu',
  'notifications': 'notifications',
  'temple_buddhist': 'temple-buddhist',
  'person_add': 'person-add',
  'cycle': 'loop',
  'photo_camera': 'photo-camera',
  'add_photo_alternate': 'add-photo-alternate',
  'close': 'close',
  'refresh': 'refresh',
  'progress_activity': 'hourglass-empty',
  'favorite': 'favorite',
  'psychology': 'psychology',
  'auto_awesome': 'auto-awesome',
  'skull': 'dangerous',
  'spa': 'spa',
  'security': 'security',
  'science': 'science',
  'quiz': 'quiz',
  'sentiment_very_dissatisfied': 'sentiment-very-dissatisfied',
  'radar': 'radar',
  'cable': 'cable',
  'content_paste': 'content-paste',
  'upload_file': 'upload-file',
  'draw': 'draw',
  'mic': 'mic',
  'bolt': 'bolt',
  'input': 'input',
  'local_fire_department': 'local-fire-department',
  'water_drop': 'water-drop',
  'casino': 'casino',
  'play_circle': 'play-circle',
  'auto_fix_high': 'auto-fix-high',
} as const;
