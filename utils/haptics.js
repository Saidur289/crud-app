import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (type = 'light') => {
  try {
    if (Platform.OS === 'web') return;
    if (type === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (type === 'heavy') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  } catch (e) {
    // Graceful no-op on unsupported devices/environments
  }
};
