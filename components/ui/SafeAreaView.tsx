/**
 * SafeAreaView Component
 * Wrapper pour utiliser le bon SafeAreaView (de react-native-safe-area-context)
 */

import { SafeAreaView as RNCSafeAreaView } from 'react-native-safe-area-context';

// Re-export direct pour simplifier les imports
export const SafeAreaView = RNCSafeAreaView;
