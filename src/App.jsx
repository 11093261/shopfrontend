import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <main>
        <Userscontext>
          <CartProvider>
            <Routes>
              <Route  element={<Body/>}>
                <Route path='/' index element={<Home/>} />
                <Route path="about" element={<About/>}/>
                <Route path='contact' element={<Contact/>}/>
                <Route path='cart' element={<Cart/>}/>
                <Route path='register' element={<Register/>}/>
                <Route path='payment' element={<Payment/>}/>
                <Route path='signup' element={<Signup/>}/>
                <Route path='login' element={<Login/>}/>
                <Route path='admin' element={<Admin/>}/>
                <Route path='adminlogin' element={<AdminLogin/>}/>
                <Route path='order' element={<Order/>}/>
                <Route path="shippingaddress" element={<ShippingAddress />} />
                <Route path="orderconfirmation" element={<OrderConfirmation />}/>
                <Route path="seller" element={<Seller/>}/>
              </Route>
            </Routes>
          </CartProvider>
        </Userscontext>
      </main>
    </Router>
  );
}

export default App;