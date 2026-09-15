import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function OrderScreen() {
  const [coffeeCount, setCoffeeCount] = useState(1);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Place Your Order</Text>

      <Text style={styles.counter}>Cups of Coffee: {coffeeCount}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (coffeeCount > 1) {
              setCoffeeCount(coffeeCount - 1);
            }
          }}
        >
          <Text style={styles.buttonText}>- Remove Cup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setCoffeeCount(coffeeCount + 1)}
        >
          <Text style={styles.buttonText}>+ Add Cup</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>Minimum order is 1 cup.</Text>

      <Link
        href={{
          pathname: '/receipt',
          params: { coffeeCount: coffeeCount },
        }}
        asChild
      >
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>View Receipt</Text>
        </TouchableOpacity>
      </Link>
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
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4b2e2b',
    marginBottom: 30,
  },
  counter: {
    fontSize: 22,
    color: '#4b2e2b',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#8a5a44',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 14,
    fontSize: 13,
    color: '#8a7a70',
  },
  linkButton: {
    marginTop: 40,
    backgroundColor: '#4b2e2b',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  linkText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});