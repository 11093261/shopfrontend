import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
// const getorders = {
//   getorder:`http://localhost:3200/api/order/getorders/${id}`,
//   getrefresh:"http://localhost:3200/auth/refresh"
// }

export const fetchOrderProduct = createAsyncThunk(
  "/api/getseller",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/order/getorders/${id}`,
        {
          withCredentials: true // This sends cookies with the request
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order product:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - token expired or invalid
        return rejectWithValue("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        // Forbidden - user doesn't have permission
        return rejectWithValue("You don't have permission to access this resource.");
      } else if (error.response?.status === 404) {
        // Not found - order doesn't exist
        return rejectWithValue("Order not found.");
      } else if (!error.response) {
        // Network error
        return rejectWithValue("Network error. Please check your connection.");
      }
      
      return rejectWithValue(error.response?.data?.message || "Failed to fetch order details");
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

const orderproductSlice = createSlice({
  name: "OrderProduct",
  initialState: {
    loading: true,
    data: [],
    error: null
  },
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    // Reset state when component unmounts
    resetOrderState: (state) => {
      state.loading = true;
      state.data = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
    // Optional: Handle token refresh cases if implemented
    builder
      .addCase(refreshToken.fulfilled, (state) => {
        // Token refreshed successfully
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = "Authentication failed. Please login again.";
      });
  }
});

export const { clearError, resetOrderState } = orderproductSlice.actions;
export default orderproductSlice.reducer;