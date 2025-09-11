import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'




const Register = () => {
    const[admin,setadmin]=useState([])
    const[postuserproduct,setpostuserproduct]=useState([])
    const[productupdate,setproductupdate]=useState([])
    const[deteproduct,setdeleteproduct]=useState([])
    const navigate = useNavigate()
    const Handleform = (e)=>{
        e.preventDefault()
        navigate("/Cart")

    }


    useEffect(()=>{
        const Adminproduct = async()=>{
            try {
                const response = await axios.get("http://localhost:3200/api/admin")
                console.log(response.data)
                setadmin(response.data)
            } catch (error) {
                if(error.response){
                    console.log(error.response.data)
                    console.log(error.response.status)
                    console.log(error.response.headers)
                }else{
                    console.log(`Error:${error.message}`)
                }
                
            }
        }
        Adminproduct()
    },[])
    const{register,handleSubmit ,formState:{errors}}=useForm()
    const onsubmit = async (data) => {
  try {
    const formData = new FormData();
    formData.append('sellername', data.sellername);
    formData.append('phone', data.phone);
    formData.append('price', data.price);
    formData.append('quantity', data.quantity);
    formData.append('description', data.description);
    if (data.imageUrl && data.imageUrl.length > 0) {
      formData.append('imageUrl', data.imageUrl[0]);
    }

    

    const response = await axios.post('http://localhost:3200/api/admin', formData, {
      headers: {
          

        'Content-Type': 'multipart/form-data',
        Authorization:  `Bearer ${token}`
      },
    });1

    console.log(response.data);
    setpostuserproduct(response.data);
    navigate("/Order")
    // After registration or login
    


  } catch (err) {
    if (err.response) {
      console.log(err.response.data);
      console.log(err.response.status);
      console.log(err.response.headers);
    } else {
        console.log(`Error: ${err.message}`);
    }
}
};

const handleupdate = async(data)=>{
    try {
        const response = axios.patch(`http://localhost:3200/api/admin/${id}`,data)
        console.log(response.data.id)
        setproductupdate(response.data.id)
    } catch (error) {
        if(error.response){
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
            
        }else{
            console.log(`Error: ${err.message}`);

        }
        
    }
}
const handledelete = async(data)=>{
    try {
        const response = axios.delete(`http://localhost:3200/api/admin/${id}`,data)
        console.log(response.data.id)
        setdeleteproduct(response.data.id)
    } catch (error) {
        if(error.response){
            console.log(err.response.data);
            console.log(err.response.status);
            console.log(err.response.headers);
            
        }else{
            console.log(`Error: ${err.message}`);

        }
        
    }
}





  return (
    <main className='h-[100%] flex flex-col justify-center items-center w-[100%]'>
        <div className='h-[100%]  flex flex-col justify-center items-center w-[100%]'>
            <form  onSubmit={handleSubmit(onsubmit)} action="" className='h-[130vh]  gap-5 shadow shadow-slate-300 flex flex-col justify-center items-center w-[80%] rounded-[10px]'>
                <div className='flex gap-4 flex-col justify-center items-center w-[80%] '>

                    <label className='w-[100%] text-[20px]' htmlFor="">Name</label>
                    <input {...register("sellername",{register:true})}  type="text" name="sellername" id="" className='w-[100%] focus:outline-none' placeholder='Your Name' />
                    <label htmlFor="" className='w-[100%] text-[20px] focus:outline-none'>Phone</label>
                    <input {...register("phone",{register:true})} type="tel" name="phone" id="" placeholder='Your Phone' className='w-[100%] focus:outline-none' />
                    <label htmlFor=""  className='w-[100%] text-[20px] '>Price</label>
                    <input {...register("price",{register:true})}  type="text" className='w-[100%]  focus:outline-none px-2' name="price" placeholder='Price' id="" />
                    <label htmlFor="" className='w-[100%] text-[20px]'>Quantity</label>
                    <div className='w-[100%]  '>
                        <input {...register("quantity",{register:true})} type="number" name="quantity" placeholder='0' id="" className='w-[20%] outline-2  px-2 ' />

                    </div>
                    <label htmlFor="" className='w-[100%] text-[20px]'>Item Description</label>

                    <textarea {...register("description",{register:true})} name="description" id="" placeholder='About' className='w-[100%] outline-none border-none focus:outline-none h-[20vh] border-t-none'></textarea>
                    <div className='w-[100%] h-[20vh]  justify-center'>

                        <input {...register("imageUrl")} type="file" name="imageUrl" id="" className='w-[50%] px-3 py-3 h-[20vh]' />
                    </div>
                </div>
                <div className='flex flex-row gap-3 justify-center items-center'>
                    <button className='md:w-[20vw] w-[30vw] bg-black h-[7vh] text-white text-[20px] rounded-[10px]'>Submit</button>
                    <button onClick={handleupdate} className='md:w-[20vw] w-[30vw] bg-black h-[7vh] text-white text-[20px] rounded-[10px]'>Update</button>

                </div>
                <button onClick={handledelete} className='md:w-[20vw] w-[30vw] bg-red-500 h-[7vh] text-white text-[20px] rounded-[10px]'>Delete</button>


            </form>

        </div>
      
    </main>
  )
}
export default Register
