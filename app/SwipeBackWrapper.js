import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export default function SwipeBackWrapper({ children }) {
  const router = useRouter();

  const onHandlerStateChange = useCallback(({ nativeEvent }) => {
    if (
      nativeEvent.state === State.END &&
      nativeEvent.translationX > 100
    ) {
      if (router.canGoBack()) {
        router.back();
      }
    }
  }, [router]);

  // On web, avoid PanGestureHandler to prevent WeakMap errors
  if (Platform.OS === 'web') {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
      <View style={styles.container}>{children}</View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
