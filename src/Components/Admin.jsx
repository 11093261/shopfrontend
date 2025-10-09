import React from 'react';
import  { useState, useEffect } from 'react';
import { 
  FiUsers, FiShoppingCart, FiSettings, FiBarChart2, 
  FiGrid, FiBell, FiSearch, FiMenu, FiX, FiPlus
} from 'react-icons/fi';
import { FaBox, FaUserEdit, FaUserTimes } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
const Admin = () => {
  const { isAuthenticated, user: authUser, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token,settoken] = useState(localStorage.getItem("token"));
  const [addNew,setAddNew] = useState([])
  const[updatedOrder,setupdatedOrder] = useState([])
  const [shipping,setshipping] = useState([])
  const navigate = useNavigate()  
  const notifications = [
    { id: 1, message: 'New order received', time: '10 mins ago', read: false },
    { id: 2, message: 'Server maintenance scheduled', time: '3 hours ago', read: true },
    { id: 3, message: 'New user registered', time: 'Yesterday', read: true },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const getStatusColor = (status) => {
    
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800';
      case 'Editor': return 'bg-indigo-100 text-indigo-800';
      case 'Viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...');
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      });
    }
      
      

        let endpoint = '';
        switch (activeTab) {
          case 'dashboard':
            endpoint = 'http://localhost:3200/api/orders/summary';
            break;
          case 'orders':
            endpoint = 'http://localhost:3200/api/orders/getorders';
            break;
          case 'users':
            endpoint = 'http://localhost:3200/api/users';
            break;
          // default:
          //   break;
          case "shipping":
            endpoint = 'http://localhost:3200/api/user-shipping';
            break;
            default:
            break;

        }

        if (endpoint) {
          const response = await axios.get(endpoint,config);
          
          if (activeTab === 'dashboard') {
            setDashboardData(response.data);
          } else if (activeTab === 'orders') {
            console.log(response.data)
            setOrders(response.data);
          } else if (activeTab === 'users') {
            setUsers(response.data);
          } else if(activeTab === "shipping"){
            setshipping(response.data)
            
          }
        }
        
        setError(null);
      } catch (err) {
        console.error(`Admin ${activeTab} error:`, err);
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError('Authentication required');
      setIsLoading(false);
    }
  }, [activeTab, authLoading, isAuthenticated, token]);

  const updateOrderStatus = async (orderId,newStatus) => {
    try {
      //  const config = {
      //    headers: {
      //    Authorization: `Bearer ${token}`
      //    }
      //  };
      // console.log(config)
        await axios.put(
          `http://localhost:3200/api/order/${orderId}/status`,
          { status: newStatus },
          {
            withCredentials:true
          }
      );
      const response = await axios.get(
        'http://localhost:3200/api/orders', 
        {
          withCredentials:true
        }
      );
      console.log(response.data)
      setOrders(response.data);
      console.log(localStorage.getItem("order"))
      console.log(localStorage.setItem("order",JSON.stringify(response.data)))
    } catch (err) {
      console.error('Update order status error:', err);
      setError('Failed to update order status');
    }
  };

  const updateUserRole = async (userId,newRole) => {
    try {
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }

      // };
      
      
       await axios.put(
         `http://localhost:3200/api/users/${userId}/role`,
         { role: newRole },
         {
          withCredentials:true
         }
       );
      const response = await axios.get(
        'http://localhost:3200/api/users', 
        {
          withCredentials:true
        }
      );
      setUsers(response.data);
    } catch (err) {
      console.error('Update user role error:', err);
      setError('Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    try {
    
      
      await axios.delete(
        `http://localhost:3200/api/users/${userId}`,
        {
          withCredentials:true
        }
      );
      
      const response = await axios.get(
        'http://localhost:3200/api/users', 
        {
          withCredentials:true
        }
      );
      setUsers(response.data);
    } catch (err) {
      console.error('Delete user error:', err);
      setError('Failed to delete user');
    }
  };
  const handleNewUsers = (productId) =>{
    try {
      
      const response = axios.delete(`http://localhost:3200/api/productdelete/${productId}`,{
        withCredentials:true
      })
      setAddNew(response.data)
      localStorage.setItem("products",JSON.stringify(addNew))
      if(addNew){
        navigate("/Home")
        
      }

    } catch (error) {
      if(error.response){
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
      else{
        console.log(`Error : ${error.message}`)
      }
      
      
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-700">Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-red-800 mb-2">Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex md:w-[100%] flex-row h-screen bg-gray-50">
      <div 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-indigo-800 text-white transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold flex items-center">
              <FiGrid className="mr-2" /> Admin Panel
            </h1>
          )}
          <button onClick={toggleSidebar} className="text-white hover:text-gray-300">
            {sidebarOpen ? <FiX size={10} /> : <FiMenu size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 mt-8">
          <ul>
            <li>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center p-4 hover:bg-indigo-700 ${
                  activeTab === 'dashboard' ? 'bg-indigo-900' : ''
                }`}
              >
                <FiBarChart2 className="mr-3 text-lg" />
                {sidebarOpen && <span>Dashboard</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center p-4 hover:bg-indigo-700 ${
                  activeTab === 'orders' ? 'bg-indigo-900' : ''
                }`}
              >
                <FiShoppingCart className="mr-3 text-lg" />
                {sidebarOpen && <span>Orders</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center p-4 hover:bg-indigo-700 ${
                  activeTab === 'users' ? 'bg-indigo-900' : ''
                }`}
              >
                <FiUsers className="mr-3 text-lg" />
                {sidebarOpen && <span>Users</span>}
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center p-4 hover:bg-indigo-700 ${
                  activeTab === 'settings' ? 'bg-indigo-900' : ''
                }`}
              >
                <FiSettings className="mr-3 text-lg" />
                {sidebarOpen && <span>Settings</span>}
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-indigo-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="font-bold">A</span>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-indigo-300">admin@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="relative w-full max-w-md py-5">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <FiBell size={20} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="font-bold text-indigo-800">A</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === 'dashboard' ? 'Dashboard' : 
               activeTab === 'orders' ? 'Order Management' : 
               activeTab === 'users' ? 'User Management' : 
               'Settings'}
            </h1>
            {activeTab !== 'settings' && (
              <button onClick={handleNewUsers} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                <FiPlus className="mr-2" />
                <p>Add New</p>
              </button>
            )}
          </div>
          {activeTab === 'dashboard' && dashboardData && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500">Total Users</p>
                      <h3 className="text-2xl font-bold mt-2">{dashboardData.totalUsers}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <FiUsers className="text-blue-600 text-xl" />
                    </div>
                  </div>
                  <p className="text-green-500 text-sm mt-3">
                    <span>↑ 12.5%</span> from last month
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500">Total Orders</p>
                      <h3 className="text-2xl font-bold mt-2">{dashboardData.totalOrders}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <FiShoppingCart className="text-green-600 text-xl" />
                    </div>
                  </div>
                  <p className="text-green-500 text-sm mt-3">
                    <span>↑ 8.3%</span> from last month
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <h3 className="text-2xl font-bold mt-2">N{dashboardData.totalRevenue?.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FiBarChart2 className="text-purple-600 text-xl" />
                    </div>
                  </div>
                  <p className="text-green-500 text-sm mt-3">
                    <span>↑ 5.2%</span> from last month
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500">Pending Orders</p>
                      <h3 className="text-2xl font-bold mt-2">{dashboardData.pendingOrders}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                      <FaBox className="text-yellow-600 text-xl" />
                    </div>
                  </div>
                  <p className="text-red-500 text-sm mt-3">
                    <span>↓ 3.7%</span> from last month
                  </p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left text-gray-600 font-medium">Order ID</th>
                        <th className="py-3 text-left text-gray-600 font-medium">Customer</th>
                        <th className="py-3 text-left text-gray-600 font-medium">Date</th>
                        <th className="py-3 text-left text-gray-600 font-medium">Amount</th>
                        <th className="py-3 text-left text-gray-600 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentOrders?.map(orderItem => (
                        <tr key={orderItem._id} className="border-b hover:bg-gray-50">
                          <td className="py-2">{orderItem._id?.substring(0,8)}...</td>
                          <td className="py-2">{shipping.fullName}</td>
                          <td className="py-2">{orderItem.date ? new Date(orderItem.date).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-2 font-medium">N{orderItem.amount?.toFixed(2)}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(orderItem.status)}`}>
                              {orderItem.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Order ID</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">OrderNumber</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Customer</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Date</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Amount</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Status</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                      <tr  className="hover:bg-gray-50">
                        <td className="py-4 px-4">{orders._id?.substring(0, 8)}...</td>

                        <td className="py-4 px-4">{orders.orderNumber}</td>
                        <td className="py-4 px-4">{orders.customer}</td>
                        <td className="py-4 px-4">{orders.createdAt}</td>
                        <td className="py-4 px-4 font-medium">N{orders.total?.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(orders.status)}`}>
                            {orders.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <select 
                              value={orders.status} 
                              onChange={(e) => updateOrderStatus(orders._id, e.target.value)}
                              className="border rounded p-1 text-sm"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    {/* {orders.map(orderItem => (
                    ))} */}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Name</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Email</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Role</th>
                      <th className="py-3 px-4 text-left text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map(userItem => (
                      <tr key={userItem._id || userItem.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{userItem.name}</td>
                        <td className="py-4 px-4">{userItem.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${getRoleColor(userItem.role)}`}>
                            {userItem.role || 'User'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-3">
                            <select 
                              value={userItem.role} 
                              onChange={(e) => updateUserRole(userItem._id || userItem.id, e.target.value)}
                              className="border rounded p-1 text-sm"
                            >
                              <option value="Admin">Admin</option>
                              <option value="Editor">Editor</option>
                              <option value="Viewer">Viewer</option>
                              <option value="User">User</option>
                            </select>
                            <button 
                              onClick={() => deleteUser(userItem._id || userItem.id)}
                              className="text-red-600 hover:text-red-800 flex items-center text-sm"
                              title="Delete User"
                            >
                              <FaUserTimes className="mr-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">System Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-5">
                  <h3 className="font-medium mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                      <input 
                        type="text" 
                        defaultValue="Admin Dashboard" 
                        className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option>(UTC+00:00) London</option>
                        <option>(UTC-05:00) New York</option>
                        <option>(UTC+08:00) Singapore</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-5">
                  <h3 className="font-medium mb-4">Security</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-indigo-600" defaultChecked />
                        <span className="ml-2">Enable Two-Factor Authentication</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-indigo-600" />
                        <span className="ml-2">Require Strong Passwords</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded text-indigo-600" defaultChecked />
                        <span className="ml-2">Session Timeout (15 minutes)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;