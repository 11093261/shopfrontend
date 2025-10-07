import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCart, IoSearch, IoFilter, IoCloseCircle, IoAdd, IoStar, IoHeartOutline } from 'react-icons/io5';
import { CartContext } from './Cartcontext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setSelectedSeller, filterProducts, setSearchTerm } from '../Components/HomeApi';
import { useAuth } from './context/AuthContext';

const Home = () => {
  const dispatch = useDispatch();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);
  
  const filteredProducts = useSelector((state) => state.home.filteredData || state.home.data);
  const searchTerm = useSelector((state) => state.home.searchTerm || "");
  const loading = useSelector((state) => state.home.loading);

  const handleRegister = () => {
    if (isAuthenticated) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  const handleContactSeller = (productData) => {
    if (productData) {
      dispatch(setSelectedSeller(productData));
      navigate("/seller");
    }
  };

  const handleAddToCart = (productData) => {
    addToCart(productData);
    console.log('Product added to cart:', productData.name);
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
    dispatch(fetchProducts());
  }, [dispatch]);

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
      {/* Header Section */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRegister}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <IoAdd className="text-lg" />
                List Product
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Results Header */}
      {searchTerm && (
        <div className="container mx-auto px-4 pt-6">
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
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
      <section id="products" className="py-8 bg-white">
        <div className="container mx-auto px-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 px-3 py-2 rounded-lg text-sm"
              >
                <IoFilter className="mr-1" /> Filters
              </button>
              <button 
                onClick={handleRegister}
                className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                <IoAdd className="mr-1" /> Sell Yours
              </button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.imageUrl || "https://via.placeholder.com/300x300?text=Product+Image"} 
                      alt={product.name}
                      className="w-full h-32 sm:h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-white transition-colors backdrop-blur-sm">
                      <IoHeartOutline className="text-sm text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  
                  <div className="p-2 sm:p-3">
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-tight">{product.description}</p>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2 leading-tight">{product.price}</p>
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {renderStars(product.rating || 4.5)}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({product.reviews || 24})</span>
                    </div>
                    
                    {/* Dual Buttons */}
                    <div className="flex justify-between items-center mt-2 gap-1">
                      <button 
                        onClick={() => handleContactSeller(product)}
                        className="flex-1 px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center justify-center text-xs"
                      >
                        <IoCart className="mr-1" /> 
                        <span>Contact Seller</span>
                      </button>
                      
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center text-xs"
                      >
                        <IoCart className="mr-1" /> 
                        <span>Add to Cart</span>
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
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={clearFilters}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <button 
                    onClick={handleRegister}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <IoAdd />
                    List Your Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto my-8 p-6">
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
                  <option value="automobile">Automobile</option>
                </select>
              </div>
              
              {/* Rating Filter */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Minimum Rating</h4>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(rating)}
                      className={`px-3 py-2 rounded-lg border text-sm ${
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
    </div>
  );
};

export default Home;