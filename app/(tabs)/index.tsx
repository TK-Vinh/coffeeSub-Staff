import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';

const API_URL = 'https://coffe-subcription-3w.onrender.com/api';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const payload = JSON.parse(data);
      const { subscriptionId, coffeeCode } = payload;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(
        `${API_URL}/CoffeeRedemption?subscriptionId=${subscriptionId}&coffeeCode=${encodeURIComponent(coffeeCode)}`,
        { method: 'POST', headers }
      );
      const json = await res.json().catch(() => undefined);
      if (res.ok && json?.isSuccess) {
        alert('Ticket activated');
      } else {
        alert('Activation failed');
      }
    } catch {
      alert('Invalid code');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.messageContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.messageContainer}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ flex: 1 }}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

