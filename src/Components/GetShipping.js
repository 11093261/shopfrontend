import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchShippingOrder = createAsyncThunk(
  "home/fetchSellerById",
  async (sellerId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:3200/api/getshipping/${sellerId}`,
        {
          withCredentials: true // This sends cookies with the request
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching shipping order:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - token expired or invalid
        return rejectWithValue("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        // Forbidden - user doesn't have permission
        return rejectWithValue("You don't have permission to access shipping details.");
      } else if (error.response?.status === 404) {
        // Not found - shipping details don't exist
        return rejectWithValue("Shipping details not found.");
      } else if (!error.response) {
        // Network error
        return rejectWithValue("Network error. Please check your connection.");
      }
      
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shipping details"
      );
    }
  }
);

// Optional: Add a token refresh thunk if needed
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:3200/auth/refresh",
        {
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return rejectWithValue("Token refresh failed");
    }
  }
);

const getshippingSlice = createSlice({
  name: "shipping",
  initialState: {
    loading: true,
    data: [],
    error: null,
    selectedOrder: null,
    sellerLoading: false,
    sellerError: null,
    selectedSeller: null, // Added missing property
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.sellerError = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    // Add reset state reducer
    resetShippingState: (state) => {
      state.loading = true;
      state.data = [];
      state.error = null;
      state.selectedOrder = null;
      state.sellerLoading = false;
      state.sellerError = null;
      state.selectedSeller = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingOrder.pending, (state) => {
        state.sellerLoading = true;
        state.sellerError = null;
      })
      .addCase(fetchShippingOrder.fulfilled, (state, action) => {
        state.sellerLoading = false;
        state.selectedSeller = action.payload;
        state.sellerError = null;
      })
      .addCase(fetchShippingOrder.rejected, (state, action) => {
        state.sellerLoading = false;
        state.sellerError = action.payload;
      });
      
    // Optional: Handle token refresh cases if implemented
    builder
      .addCase(refreshToken.fulfilled, (state) => {
        // Token refreshed successfully
        state.error = null;
        state.sellerError = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = "Authentication failed. Please login again.";
        state.sellerError = "Authentication failed. Please login again.";
      });
  },
});

export const { clearError, setSelectedOrder, resetShippingState } = getshippingSlice.actions;
export default getshippingSlice.reducer;