import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';

export const getUserText = createAsyncThunk(
  "/api/usertext",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${ API_BASE_URL}/api/getChat`, {
        withCredentials: true,
      });
      return [...response.data];
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user messages"
      );
    }
  }
);

const userSlice = createSlice({
  name: "text",
  initialState: {
    loading: false,
    data: [],
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getUserText.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserText.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getUserText.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
      });
  },
});

export default userSlice.reducer;