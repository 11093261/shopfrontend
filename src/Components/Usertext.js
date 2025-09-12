import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const postTextMessage = createAsyncThunk(
  "/api/gettext",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:3200/api/postsellertext",
        payload,
        {
          withCredentials: true, // Enable cookies to be sent automatically
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to post message"
      );
    }
  }
);

const messageSlice = createSlice({
  name: "message",
  initialState: {
    loading: false,
    data: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(postTextMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postTextMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
        state.error = null;
      })
      .addCase(postTextMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to post message";
      });
  },
});

export default messageSlice.reducer;