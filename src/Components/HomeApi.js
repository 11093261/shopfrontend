import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const getaccessToken = () => {
  return localStorage.getItem("token");
};

export const fetchProducts = createAsyncThunk(
  "home/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      
      const response = await axios.get("http://localhost:3200/api/product");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

export const fetchSellerById = createAsyncThunk(
  "home/fetchSellerById",
  async (sellerId, { rejectWithValue }) => {
    try {
      const accessToken = getaccessToken();
      const response = await axios.get(
        `http://localhost:3200/api/seller/${sellerId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch seller"
      );
    }
  }
);

const homeSlice = createSlice({
  name: "home",
  initialState: {
    loading: true,
    data: [],
    error: null,
    selectedSeller: null,
    sellerLoading: false,
    sellerError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.sellerError = null;
    },
    setSelectedSeller: (state, action) => {
      state.selectedSeller = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSellerById.pending, (state) => {
        state.sellerLoading = true;
        state.sellerError = null;
      })
      .addCase(fetchSellerById.fulfilled, (state, action) => {
        state.sellerLoading = false;
        state.selectedSeller = action.payload;
        state.sellerError = null;
      })
      .addCase(fetchSellerById.rejected, (state, action) => {
        state.sellerLoading = false;
        state.sellerError = action.payload;
      });
  },
});

export const { clearError, setSelectedSeller } = homeSlice.actions;
export default homeSlice.reducer;