import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { useParams } from "react-router-dom";
const {id} = useParams
import axios from "axios";
 const getaccessToken = ()=>{
     return (
         localStorage.getItem("token") 
         )
    

    }
export const fetchOrderProduct = createAsyncThunk("/api/getseller",async(id)=>{
    try {
        const accessToken = getaccessToken()
        const response = await axios.get(`http://localhost:3200/api/order/getorders/${id}`,{
            headers:{
                "Authorization" : `Bearer ${accessToken}`
            }
        })
        return response.data
        
    } catch (error) {
        console.log(error)
        
    }

})

const orderproductSlice = createSlice({
    name:"OrderProduct",
    initialState:{
        loading:true,
        data:[]
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchOrderProduct.pending,(state,action)=>{
            state.loading = true
        })
        builder.addCase(fetchOrderProduct.fulfilled,(state,action)=>{
            state.loading = false
            state.data = action.payload
            
        

            

        })
    }
})

export default orderproductSlice.reducer