
import { createContext, useState, useEffect } from "react";

const CartContext = createContext({
  cart: [], 
  totalPrice: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  handlechechout:()=>{},
  order:[]
});

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [order ,setorder] = useState([])

  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    setTotalPrice(newTotal);
  }, [cart]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if(storedCart) {
       setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existingProduct = cart.find(item => item._id === product._id);
    
    if(existingProduct) {
      setCart(cart.map(item => 
        item._id === product._id 
          ? {...item, quantity: item.quantity + 1} 
          : item
      ));
    } else {
      setCart([...cart, {...product, quantity: 1}]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId && item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      (item._id === productId || item.id === productId) 
        ? {...item, quantity: newQuantity} 
        : item
    ));
  };

  const handlechechout = (productId,description)=>{
    setCart(cart.filter(item => item._id !== productId && item.id  || item._id !== description && item.id))

  }
  useEffect(()=>{
    const savedOrder = localStorage.getItem("order")
    if(savedOrder){
      setorder(JSON.parse(savedOrder))
    }
  },[])



  return (
    <CartContext.Provider value={{ 
      cart,  
      totalPrice,
      addToCart, 
      removeFromCart,
      updateQuantity,
      handlechechout,
      order
    
        
      
    }}>
      {children}
    </CartContext.Provider>
  );
};

export { CartProvider, CartContext };