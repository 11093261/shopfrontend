import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const getaccessToken = () => {
  return localStorage.getItem("token");
};
export const fetchShippingOrder = createAsyncThunk(
  "home/fetchSellerById",
  async ({sellerId,rejectWithValue}) => {
    try {
      const accessToken = getaccessToken();
      const response = await axios.get(
        `http://localhost:3200/api/getshipping/${sellerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch shipping details"
      );
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
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.sellerError = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
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
  },
});

export const { clearError, setSelectedOrder } = getshippingSlice.actions;
export default getshippingSlice.reducer;