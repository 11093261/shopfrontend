import {createAsyncThunk} from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"
const getaccessToken = ()=>{
     return localStorage.getItem("token")
}
export const postTextMessage = createAsyncThunk("/api/gettext",async(payload)=>{
    try {
        const response = await axios.post("http://localhost:3200/api/postsellertext",payload)
        return response.data
        
    } catch (error) {
        console.log(error)
        
    }

})

const messageSlice = createSlice({
    name:"message",
    initialState:{
        loading:false,
        data:[]
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(postTextMessage.pending,(state,action)=>{
            state.loading = true
        })

        builder.addCase(postTextMessage.fulfilled,(state,action)=>{
            state.loading = false
            state.data.unshift(action.payload)
        })
    }
})

export default messageSlice.reducer