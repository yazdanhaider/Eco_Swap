import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import exchangeReducer from './slices/exchangeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    exchanges: exchangeReducer,
  },
});

export default store; 