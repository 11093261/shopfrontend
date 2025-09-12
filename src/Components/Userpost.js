import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const getUserText = createAsyncThunk(
  "/api/usertext",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:3200/api/getChat", {
        withCredentials: true, // Enable cookies to be sent automatically
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