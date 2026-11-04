import { View, Text } from 'react-native';
import { useSocket } from './hooks/useSocket';
import { HomeScreen } from './pages/HomeScreen';
import { WaitingScreen } from './pages/WaitingScreen';
import { ThemeProvider as ArloThemeProvider } from '@/lib/arloui/theme-provider';
import { useArloFonts } from '@/lib/arloui/fonts';

export default function App() {
  const [fontsLoaded] = useArloFonts();
  const { appState, findStranger, disconnect } = useSocket();

  if (!fontsLoaded) return null;

  return (
    <ArloThemeProvider>
      {appState === 'HOME' && <HomeScreen onFind={findStranger} />}
      {appState === 'WAITING' && <WaitingScreen onCancel={disconnect} />}
      
      {appState === 'CHATTING' && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Matched! (Chat will go here)</Text>
        </View>
      )}
    </ArloThemeProvider>
  );
}