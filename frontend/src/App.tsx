import { View, Text, StyleSheet, Modal } from 'react-native';
import { useSocket } from './hooks/useSocket';
import { HomeScreen } from './pages/HomeScreen';
import { WaitingScreen } from './pages/WaitingScreen';
import { ThemeProvider as ArloThemeProvider } from '@/lib/arloui/theme-provider';
import { useArloFonts } from '@/lib/arloui/fonts';
import { ChatScreen } from './pages/ChatScreen';
import { Button } from '@/components/ui/button';

export default function App() {
  const [fontsLoaded] = useArloFonts();
  
  const { 
    appState, 
    findStranger, 
    disconnect, 
    messages, 
    chatEndedMessage, 
    cancelSearch,
    sendMessage,
    clearChatEndedMessage
  } = useSocket();

  if (!fontsLoaded) return null;

  return (
    <ArloThemeProvider>
      {/* Screens (Pages)*/}
      {appState === 'HOME' && <HomeScreen onFind={findStranger} />}
      {appState === 'WAITING' && <WaitingScreen onCancel={cancelSearch} />}
      
      {appState === 'CHATTING' && (
        <ChatScreen 
          messages={messages} 
          onSendMessage={sendMessage} 
          onLeave={disconnect} 
        />
      )}

      {/* Universal Chat Ended Modal */}
      {/* !! = double negation: converts the string/null state into a boolean (true/false) for the modal's visibility */}
      <Modal animationType="fade" transparent={true} visible={!!chatEndedMessage}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chat Ended</Text>
            <Text style={styles.modalText}>{chatEndedMessage}</Text>
            <Button onPress={clearChatEndedMessage} style={styles.modalButton}>
              OK
            </Button>
          </View>
        </View>
      </Modal>
    </ArloThemeProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#FFFFFF',
    padding: 24, 
    borderRadius: 20, 
    width: '85%', 
    alignItems: 'center' 
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#000000',
    fontFamily: 'Manrope',
    marginBottom: 12 
  },
  modalText: { 
    fontSize: 16, 
    color: '#333333',
    fontFamily: 'Manrope',
    textAlign: 'center', 
    marginBottom: 24 
  },
  modalButton: { 
    width: '100%' 
  }
});