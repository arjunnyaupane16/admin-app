import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

export default function SwipeBackWrapper({ children }) {
  const router = useRouter();

  const onHandlerStateChange = useCallback(({ nativeEvent }) => {
    if (
      nativeEvent.state === State.END &&
      nativeEvent.translationX > 100 // swipe right by 100 px threshold
    ) {
      if (router.canGoBack()) {
        router.back();
      }
    }
  }, [router]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onHandlerStateChange={onHandlerStateChange}>
        <GestureHandlerRootView style={styles.container}>
          {children}
        </GestureHandlerRootView>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
