import {createSlice} from "@reduxjs/toolkit"
import axios from "axios"
import {createAsyncThunk} from "@reduxjs/toolkit"
const getAccessToken = ()=>{
    return localStorage.getItem("token")
}
export const postUserText = createAsyncThunk("/api/usertext",async(payload)=>{
    try {
        const response = await axios.post("http://localhost:3200/api/postedChat",payload)
        
        return response.data
    } catch (error) {
        console.log(error)
        
    }
})
const textSlice = createSlice({
    name:"text",
    initialState:{
        loading:false,
        data:[]
    },
    reducers:{},
    extraReducers(builder){
        builder.addCase(postUserText.pending,(state,action)=>{
            state.loading = true
        })
        builder.addCase(postUserText.fulfilled,(state,action)=>{
            state.loading = false
            state.data.unshift(action.payload)
            
        })
    }
})


export default textSlice.reducer