import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
// const old_url = {
//   getorder:"http://localhost:3200/api/orders/getorders",
//   refresorder:"http://localhost:3200/auth/refresh",
// }

export const fetchOrderInfo = createAsyncThunk(
  "/api/getseller",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/getorders`,
        {
          withCredentials: true // This sends cookies with the request
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching order info:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - token expired or invalid
        return rejectWithValue("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        // Forbidden - user doesn't have permission
        return rejectWithValue("You don't have permission to access this resource.");
      } else if (!error.response) {
        // Network error
        return rejectWithValue("Network error. Please check your connection.");
      }
      
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// Optional: Add a token refresh thunk if needed
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/refresh`,
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

const orderInfo = createSlice({
  name: "OrderProduct",
  initialState: {
    loading: true,
    data: [],
    error: null
  },
  reducers: {
    // Optional: Add a clear error reducer
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchOrderInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
    // Optional: Handle token refresh cases if implemented
    builder
      .addCase(refreshToken.fulfilled, (state) => {
        // Token refreshed successfully, you might want to retry the original request
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = "Authentication failed. Please login again.";
      });
  }
});

export const { clearError } = orderInfo.actions;
export default orderInfo.reducer;