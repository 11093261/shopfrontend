import { createAsyncThunk } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"
const getaccesssToken = () =>{
    return localStorage.getItem("token")
}
const BaseUrl = "http://localhost:3200/api/orders/postorders"
export const postOrders = createAsyncThunk("/api/orders",async(payload)=>{
    try {
        const accessToken = getaccesssToken()
        const response = await axios.post(BaseUrl,payload,{
            headers:{
                "Authorization":`Bearer ${accessToken}`
            }
        })
        return response.data
    } catch (error) {
        console.log(error)
        
    }
})

const orderSlice = createSlice({
    name:"orders",
    initialState:{
        loading:false,
        data:[]
    },
    reducers:{},
    extraReducers: (builder) => {
        builder
        .addCase(postOrders.pending, (state) => {
            state.loading = true
        })
        .addCase(postOrders.fulfilled, (state, action) => {
            state.loading = false
            state.data.push(action.payload)
        })
    }

})
export default orderSlice.reducer