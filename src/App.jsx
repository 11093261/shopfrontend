import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Body from './Body';
import Home from './Components/Home';
import Contact from './Components/Contact';
import Register from './Components/Register';
import Payment from './Components/Payment';
import Cart from "./Components/Cart";
import Signup from './Components/Signup';
import Login from './Components/Login';
import Admin from './Components/Admin';
import AdminLogin from './Components/AdminLogin';
import Order from './Components/Order';
import { CartProvider } from './Components/Cartcontext';
import { Userscontext } from './Components/Usercontext';
import ShippingAddress from "./Components/ShippingAddress";
import OrderConfirmation from './Components/OrderConfirmation';
import About from "./Components/About";
import Seller from './Components/Seller';
import CustomerOrders from "./Components/CustomerOrders";
import { AuthProvider, useAuth } from './Components/context/AuthContext.jsx';
import { AuthDebugger } from './Components/AuthDebugger.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Main app content with routing
const AppContent = () => {
  return (
    <Router>
      <Userscontext>
        <CartProvider>
          <Routes>
            {/* Routes that use the Body layout */}
            <Route path="/" element={<Body />}>
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="cart" element={<Cart />} />
              
              {/* Authentication routes - only accessible when logged out */}
              <Route path="login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="signup" element={
                <PublicRoute>
                  <Signup/>
                </PublicRoute>
              } />
              
              {/* Protected routes - only accessible when logged in */}
              <Route path="register" element={
                <ProtectedRoute>
                  <Register />
                </ProtectedRoute>
              } />
              <Route path="payment" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path="order" element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              } />
              <Route path="shippingaddress" element={
                <ProtectedRoute>
                  <ShippingAddress />
                </ProtectedRoute>
              } />
              <Route path="orderconfirmation" element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              } />
              <Route path="customerorders" element={
                <ProtectedRoute>
                  <CustomerOrders />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Standalone routes outside Body layout */}
            <Route path="/seller" element={
              <ProtectedRoute>
                <Seller />
              </ProtectedRoute>
            } />
            
            {/* Admin routes (outside Body layout if needed) */}
            <Route path="admin" element={<Admin />} />
            <Route path="adminlogin" element={<AdminLogin />} />
          </Routes>
          
          {/* Auth debugger - only in development */}
          {process.env.NODE_ENV === 'development' && <AuthDebugger />}
        </CartProvider>
      </Userscontext>
    </Router>
  );
};

// Root app component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;