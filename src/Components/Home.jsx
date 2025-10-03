// Home.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoLogoFacebook, IoLogoInstagram, IoLogoTwitter, IoLogoWhatsapp,
  IoCart, IoSearch, IoMenu, IoClose, IoStar, IoHeart, IoHeartOutline,
  IoFilter, IoCloseCircle
} from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import { CartContext } from './Cartcontext';
import { fetchProducts, setSelectedSeller, filterProducts, setSearchTerm } from '../Components/HomeApi';
import { useDispatch } from 'react-redux';
import { useSelector } from "react-redux"

const Home = () => {
  const dispatch = useDispatch()
  const { addToCart } = useContext(CartContext)
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate()
  
  const listitems = useSelector((state) => state.home.data)
  const filteredProducts = useSelector((state) => state.home.filteredData || state.home.data)
  const searchTerm = useSelector((state) => state.home.searchTerm || "")
  const loading = useSelector((state) => state.home.loading)
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  
  const handleProducts = () => {
    navigate("/Register")
    window.scrollBy({
      top: -1000,
      behavior: "smooth"
    })
  }
  // Add this to your Home.jsx useEffect
useEffect(() => {
  // Test connection
  const testConnection = async () => {
    try {
      const response = await fetch('https://shopspher.com/api/product');
      console.log('Connection test:', response.status, response.ok);
      const data = await response.json();
      console.log('Sample product data:', data[0]);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };
  testConnection();
}, []);
  
  const handleCart = async(productData) => {
    addToCart(productData)
    if(productData){
      dispatch(setSelectedSeller(productData))
      navigate("/Seller")
    }
  }
  
  const handleRegister = () => navigate("/Register");
  const handleLogin = () => navigate("/Login");
  
  const toggleFavorite = (id) => {
    // You can implement this functionality if needed
    console.log("Toggle favorite for product:", id);
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <IoStar key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"} />
    ));
  };
  
  const handleSearch = (term) => {
    dispatch(setSearchTerm(term));
    dispatch(filterProducts({ 
      searchTerm: term, 
      priceRange, 
      category: categoryFilter, 
      minRating: ratingFilter 
    }));
  };
  
  const applyFilters = () => {
    dispatch(filterProducts({ 
      searchTerm, 
      priceRange, 
      category: categoryFilter, 
      minRating: ratingFilter 
    }));
    setIsFilterOpen(false);
  };
  
  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setCategoryFilter('all');
    setRatingFilter(0);
    dispatch(setSearchTerm(''));
    dispatch(fetchProducts());
    setIsFilterOpen(false);
  };
  
  useEffect(() => {
    const getproducts = async() => {
      try {
        dispatch(fetchProducts())
      } catch (err) {
        if(err.response) {
          console.log(err.response.data)
          console.log(err.response.status)
          console.log(err.response.headers)
        } else {
          console.log(`Error:${err.message}`)
        }
      }
    }
    getproducts()
  }, [dispatch])

  // Update cart count when cart changes
  useEffect(() => {
    // This would typically come from your CartContext
    // For now, we'll set a dummy value
    setCartCount(3); // Example count
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-700 font-medium">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100">
      {/* Header */}
     

      {/* Search Results Header */}
      {searchTerm && (
        <div className="container mx-auto px-4 pt-6">
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Search Results for: "{searchTerm}"
                </h2>
                <p className="text-gray-600">
                  {filteredProducts.length} product(s) found
                </p>
              </div>
              <button 
                onClick={() => {
                  dispatch(setSearchTerm(''));
                  dispatch(fetchProducts());
                }}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <IoCloseCircle className="mr-1 text-lg" /> Clear search
              </button>
            </div>
          </div>
        </div>
      )}
      
  

      {/* Products Section */}
      <section id="products" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 text-indigo-800">Featured Products</h2>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <IoFilter className="mr-1" /> Filters
            </button>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.imageUrl || "https://via.placeholder.com/300x300?text=Product+Image"} 
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button 
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                    >
                      <IoHeartOutline className="text-xl text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center mb-3">
                      {renderStars(product.rating || 4.5)}
                      <span className="text-sm text-gray-500 ml-2">({product.reviews || 24})</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-indigo-600">${product.price}</span>
                      <button 
                        onClick={() => handleCart(product)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <IoCart className="mr-2" /> Contact seller
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <IoSearch className="text-6xl mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto my-8 p-6 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <IoClose className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Price Range Filter */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100000" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>N{priceRange[0]}</span>
                    <span>N{priceRange[1]}</span>
                  </div>
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Category</h4>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="all">All Categories</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Automobile</option>
                </select>
              </div>
              
              {/* Rating Filter */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Minimum Rating</h4>
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`p-2 rounded-lg border ${
                        ratingFilter === rating 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {rating === 0 ? 'Any' : `${rating}+ Stars`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button 
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ProductHub</h3>
              <p className="text-gray-400">Connecting buyers and sellers with quality products.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Electronics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Clothing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home & Garden</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Automobile</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <IoLogoFacebook className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <IoLogoInstagram className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <IoLogoTwitter className="text-2xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <IoLogoWhatsapp className="text-2xl" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Shopsphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;