import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';

export const HomeScreen = ({ onFind }: { onFind: () => void }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.title}>Chat Stranger</Text>
        <Text style={styles.subtitle}>Talk to random people anonymously.</Text>
      </View>
      <View style={styles.middleSection}>
        <Button size="lg" onPress={onFind} style={styles.button} labelStyle={styles.buttonLabel}>
          Find Stranger
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#FFFFFF' 
  },
  topSection: { 
    marginTop: 100, 
    alignItems: 'center', 
    paddingHorizontal: 10 
  },
  title: { 
    fontSize: 56, 
    lineHeight: 72, 
    marginBottom: 16, 
    textAlign: 'center', 
    color: '#000000', 
    fontWeight: '900', 
    fontFamily: 'Manrope' 
  },
  subtitle: { 
    fontSize: 22, 
    textAlign: 'center', 
    lineHeight: 30, 
    color: '#333333', 
    fontWeight: '600', 
    fontFamily: 'Manrope' 
  },
  middleSection: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  button: { 
    width: '90%', 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  buttonLabel: {
    lineHeight: 26,
    includeFontPadding: false
  }
});