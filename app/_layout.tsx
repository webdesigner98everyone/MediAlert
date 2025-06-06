import { Slot, useRouter, useSegments, useNavigationContainerRef } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // cambiar a true si ya inició sesión

  // Esperamos que el layout esté listo antes de redirigir
  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inTabsGroup = segments[0] === '(tabs)';
    if (!isLoggedIn && inTabsGroup) {
      router.replace('/login');
    }
  }, [isReady, isLoggedIn, segments]);

  return <Slot />;
}
