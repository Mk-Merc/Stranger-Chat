import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatScreenProps {
  messages: { id: string, text: string, sender: 'ME' | 'STRANGER' }[];
  onSendMessage: (text: string) => void;
  onLeave: () => void;
}

export const ChatScreen = ({ messages, onSendMessage, onLeave }: ChatScreenProps) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() !== '') {
      onSendMessage(inputText);

      setInputText('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Stranger</Text>
        <Button tone="danger" appearance="ghost" size="sm" onPress={onLeave}>
          Leave
        </Button>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble, 
              message.sender === 'ME' ? styles.myMessage : styles.theirMessage
            ]}
          >
            <Text style={[
              styles.messageText, 
              message.sender === 'ME' ? styles.myMessageText : styles.theirMessageText
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Input 
            value={inputText} 
            onChangeText={setInputText} 
            placeholder="Type a message..." 
          />
        </View>
        <Button onPress={handleSend} style={styles.sendButton}>
          Send
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1, 
    borderColor: '#DDDDDD',
  },
  headerText: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Manrope'
  },
  messagesContainer: { 
    flex: 1, 
    padding: 10 
  },
  messageBubble: { 
    padding: 12, 
    borderRadius: 20, 
    marginBottom: 10, 
    maxWidth: '80%' 
  },
  myMessage: { 
    backgroundColor: '#007AFF', 
    alignSelf: 'flex-end' 
  },
  theirMessage: { 
    backgroundColor: '#E5E5EA', 
    alignSelf: 'flex-start' 
  },
  messageText: { 
    fontSize: 16,
    fontFamily: 'Manrope'
  },
  myMessageText: {
    color: '#FFFFFF'
  },
  theirMessageText: {
    color: '#000000'
  },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 10, 
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1, 
    borderColor: '#DDDDDD',
  },
  inputWrapper: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    height: 40,
    paddingHorizontal: 20,
  }
});