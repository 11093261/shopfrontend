
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'
import { useState } from 'react'
import { useParams } from 'react-router-dom';  
import { IoIosBasket, IoIosBeer, IoIosCart, IoIosCheckmark, IoIosLeaf, IoIosSearch, IoIosSunny, IoLogoPolymer, IoMdArchive, IoMdBeaker, IoMdCar, IoMdFlower, IoMdIceCream, IoMdListBox, IoMdPaper, IoMdPeople, IoMdPizza, IoMdPricetag, IoMdPricetags, IoMdQrScanner, IoMdSearch, IoMdStar, IoMdTime } from 'react-icons/io'
import { useContext } from 'react';
import { CartContext } from './Cartcontext';




const Products = () => {
  const{addToCart}= useContext(CartContext)
    const[searchProduct,setsearchProduct]=useState("")
    const { id } = useParams();  
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate()
    const handlesearch = (e)=>{
      setsearchProduct(e.target.value)
    }
    const[listitems,setlistitems]=useState([])
    useEffect(()=>{
      const getproducts = async()=>{
       try {
        const response = await axios.get("http://localhost:3200/api/product")
          console.log(response.data)
          setlistitems(response.data)
          
        
       } catch (err) {
         if(err.response){
          console.log(err.response.data)
          console.log(err.response.status)
          console.log(err.response.headers)
          }else{
            console.log(`Error:${err.message}`)

          }
        
        }

      }
      getproducts()
    },[])

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3200/api/product/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);


 


const Handlecart = async (productitems) => {
  addToseller(productitems)
  if(productitems){
    navigate("/seller")

  }
};

   const filteredItems = listitems.filter(item =>
    item?.name?.toLowerCase().includes(searchProduct.toLowerCase())
  );


