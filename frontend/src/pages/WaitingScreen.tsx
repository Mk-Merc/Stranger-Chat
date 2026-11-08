import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';

export const WaitingScreen = ({ onCancel }: { onCancel: () => void }) => {
  return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#000000" />
      <Text style={[styles.subtitle, { marginTop: 20 }]}>Looking for a stranger...</Text>
      <Button tone="danger" style={[styles.button, { marginTop: 40 }]} onPress={onCancel}>
        Cancel
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#FFFFFF' 
  },
  subtitle: { 
    fontSize: 22, 
    textAlign: 'center', 
    lineHeight: 30, 
    color: '#333333', 
    fontWeight: '600', 
    fontFamily: 'Manrope' 
  },
  button: { 
    width: '90%', 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }
});