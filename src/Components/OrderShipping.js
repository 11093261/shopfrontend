import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchShippingAddress = createAsyncThunk(
  "shipping/fetchShippingAddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:3200/api/shipping",
        {
          withCredentials: true 
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shipping address"
      );
    }
  }
);

export const createOrUpdateShipping = createAsyncThunk(
  "shipping/createOrUpdateShipping",
  async (shippingData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3200/api/shipping",
        shippingData,
        {
          withCredentials: true // Send cookies automatically
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save shipping address"
      );
    }
  }
);

const shippingSlice = createSlice({
  name: "shipping",
  initialState: {
    loading: true,
    data: null,
    error: null,
    selectedShipping: null,
    saveLoading: false,
    saveError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    setSelectedShipping: (state, action) => {
      state.selectedShipping = action.payload;
    },
    clearSaveError: (state) => {
      state.saveError = null;
    },
    resetShippingState: (state) => {
      state.loading = true;
      state.data = null;
      state.error = null;
      state.selectedShipping = null;
      state.saveLoading = false;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        
        // Handle different response structures
        if (action.payload && action.payload.shippingAddress) {
          state.selectedShipping = action.payload.shippingAddress;
        } else if (action.payload && Array.isArray(action.payload) && action.payload.length > 0) {
          state.selectedShipping = action.payload[0].shippingAddress || action.payload[0];
        } else if (action.payload) {
          state.selectedShipping = action.payload;
        }
        
        state.error = null;
      })
      .addCase(fetchShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : "Failed to fetch shipping address";
      })

      .addCase(createOrUpdateShipping.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
      })
      .addCase(createOrUpdateShipping.fulfilled, (state, action) => {
        state.saveLoading = false;
        
        // Update selected shipping address with the new data
        if (action.payload && action.payload.shippingAddress) {
          state.selectedShipping = action.payload.shippingAddress;
        } else if (action.payload) {
          state.selectedShipping = action.payload;
        }
        
        // Also update the data field if it exists
        if (state.data && Array.isArray(state.data)) {
          // Find and update existing address or add new one
          const existingIndex = state.data.findIndex(item => 
            item._id === action.payload._id || item.id === action.payload.id
          );
          if (existingIndex !== -1) {
            state.data[existingIndex] = action.payload;
          } else {
            state.data.push(action.payload);
          }
        } else if (state.data && typeof state.data === 'object') {
          // If data is a single object, replace it
          state.data = action.payload;
        }
        
        state.saveError = null;
      })
      .addCase(createOrUpdateShipping.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = typeof action.payload === 'string' 
          ? action.payload 
          : "Failed to save shipping address";
      });
  },
});

export const { clearError, setSelectedShipping, clearSaveError, resetShippingState } = shippingSlice.actions;
export default shippingSlice.reducer;