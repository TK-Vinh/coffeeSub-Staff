import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';

const API_URL = 'https://coffe-subcription-3w.onrender.com/api';

export default function CheckoutScreen() {
  const { subscriptionId, coffeeCode } = useLocalSearchParams<{
    subscriptionId: string;
    coffeeCode: string;
  }>();
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  const activate = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(
        `${API_URL}/CoffeeRedemption?subscriptionId=${subscriptionId}&coffeeCode=${encodeURIComponent(coffeeCode ?? '')}`,
        { method: 'POST', headers }
      );
      const json = await res.json().catch(() => undefined);
      if (res.ok && json?.isSuccess) {
        alert('Ticket activated');
      } else {
        alert('Activation failed');
      }
    } catch {
      alert('Activation failed');
    } finally {
      router.replace('/');
    }
  };

  const cancel = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Subscription: {subscriptionId}</Text>
      <Text style={styles.text}>Code: {coffeeCode}</Text>
      <View style={styles.button}>
        <Button title="Activate" onPress={activate} />
      </View>
      <View style={styles.button}>
        <Button title="Cancel" onPress={cancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  text: { marginBottom: 8 },
  button: { marginTop: 8, width: '60%' },
});

