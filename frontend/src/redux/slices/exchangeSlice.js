import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create exchange request
export const createExchange = createAsyncThunk(
  'exchanges/create',
  async (exchangeData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${API_URL}/exchanges`, exchangeData, config);
      toast.success(
        exchangeData.type === 'exchange' 
          ? 'Exchange request sent successfully' 
          : 'Donation request sent successfully'
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user exchanges
export const getUserExchanges = createAsyncThunk(
  'exchanges/getUserExchanges',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/exchanges/user`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get exchange by ID
export const getExchangeById = createAsyncThunk(
  'exchanges/getById',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API_URL}/exchanges/${id}`, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update exchange status
export const updateExchangeStatus = createAsyncThunk(
  'exchanges/updateStatus',
  async ({ id, statusData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(`${API_URL}/exchanges/${id}/status`, statusData, config);
      toast.success('Status updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Submit feedback
export const submitFeedback = createAsyncThunk(
  'exchanges/submitFeedback',
  async ({ id, feedbackData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${API_URL}/exchanges/${id}/feedback`,
        feedbackData,
        config
      );
      toast.success('Feedback submitted successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  exchanges: [],
  currentExchange: null,
  isLoading: false,
  error: null,
};

const exchangeSlice = createSlice({
  name: 'exchanges',
  initialState,
  reducers: {
    clearCurrentExchange: (state) => {
      state.currentExchange = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create exchange
      .addCase(createExchange.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExchange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exchanges.unshift(action.payload);
      })
      .addCase(createExchange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user exchanges
      .addCase(getUserExchanges.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserExchanges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exchanges = action.payload;
      })
      .addCase(getUserExchanges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get exchange by ID
      .addCase(getExchangeById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExchangeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExchange = action.payload;
      })
      .addCase(getExchangeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update exchange status
      .addCase(updateExchangeStatus.fulfilled, (state, action) => {
        state.currentExchange = action.payload;
        const index = state.exchanges.findIndex(ex => ex._id === action.payload._id);
        if (index !== -1) {
          state.exchanges[index] = action.payload;
        }
      })
      // Submit feedback
      .addCase(submitFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExchange = action.payload;
        const index = state.exchanges.findIndex(ex => ex._id === action.payload._id);
        if (index !== -1) {
          state.exchanges[index] = action.payload;
        }
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentExchange } = exchangeSlice.actions;
export default exchangeSlice.reducer; 