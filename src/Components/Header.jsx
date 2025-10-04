import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes, FaCrown, FaSearchengin, FaPlus } from 'react-icons/fa';
import { useContext } from 'react';
import { CartContext } from './Cartcontext';
import { fetchProducts, filterProducts } from './HomeApi';
import { useDispatch} from 'react-redux';
import { useSelector } from 'react-redux';

const Navs = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  // { path: '/contact', name: 'Contact' }
];

const Header = () => {
  const productData = useSelector((state)=>state.home.data)
  const {cart} = useContext(CartContext)

  const navigate = useNavigate();
  const [toggle, setToggle] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false); // New state for mobile cart
  const headerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch()
  
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      return sum + (item.quantity);
    }, 0);
    setCartCount(newTotal);
  }, [cart]);

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (headerRef.current) {
        const headerHeight = headerRef.current.clientHeight;
        document.documentElement.style.setProperty(
          '--header-height', 
          `${headerHeight}px`
        );
      }
    };
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (headerRef.current) {
      const headerHeight = headerRef.current.clientHeight;
      document.documentElement.style.setProperty(
        '--header-height', 
        `${headerHeight}px`
      );
    }
  }, [mobileMenuOpen]);

  const handleCart = () => {
    setToggle(prev => !prev);
    if (toggle) {
      navigate('/Signup');
    } else {
      navigate('/Register');
    }
  };

  const handleAdmin = () => navigate('/Admin');

  // Add this function for Register page navigation
  const handleRegister = () => {
    navigate('/Register');
    setMobileMenuOpen(false);
  };

  // New function to handle cart click on mobile
  const handleCartClick = () => {
    if (window.innerWidth < 768) { // Mobile view
      setMobileCartOpen(true);
    } else {
      // Desktop behavior remains the same (hover)
      navigate('/cart');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      dispatch(filterProducts(searchQuery));
      navigate('/Home');
      setMobileMenuOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    dispatch(fetchProducts()); // Reset to show all products
  };

  // Calculate cart totals for mobile view
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = cartSubtotal > 0 ? 50 : 0;
  const tax = cartSubtotal * 0.001;
  const cartTotal = cartSubtotal + shippingFee + tax;

  return (
    <>
      <header 
        ref={headerRef}
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'h-16 bg-white shadow-md' : 'h-20 bg-gradient-to-r from-blue-900 to-indigo-900'}`}
      >
        <div className="container mx-auto px-4 h-full w-[100%] gap-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <FaCrown className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              ShopSpher
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center">
            <ul className="flex space-x-4 lg:space-x-6">
              {Navs.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `font-medium transition-colors duration-200 hover:text-amber-500 ${
                        isActive 
                          ? 'text-amber-500 border-b-2 border-amber-500' 
                          : scrolled ? 'text-gray-700' : 'text-white'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <form onSubmit={handleSearch} className={`hidden md:flex items-center gap-[10px] transition-all duration-300 ${
              scrolled ? 'bg-gray-100' : 'bg-white  bg-opacity-20'
            } rounded-full px-4 py-1`}>
              <FaSearchengin className={scrolled ? "text-gray-500" : "text-white"} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search products "
                className={`bg-transparent outline-none w-30 lg:w-70 transition-all duration-300 ${
                  scrolled ? 'text-gray-700 placeholder-gray-500' : 'text-black placeholder-white placeholder-opacity-70'
                }`}
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              )}
            </form>
            
            {/* List Product Button - Desktop */}
            {/* <button
              onClick={handleRegister}
              className={`hidden md:flex items-center justify-center cursor-pointer w-32 h-10 rounded-full font-medium transition-all duration-300 ${
                scrolled 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <FaPlus className="mr-2" />
              List Product
            </button> */}
            
            {/* Cart Icon - Updated for mobile click */}
            <div className="relative cursor-pointer group">
              <div className="relative" onClick={handleCartClick}>
                <FaShoppingCart 
                  className={`text-xl transition-colors duration-300 group-hover:text-amber-500 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`} 
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              {/* Desktop hover tooltip */}
              <div className="hidden md:block absolute top-full right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <h3 className="font-bold text-gray-800 mb-2">Your Cart</h3>
                <p className="text-gray-600 text-sm">{cartCount} items</p>
                <button 
                  className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all"
                  onClick={() => navigate('/cart')}
                >
                  View Cart
                </button>
              </div>
            </div>
            
            <button
              onClick={handleCart}
              className={`hidden md:flex items-center justify-center cursor-pointer w-15 lg:w-20 h-10 rounded-full font-medium transition-all duration-300 ${
                scrolled 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600' 
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {toggle ? 'Signup' : 'Login'}
            </button>
            
            <button 
              className="md:hidden z-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <FaTimes className={scrolled ? "text-gray-700" : "text-white"} size={24} />
              ) : (
                <FaBars className={scrolled ? "text-gray-700" : "text-white"} size={24} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden fixed inset-0 bg-black bg-opacity-90 z-40 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className={`absolute top-20 left-0 right-0 bg-white transform transition-transform duration-300 ${
              mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <nav className="py-4">
              <ul className="flex flex-col">
                {Navs.map((item) => (
                  <li key={item.path} className="border-b border-gray-100">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `block py-3 px-6 font-medium transition-colors duration-200 ${
                          isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
                
                {/* List Product Button - Mobile */}
                <li className="border-b border-gray-100">
                  <button
                    onClick={handleRegister}
                    className="w-full text-left py-3 px-6 font-medium text-white bg-green-500 hover:bg-green-600 flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    List Product
                  </button>
                </li>
                
                <li>
                  <button
                    onClick={() => {
                      handleCart();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 px-6 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {toggle ? 'Signup' : 'Login'}
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="px-6 pb-4">
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-3 py-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Search products or sellers..."
                  className="bg-transparent outline-none w-full text-gray-700"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                )}
                <button type="submit">
                  <FaSearch className="text-gray-500" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Cart Overlay */}
        {mobileCartOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMobileCartOpen(false)}>
            <div 
              className="absolute top-20 right-0 bottom-0 left-0 bg-white transform transition-transform duration-300 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Your Cart ({cartCount} items)</h2>
                <button 
                  onClick={() => setMobileCartOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <FaShoppingCart className="text-gray-400 text-4xl mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map(item => (
                        <div key={item._id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center flex-1">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=No+Image'}
                            />
                            <div className="ml-3 flex-1">
                              <h3 className="font-medium text-sm">{item.sellername}</h3>
                              <p className="text-gray-600 text-xs line-clamp-1">{item.description}</p>
                              <p className="text-green-600 font-bold">₦{item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-sm">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h3 className="font-bold text-lg mb-3">Order Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₦{cartSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>₦{shippingFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>₦{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-gray-300">
                          <span>Total:</span>
                          <span>₦{cartTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          setMobileCartOpen(false);
                          navigate('/cart');
                        }}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Full Cart
                      </button>
                      <button 
                        onClick={() => {
                          setMobileCartOpen(false);
                          navigate('/checkout');
                        }}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        disabled={cart.length === 0}
                      >
                        Checkout Now
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
      <div className="h-20 md:h-16" aria-hidden="true"></div>
    </>
  );
};

export default Header;