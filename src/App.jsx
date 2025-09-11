import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Router,Route,Routes } from 'react-router-dom'
import Body from './Body'
import Home from './Components/Home'
// import Products from './Components/Products'
import Contact from './Components/Contact'
import Cart from './Components/cart'
import Register from './Components/Register'
import Payment from './Components/Payment'
import Signup from './Components/Signup'
import Login from './Components/Login'
import Admin from './Components/Admin'
import AdminLogin from './Components/AdminLogin'
import Log from './Components/Log'
import Order from './Components/Order'
import { CartProvider } from './Components/Cartcontext'
import { Userscontext } from './Components/Usercontext'
import ShippingAddress from "./Components/ShippingAddress"
import OrderConfirmation from './Components/OrderConfirmation'
import About from "./Components/About"
import Seller from './Components/Seller'







function App() {
  return (
    <main>
      <Userscontext>
      <CartProvider>
       <Routes>
        <Route path='' element={<Body/>}>
          <Route  path='/Home' element={<Home/>}/>
          {/* <Route path='Products' element={<Products/>}/> */}
          <Route path="About" element={<About/>}/>
          <Route path='Contact' element={<Contact/>}/>
          <Route path='Cart' element={<Cart/>}/>
          <Route path='Register' element={<Register/>}/>
          <Route path='Payment' element={<Payment/>}/>
          <Route path='Signup' element={<Signup/>}/>
          <Route path='Login' element={<Login/>}/>
          <Route path='Admin' element={<Admin/>}/>
          <Route path='AdminLogin' element={<AdminLogin/>}/>
          <Route path='Log' element={<Log/>}/>
          <Route path='Order' element={<Order/>}/>
          <Route path="/ShippingAddress" element={<ShippingAddress />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="OrderConfirmation" element={<OrderConfirmation />}/>
          <Route path="Seller" element={<Seller/>}/>

        </Route>
       </Routes>
      </CartProvider>
      </Userscontext>
  
      
    
      
      


       
      
            
    </main>
  )
}

export default App
