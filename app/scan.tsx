import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useRouter } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';

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

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    setScanned(true);
    try {
      const payload = JSON.parse(data);
      const { subscriptionId, coffeeCode } = payload;
      router.replace({ pathname: '/checkout', params: { subscriptionId: String(subscriptionId), coffeeCode } });
    } catch {
      alert('Invalid code');
      setScanned(false);
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
      {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

