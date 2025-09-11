 import {createAsyncThunk} from "@reduxjs/toolkit"
 import {createSlice} from "@reduxjs/toolkit"
 import axios from 'axios'
 const getaccessToken = ()=>{
    return localStorage.getItem("token")
    return localStorage.getItem("userId")
 }
 export const adminUpdate = createAsyncThunk("/update",async(userId)=>{
    const accessToken = getaccessToken()
    try {
        const response = await axios.put(`http://localhost:3200/api/order/${userId}/status`,{ 
            headers:{
                Authorization : `Bearer ${accessToken}`
            }
        })
       console.log(response.data)
       return response.data
        
    } catch (error) {
        console.log(error)
        
    }

 })

 const adminSlice = createSlice({
     name:"admin",
     initialState:{
        loading:false,
        data:[]
    },
    reducers:{},
   extraReducers:(builder)=>{
        builder.addCase(adminUpdate.pending,(state,action)=>{
        state.loading = true
        })
        builder.addCase(adminUpdate.fulfilled,(state,action)=>{
       
        state.data = state.data.filter(items => items.id !== action.payload.id);
        state.data.unshift(action.payload);
        })
    }
})

export default  adminSlice.reducer
