import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
 const getaccessToken = ()=>{
     return (
         localStorage.getItem("token") 
         )
    

    }
export const fetchOrderInfo = createAsyncThunk("/api/getseller",async()=>{
    try {
        const accessToken = getaccessToken()
        const response = await axios.get("http://localhost:3200/api/orders/getorders",{
            headers:{
                "Authorization" : `Bearer ${accessToken}`
            }
        })
        return response.data
        
    } catch (error) {
        console.log(error)
        
    }

})

const orderInfo = createSlice({
    name:"OrderProduct",
    initialState:{
        loading:true,
        data:[]
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchOrderInfo.pending,(state,action)=>{
            state.loading = true
        })
        builder.addCase(fetchOrderInfo.fulfilled,(state,action)=>{
            state.loading = false
            state.data = action.payload
            
        

            

        })
    }
})

export default orderInfo.reducer