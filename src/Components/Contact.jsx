import React, { useEffect, useState } from 'react'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3200';
import { useForm } from 'react-hook-form'
// const old_Url = "http://localhost:3200/api/postedChat"
import axios from "axios"
const Contact = () => {
  const {register,handleSubmit,formState:{errors},reset} = useForm()
  const getaccessToken = () =>{
    return localStorage.getItem("token")
  }
  const onsumbit = async(data)=>{
    try {
      const formData = new FormData()
      formData.append("userpost",data.userpost)
      const accessToken = getaccessToken()
      const response = await axios.post(`${API_BASE_URL}/api/postedChat`
        ,formData,{
        headers:{
          "Authorization" : `Bearer ${accessToken}`
        }
      })
      console.log(response.data)
      reset()
      
    } catch (error) {
      console.log(error)
      
    }
  }
  return (
    <main className='h-[100vh] flex flex-col  justify-center items-center w-[100%]'>
      <div className='h-[100vh] flex flex-col justify-center items-center w-[100%] bg-gradient-to-r from-blue-900 to-indigo-900'>
        <div className='flex flex-row justify-center items-center h-[70vh] w-[100%] bg-white'>
          <form onSubmit={handleSubmit(onsumbit)} className='h-[50vh]  flex flex-col gap-[10px]  justify-center py-[100px] items-center md:w-[30%] sm:w-[40%] w-[50%] shadow shadow-black  rounded-t-[5rem] rounded-b-[5rem]  '>
            <textarea {...register("userpost",{required:true})} name="" id="" className='h-[20vh] w-[100%] bg-gradient-to-r  text-white px-[50px] outline-green-300 py-[40px] from-blue-900 to-indigo-900 rounded-t-[5rem] text-[9px] '></textarea>

              <button  className="md:w-[10vw] sm:w-[20vw] w-[20vw] h-[6vh] cursor-pointer rounded-[25px]  text-white bg-gradient-to-r from-blue-900 to-indigo-900">chat</button>
            
          </form>
        </div>
      </div>
    </main>
  )
}

export default Contact
