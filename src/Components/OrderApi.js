import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"

// const BaseUrl = "http://localhost:3200/api/orders/postorders"
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';

export const postOrders = createAsyncThunk("/api/orders", async (payload) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/orders/postorders`, payload, {
            withCredentials: true
        })
        return response.data
    } catch (error) {
        console.log("Order submission error:", error)
        throw error 
    }
})

const orderSlice = createSlice({
    name: "orders",
    initialState: {
        loading: false,
        data: [],
        error: null
    },
    reducers: {
        clearOrderError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(postOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(postOrders.fulfilled, (state, action) => {
                state.loading = false
                state.data.push(action.payload)
                state.error = null
            })
            .addCase(postOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || "Failed to place order"
            })
    }
})

export const { clearOrderError } = orderSlice.actions
export default orderSlice.reducer