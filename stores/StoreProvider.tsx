"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import {
  type AppStoreBundle,
  makeStore,
  setupListeners,
} from "./store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const bundleRef = useRef<AppStoreBundle | null>(null);
  if (!bundleRef.current) {
    bundleRef.current = makeStore();
  }

  useEffect(() => {
    const bundle = bundleRef.current;
    if (!bundle) return;
    const unsubscribe = setupListeners(bundle.store.dispatch);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Provider store={bundleRef.current.store}>
      <PersistGate loading={null} persistor={bundleRef.current.persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}



