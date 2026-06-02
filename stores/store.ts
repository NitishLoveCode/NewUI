import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistReducer,
  persistStore,
  type PersistConfig,
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
import codingStepsSlice from "./codingSteps/codingStepsSlice";
import problomsSetSlice  from "./problomsSet/problomsSetSlice";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  activeStep: activeStepSlice,
  codingSteps: codingStepsSlice,
  problomsSet: problomsSetSlice
});

type RootReducerState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootReducerState> = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["activeStep"],
};

const persistedReducer = persistReducer<RootReducerState>(persistConfig, rootReducer);

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
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];

export { setupListeners };
