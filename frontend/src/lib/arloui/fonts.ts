import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

/**
 * Loads Manrope and Space Mono.
 *
 * A dev build that uses the expo-font plugin registers every Manrope weight
 * under the family name `Manrope`, so `fontFamily: 'Manrope'` plus
 * `fontWeight` resolves. `useFonts` cannot build that family. Expo Go
 * therefore needs the weight-specific name from `arloFont`.
 *
 * `fontFamilies.mono` is the string `'Space Mono'`, which this loader registers.
 * `t.typography.*` does not include a `fontFamily` — set one on the `Text`.
 *
 * ```tsx
 * const [fontsLoaded] = useArloFonts();
 * if (!fontsLoaded) return null;
 * ```
 */
export function arloFont(weight: '400' | '500' | '600' | '700' | 400 | 500 | 600 | 700 = 400) {
  switch (String(weight)) {
    case '500':
      return 'Manrope_500Medium';
    case '600':
      return 'Manrope_600SemiBold';
    case '700':
      return 'Manrope_700Bold';
    default:
      return 'Manrope_400Regular';
  }
}

export function useArloFonts() {
  return useFonts({
    Manrope: Manrope_400Regular,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    'Space Mono': SpaceMono_400Regular,
  });
}
