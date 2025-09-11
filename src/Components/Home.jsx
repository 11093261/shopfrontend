import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoLogoFacebook, IoLogoInstagram, IoLogoTwitter, IoLogoWhatsapp,
  IoCart, IoSearch, IoMenu, IoClose, IoStar, IoHeart, IoHeartOutline
} from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import { CartContext } from './Cartcontext';
import { fetchProducts, setSelectedSeller } from '../Components/HomeApi'
import { useDispatch } from 'react-redux';
import {useSelector} from "react-redux"


const Home = () => {
  const dispatch = useDispatch()
  const{addToCart}=useContext(CartContext)
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const[searchProduct,setsearchProduct]=useState("")
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate( )
  const listitems = useSelector((state)=>state.home.data)
  const handleProducts = () =>{
    navigate("/Register")
    window.scrollBy({
      top:-1000,
      behavior:"smooth"
    })
  }
  const handleCart = async(productId) => {
    addToCart(productId)
    if(productId){
      dispatch(setSelectedSeller(productId))
      navigate("/Seller")

    }

  }
  const handleRegister = () => navigate("/Register");
  const handleLogin = () => navigate("/Login");
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: "Organic Red Palm Oil",
        price: 18.50,
        oldPrice: 22.99,
        rating: 4.8,
        image: "palm-oil-1",
        isFavorite: false,
        description: "Premium quality organic palm oil sourced directly from sustainable farms."
      },
      {
        id: 2,
        name: "Refined Palm Oil",
        price: 15.99,
        oldPrice: 19.99,
        rating: 4.5,
        image: "palm-oil-2",
        isFavorite: false,
        description: "Refined for cooking with a neutral taste and high smoke point."
      },
      {
        id: 3,
        name: "Cold-Pressed Palm Oil",
        price: 24.99,
        oldPrice: 29.99,
        rating: 4.9,
        image: "palm-oil-3",
        isFavorite: false,
        description: "Cold-pressed to preserve nutrients and natural flavor."
      },
      {
        id: 4,
        name: "Palm Kernel Oil",
        price: 21.50,
        oldPrice: 25.99,
        rating: 4.7,
        image: "palm-oil-4",
        isFavorite: false,
        description: "Rich in vitamins and antioxidants for skincare and cooking."
      }
    ];
    
    setProducts(mockProducts);
    setFeaturedProducts(mockProducts.slice(0, 3));
    setCartCount(3);
  }, []);

  const toggleFavorite = (id) => {
    setProducts(products.map(product => 
      product.id === id ? {...product, isFavorite: !product.isFavorite} : product
    ));
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <IoStar key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"} />
    ));
  };
  

  
    
    const handlesearch = (e)=>{
      setsearchProduct(e.target.value)
    }
    useEffect(()=>{
      
       const getproducts = async()=>{
        try {
        dispatch(fetchProducts())
        
          
        
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
    const filtersomeProduct = (productid) =>{
      const products = listitems.filter(product => product.id !== productid)
      return (
        products
      )

    }

  


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <button 
              onClick={handleProducts}
              className="text-indigo-600 font-medium hover:text-indigo-800"
            >
              List Your Products →
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listitems.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="bg-gray-200 border-2 border-dashed rounded-t-xl w-full h-48" />
                  <button 
                    onClick={() => handlesearch(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    {product.isFavorite ? 
                      <IoHeart className="text-red-500 text-xl" /> : 
                      <IoHeartOutline className="text-gray-600 text-xl" />
                    }
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2 gap-2.5">
                    <h3 className="text-lg font-bold text-gray-900 w-[50%]">{product.sellername}</h3>
                    <h3>{product.location}</h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(product.rating)}
                      <span className="text-sm text-gray-500 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 h-12 overflow-hidden">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center ">
                    <div>
                      <span className="text-lg font-bold text-indigo-600">N{product.price.toFixed(2)}</span>
                      {product.oldPrice && (
                        <span className="text-gray-400 line-through ml-2">N{product.oldPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <button onClick={()=>handleCart(product)} className="bg-indigo-600 text-white px-[4px] py-1 rounded-lg text-[10px] hover:bg-indigo-700">
                      contact seller
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
            </button>
            
            <div className="relative">
              <button 
                onClick={handleCart}
                className="p-2 rounded-full hover:bg-gray-100 relative"
              >
              
              </button>
            </div>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
            >
              {isMenuOpen ? <IoClose className="text-2xl" /> : <IoMenu className="text-2xl" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 px-4 shadow-lg">
            <div className="flex flex-col space-y-4">
              <a href="#" className="font-medium text-gray-900">Home</a>
              <a href="#" className="font-medium text-gray-600">Shop</a>
              <a href="#" className="font-medium text-gray-600">About</a>
              <a href="#" className="font-medium text-gray-600">Contact</a>
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={handleLogin}
                  className="flex-1 py-2 text-gray-600 font-medium border border-gray-300 rounded-lg"
                >
                  Login
                </button>
                <button 
                  onClick={handleRegister}
                  className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg"
                >
                  List Product
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <section className="relative bg-gradient-to-r from-indigo-700 to-purple-800 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Premium Quality Products
            </h1>
            <p className="text-xl mb-8 text-indigo-100 max-w-lg">
              Sustainably sourced, naturally rich in nutrients, and perfect for all your cooking needs.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={handleProducts}
                className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                List Your Products
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64 md:w-80 md:h-80" />
              <div className="absolute -bottom-4 -right-4 bg-indigo-500 rounded-xl w-64 h-64 md:w-80 md:h-80 -z-10">{listitems.imageUrl}</div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to ShopSphere</h2>
            <p className="text-xl text-gray-600">
              ShopSphere connects local communities with urban markets by showcasing the exceptional quality of red palm oil. 
              Our mission is to bring you sustainably sourced products directly from the heart of the plantations.
            </p>
          </div> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainable Sourcing</h3>
              <p className="text-gray-600">
                We partner with local farmers who practice sustainable farming methods to protect the environment.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Our product undergoes strict quality control to ensure you receive only the best products.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community Support</h3>
              <p className="text-gray-600">
                Every purchase supports local farming communities and promotes fair trade practices.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-indigo-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                <div>
                  <h3 className="font-bold text-gray-900">Maria Gonzalez</h3>
                  <p className="text-gray-600">Professional Chef</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {renderStars(4.8)}
              </div>
              <blockquote className="text-gray-700 italic">
                "The quality of red palm oil from ShopSphere is exceptional. It adds a rich flavor to my dishes that my customers absolutely love. Plus, knowing it's sustainably sourced makes me feel good about using it."
              </blockquote>
            </div>
            
            <div className="bg-indigo-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
                <div>
                  <h3 className="font-bold text-gray-900">John Doe</h3>
                  <p className="text-gray-600">Home Cook & Food Blogger</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {renderStars(4.9)}
              </div>
              <blockquote className="text-gray-700 italic">
                "I appreciate the sustainable sourcing and the direct support to local communities. The palm oil has a beautiful red color and authentic flavor that elevates my West African recipes. ShopSphere is my go-to for quality ingredients."
              </blockquote>
            </div>
          </div>
          
          <div className="text-center mt-12">
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8 text-indigo-100">
            Subscribe to our newsletter for exclusive offers, recipes, and sustainability tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="px-4 py-3 rounded-lg flex-1 min-w-0 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-indigo-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">ShopSphere</h3>
              <p className="text-gray-400 mb-4">
                Premium quality palm oil products sustainably sourced from local communities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <IoLogoFacebook className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <IoLogoTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <IoLogoInstagram className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <IoLogoWhatsapp className="text-xl" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Sustainability</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Recipes</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Shipping Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Returns & Refunds</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <address className="text-gray-400 not-italic">
                <p className="mb-2">Phone: (234) 908-662-2565</p>
                <p className="mb-2">Email: info@shopsphere.com</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;