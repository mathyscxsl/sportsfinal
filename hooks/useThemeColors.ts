/**
 * Hook pour accéder aux couleurs du thème actuel
 * Détecte automatiquement le mode système (light/dark)
 */

import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export function useThemeColors() {
  const colorScheme = useColorScheme();

  // Utilise le thème système automatiquement
  return colorScheme === 'dark' ? Colors.dark : Colors.light;
}
