import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { api } from "./api";
import activeStepSlice from "./codingPractice/activeStepSlice";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  activeStep: activeStepSlice,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["activeStep"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(api.middleware),
  });
  const persistor = persistStore(store);
  return { store, persistor };
};

export type AppStoreBundle = ReturnType<typeof makeStore>;
export type AppStore = AppStoreBundle["store"];
export type AppPersistor = AppStoreBundle["persistor"];
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export { setupListeners };
