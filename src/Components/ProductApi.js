import {createSlice} from "@reduxjs/toolkit"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
const BaseUrl = "http://localhost:3200/api/seller"
export const postSellerProduct = createAsyncThunk("/api/products",async(payload)=>{
    const response = await axios.post(BaseUrl,payload,{
        withCredentials:true
    })
    return response.data
})
const sellerSlice = createSlice({
    name:"products",
    initialState:{
        loading:false,
        data:[]
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(postSellerProduct.pending,(state,action)=>{
            state.loading = true
        })
        builder.addCase(postSellerProduct.fulfilled,(state,action)=>{
            state.loading = false
            state.data.push(action.payload)

        })
    }

})
export const productList = (state)=>state.seller.data


export default sellerSlice.reducer