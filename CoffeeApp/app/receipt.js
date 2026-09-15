import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ReceiptScreen() {
  const { coffeeCount } = useLocalSearchParams();

  const cups = Number(coffeeCount);
  const totalBill = cups * 150;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Order Receipt</Text>

        <View style={styles.line}>
          <Text style={styles.label}>Cups Ordered</Text>
          <Text style={styles.value}>{cups}</Text>
        </View>

        <View style={styles.line}>
          <Text style={styles.label}>Price per Cup</Text>
          <Text style={styles.value}>₱150</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.total}>Total Bill: ₱{totalBill}</Text>
      </View>

      <Text style={styles.thanks}>Thank you for your order!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3ef',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4b2e2b',
    textAlign: 'center',
    marginBottom: 20,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#6b5b52',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b2e2b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0d8d2',
    marginVertical: 16,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b2e2b',
    textAlign: 'center',
  },
  thanks: {
    marginTop: 20,
    fontSize: 14,
    color: '#8a7a70',
  },
});