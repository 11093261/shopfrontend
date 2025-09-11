import { createContext, useEffect, useState } from "react";
const Usercontext = createContext({
    postAuth:[]
    
})

const Userscontext = ({children})=>{
    const[postAuth,setpostAuth] = useState([])
    useEffect(()=>{
        const storedusers = localStorage.getItem("post")
        if(storedusers){
            setpostAuth(storedusers)
        }

    },[postAuth])

    useEffect(()=>{
        localStorage.setItem("post",JSON.stringify(postAuth))
    },[postAuth])
    return <Usercontext.Provider value={{postAuth
    

    }}>
        {children}

    </Usercontext.Provider>

}
export {Userscontext,Usercontext}