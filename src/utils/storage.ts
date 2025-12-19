import AsyncStorage from '@react-native-async-storage/async-storage';

const EFFIGY_IMAGE_KEY = 'effigyImage';
const EFFIGY_TRAIT_KEY = 'effigyTrait';

export async function saveEffigyImage(imageUrl: string): Promise<void> {
  try {
    await AsyncStorage.setItem(EFFIGY_IMAGE_KEY, imageUrl);
  } catch (error) {
    console.error('Failed to save effigy image:', error);
  }
}

export async function getEffigyImage(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(EFFIGY_IMAGE_KEY);
  } catch (error) {
    console.error('Failed to get effigy image:', error);
    return null;
  }
}

export async function saveEffigyTrait(trait: string): Promise<void> {
  try {
    await AsyncStorage.setItem(EFFIGY_TRAIT_KEY, trait);
  } catch (error) {
    console.error('Failed to save effigy trait:', error);
  }
}

export async function getEffigyTrait(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(EFFIGY_TRAIT_KEY);
  } catch (error) {
    console.error('Failed to get effigy trait:', error);
    return null;
  }
}
