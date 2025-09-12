// HomeApi.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchProducts = createAsyncThunk(
  "home/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:3200/api/product");
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return rejectWithValue("Products not found.");
      } else if (!error.response) {
        return rejectWithValue("Network error. Please check your connection.");
      }
      
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
      const response = await axios.get(
        `http://localhost:3200/api/seller/${sellerId}`,
        {
          withCredentials: true // This sends cookies with the request
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching seller:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - token expired or invalid
        return rejectWithValue("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        // Forbidden - user doesn't have permission
        return rejectWithValue("You don't have permission to access seller details.");
      } else if (error.response?.status === 404) {
        // Not found - seller doesn't exist
        return rejectWithValue("Seller not found.");
      } else if (!error.response) {
        // Network error
        return rejectWithValue("Network error. Please check your connection.");
      }
      
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch seller"
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

const homeSlice = createSlice({
  name: "home",
  initialState: {
    loading: true,
    data: [],
    filteredData: [],
    searchTerm: '',
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
    // Add setSearchTerm reducer
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    // Add filterProducts reducer
    filterProducts: (state, action) => {
      const { searchTerm, priceRange, category, minRating } = action.payload;
      state.searchTerm = searchTerm;
      
      state.filteredData = state.data.filter(product => {
        const matchesSearch = searchTerm.trim() === '' || 
          product.name.toLowerCase().includes(searchTerm) ||
          (product.description && product.description.toLowerCase().includes(searchTerm)) ||
          (product.sellername && product.sellername.toLowerCase().includes(searchTerm));
        
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        
        const matchesCategory = category === 'all' || 
          (product.category && product.category.toLowerCase() === category);
        
        const matchesRating = product.rating >= minRating;
        
        return matchesSearch && matchesPrice && matchesCategory && matchesRating;
      });
    },
    // Add reset state reducer
    resetHomeState: (state) => {
      state.loading = true;
      state.data = [];
      state.filteredData = [];
      state.searchTerm = '';
      state.error = null;
      state.selectedSeller = null;
      state.sellerLoading = false;
      state.sellerError = null;
    }
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
        state.filteredData = action.payload;
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

export const { clearError, setSelectedSeller, setSearchTerm, filterProducts, resetHomeState } = homeSlice.actions;
export default homeSlice.reducer;