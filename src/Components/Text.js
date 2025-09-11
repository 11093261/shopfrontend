import {createAsyncThunk} from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import axios from "axios"
const getaccessToken = ()=>{
     return localStorage.getItem("token")
}
export const getTextMessage = createAsyncThunk("/api/gettext",async()=>{
    try {
        const accessToken = getaccessToken()
        const response = await axios.get("http://localhost:3200/api/getsellertext",{
            headers:{
                "Authorization" : `Bearer ${accessToken}`
            }
        })
        return response.data
        
    } catch (error) {
        console.log(error)
        
    }

})

const messagingSlice = createSlice({
    name:"message",
    initialState:{
        loading:false,
        data:[]
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(getTextMessage.pending,(state,action)=>{
            state.loading = true
        })

        builder.addCase(getTextMessage.fulfilled,(state,action)=>{
            state.loading = false
            state.data = action.payload
        })
    }
})

export default messagingSlice.reducer