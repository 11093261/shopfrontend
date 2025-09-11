import {createSlice} from "@reduxjs/toolkit"
import axios from "axios"
import {createAsyncThunk} from "@reduxjs/toolkit"
const getAccessToken = ()=>{
    return localStorage.getItem("token")
}
export const getUserText = createAsyncThunk("/api/usertext",async()=>{
    const accessToken = getAccessToken()
    try {
        const response = await axios.get("http://localhost:3200/api/getChat",{
            headers:{
                Authorization:`Bearer ${accessToken}`
            }
        })
        return[...response.data]
        
    } catch (error) {
        console.log(error)
        
    }
})

const userSlice = createSlice({
    name:"text",
    initialState:{
        loading:false,
        data:[]
    },
    reducers:{},
    extraReducers(builder){
        builder.addCase(getUserText.pending,(state,action)=>{
            state.loading = true
        })
        builder.addCase(getUserText.fulfilled,(state,action)=>{
            state.loading = false
            state.data = action.payload
        })
    }
})


export default userSlice.reducer