return (
    <main className='w-[100%]  bg-indigo-600 h-full flex flex-col justify-center items-center '>
      <div className='bg-gradient-to-r from-indigo-700 to-purple-800 text-white overflow-hidden flex flex-col gap-5 justify-center items-center w-[100%]'>
        <div className='h-[20vh] px-7 flex bg-blue-5  flex-row justify-between items-center w-full gap-3 '>
          <div className='flex flex-row justify-center  text-white gap-4 items-center w-[15%]'>
            <span className='text-[50px] text-red-500 '>
              <IoIosBasket/>
            </span>
          </div>
          <div className='w-[80%] gap-3 justify-center items-center flex flex-row'>
            <div className='flex flex-row justify-between bg-gray-100 items-center px-3 gap-3 md:w-[80%]  w-[80%] h-[7vh] rounded-[20px]'>
              <span className='text-[30px]'>
                <IoIosSearch/>
              </span>
              <input onChange={handlesearch} type="search" value={searchProduct} name="" id="" className='md:w-[100%]  text-[15px] h-[7vh] px-2 border-none outline-none text-black' placeholder='search product' />
            </div>
          </div>
        </div>
        <div className='h-[30vh] bg-[whitesmoke]  gap-3  flex flex-col items-center justify-center w-[100%]'>
          <div className='w-[80%] h-[20vh] items-center justify-center  md:text-[20px] text-[20px]  flex '>
              <p className='w-[100%]'>Back to all Products</p>
          </div>
          <div className='   w-full h-[40vh]  flex flex-row items-center justify-center'>
            <div className='w-full bg-gradient-to-r from-indigo-700 to-purple-800 text-white overflow-hidden  h-[20vh]  px-4 gap-3 font-bold flex flex-row  items-center justify-between '>
              <div className='flex gap-3 px-3   justify-center flex-row items-center w-[55%] '>
                  <div className='flex flex-row   px-3 w-[100%] gap-5 items-center  justify-center'>
                    <span>
                      <IoMdPricetag/>
                    </span>
                    <p className='md:text-[13px] text-[13px] w-[100%]'>Affoardable </p>
                  </div>
                <div className='flex flex-row gap-2  items-center justify-center'>
                  <span>
                    <IoMdArchive/>
                  </span>
                  <p className='text-[13px]'>view</p>
                  <span>
                    <IoMdListBox/>
                  </span>
                </div>
              </div>
              <div className='flex  justify-center items-center md:flex-row flex-col gap-3 w-[100%]'>
                <div className='flex flex-row   items-center justify-center gap-4 '>
                  <span>
                    <IoMdStar/>
                  </span>
                </div>
              </div>
              <div className='w-[100%]  bg-amber-500 h-[5vh] flex px-2 justify-center items-center '>
                <p className=' text-slate-100 md:text-[12px] text-[12px]  w-[100%] text-center'>Best Quality</p>
              </div>
            </div>
          </div>
        </div>
        <div className='h-[30%] flex gap-3   flex-col justify-center items-center w-[100%] '>
          <p className='w-[80%] font-bold'>Filter by categories</p>
          <div className='w-[100%] flex flex-row bg-[whitesmoke]  gap-3 px-4 justify-center items-center'>
            <div className='bg-slate-300  md:text-[10px] text-[10px] items-center  h-[10vh] flex flex-col md:flex-row justify-center gap-3 rounded-[15px] md:w-[50%] w-[50%]'>
              <span className='text-red-600 text-4xl'>
                <IoMdPricetags/>
              </span>
              <p className='font-bold text-blue-700'>Special</p>
            </div>
            <div className='bg-slate-300  md:text-[10px] text-[10px] items-center  h-[10vh] flex flex-col md:flex-row justify-center gap-3 rounded-[15px] md:w-[50%] w-[50%]'>
            <span className='text-4xl text-blue-500'> 
                <IoMdIceCream/>
              </span>
              <p className='font-bold'>Food </p>
            </div>
            <div className='bg-slate-300  md:text-[10px] text-[10px] md:w-[50%] w-[50%] items-center h-[10vh] flex flex-row justify-center gap-3 rounded-[15px] '>
            <span>
              <IoIosBeer/>
              </span>
              <p className='font-bold'>Beverages</p>
            </div>
            <div className='bg-slate-300  md:w-[50%] md:text-[10px] text-[10px] w-[50%] items-center h-[10vh] flex flex-row justify-center gap-3 rounded-[15px] '>
            <span>
                <IoMdListBox/>
              </span>
              <p className='font-bold'>Others</p>
            </div>
          </div>
          <div className='border-b-2 border-[whitesmoke] w-[80%]'></div>
        </div>
        <div className='h-[30vh] w-[100%] flex flex-col justify-center items-center gap-3'>
          <div className='flex flex-row  w-[80%] gap-3  items-center '>
            <p className=' font-bold'>Product categories</p>
            <span className='text-[30px]'>
              <IoIosCheckmark/>
            </span>
          </div>
          <div className='flex flex-row bg-[whitesmoke]  w-[100%]   px-3 gap-3  items-center '>
            <div className=' bg-slate-300  md:w-[50%] md:text-[10px] text-[10px] w-[50%]  flex font-bold justify-center flex-row rounded-[15px] h-[10vh]   gap-3  items-center '>
            <span>
              <IoIosCart/>  
            </span>
              <p>Vegetable</p>
            </div>
            <div className='flex  md:w-[50%] px-2 md:text-[10px] text-[10px] w-[50%]  flex-row font-bold justify-center rounded-[15px]  h-[10vh]  gap-3  items-center bg-slate-300  '>
            <span>
                <IoMdBeaker/>
            </span>
              <p>Bakery</p>
            </div>
            <div className='flex flex-row px-2  md:w-[50%] md:text-[10px] text-[10px] w-[50%]  font-bold justify-center rounded-[15px]  h-[10vh]  gap-3  items-center  bg-slate-300 '>
            <span>
                <IoIosBasket/>
            </span>
              <p>Meat</p>
            </div>
            <div className='flex  md:w-[50%]  md:text-[10px] text-[10px] w-[50%]  flex-row font-bold justify-center rounded-[15px] h-[10vh]   gap-3  items-center  bg-slate-300 '>
            <span>
                <IoMdIceCream/>
            </span>
              <p>Snacks</p>
            </div>
          </div>
          <div className='flex flex-row  w-[100%] gap-3 px-3 items-center '>
            <div className='md:w-[50%] md:text-[10px] text-[10px] w-[50%]  font-bold h-[10vh] flex flex-row justify-center gap-3 rounded-[15px]  bg-slate-300  items-center'>
            <span>
                <IoIosLeaf/>
            </span>
              <p>Kitchen</p>
            </div>
            <div className='flex flex-row  md:w-[50%] md:text-[10px] text-[10px] w-[50%]  font-bold rounded-[15px]  h-[10vh]  gap-3  items-center  bg-slate-300 justify-center '>
            <span>
                <IoMdPeople/>
            </span>
              <p>Community</p>
            </div>
            <div className='flex  md:w-[50%] md:text-[10px] text-[10px] w-[50%]  flex-row font-bold rounded-[15px]  h-[10vh]  gap-3  items-center   bg-slate-300 justify-center'>
            <span>
                <IoMdTime/>
            </span>
              <p>Sustainable</p>
            </div>
            <div className='flex flex-ro  md:w-[50%] md:text-[10px] text-[10px] w-[50%] w font-bold rounded-[15px] justify-center h-[10vh] gap-3  items-center   bg-slate-300 '>
            <span>
                <IoIosSunny/>
            </span>
              <p>Organic</p>
            </div>
          </div>
        </div>
        <div className='h-[30vh]   flex flex-col justify-center items-center w-[100%]'>
          <div className='flex flex-row justify-between w-full px-[5px] items-center'>
            <div className='flex flex-col justify-center w-[100%] items-center'>
              <h1 className='font-bold text-[20px] w-[80%]'>Quality products</h1>
              <p className='w-[80%] '>Explore 112 options</p>
            </div>
            <div className='flex flex-row justify-center gap-3 w-[80%] items-center'>
              <span className='bg-[whitesmoke] md:w-[10vw] w-[13vw] rounded-[16px] justify-center flex items-center h-[7vh]'>
                <IoMdQrScanner/>
              </span>
            </div>
            <div className='w h-[7vh] bg-slate-300 px-2 rounded-[14px] flex flex-row justify-center items-center gap-4 '>
              <input type="search" name="" id="" className='md:w-[40vw] w-[30vw] bg-slate-300 px-3  border-none outline-none' />
              <span className='text-[30px]'>
                <IoMdSearch/>
              </span>
            </div>
          </div>
        </div>
        <div className='w-full px-5 bg-[whitesmoke]'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {listitems.map((items) => (
              <div 
                key={items._id || items.id} 
                className='bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full'
              >
                <div className='p-4 flex-grow flex flex-col'>
                  <div className='flex justify-center mb-3'>
                    <img 
                      src={items.imageUrl || "fallback.jpg"} 
                      alt={items.name || "Product"} 
                      className='w-32 h-32 object-contain'
                    />
                  </div>
                  
                  <div className='flex-grow'>
                    <h3 className='font-semibold text-center mb-2'>
                      {items.sellername || "Unnamed Product"}
                    </h3>
                    
                    <div className='flex justify-between items-center text-sm mb-3'>
                      <span className='font-bold'>
                        {items.price ? `N${items.price}` : "N/A"}
                      </span>
                      <span className='bg-gray-100 px-2 py-1 rounded text-red-600'>
                        <p className="text-green-300">{items.quantity || "0"} in stock</p>
                        
                      </span>
                    </div>
                    
                    <p className='text-xs text-gray-500 mb-4 line-clamp-2'>
                      {items.description || "No description available"}
                    </p>
                  </div>
                  
                  <button 
                    onClick={()=>Handlecart(items)}
                    className='mt-auto bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors w-full'
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Products