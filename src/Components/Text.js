import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios"
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
export const getTextMessage = createAsyncThunk(
  "/api/gettext",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_UR}/api/getsellertext`,
        {
          withCredentials: true, 
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

const messagingSlice = createSlice({
  name: "message",
  initialState: {
    loading: false,
    data: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTextMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTextMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(getTextMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch messages";
      });
  },
});

export default messagingSlice.reducer;