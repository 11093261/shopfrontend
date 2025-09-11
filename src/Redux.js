import {createSlice} from "@reduxjs/toolkit"


export const adminSlice = createSlice({
    name:"post",
    initialState:{
        names:'uche'

    },
    reducers:{
        Userpost:(state,action)=>{
        state.names = action.payload
        }
        
        


    }

})

export const{Userpost} = adminSlice.actions
export default adminSlice.reducer