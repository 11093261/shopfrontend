import React from 'react';
import { FaTruck, FaUndo, FaQuestionCircle, FaShieldAlt, FaStar,FaCrown,  FaHeadset, FaLock, FaGlobe } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const About = () => {
  const navigate = useNavigate()
  const handlecall = ()=>{
    window.location.href="08086622565"
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative py-20 bg-gradient-to-r from-blue-900 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=2070')] bg-cover"></div>
        </div>                                                                         
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About ShopSphere</h1>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed">
              Your Trusted Desti                                                                                                                                                                                                                                                                                                                                   nation for Quality Products and Exceptional Service
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center bg-blue-800 bg-opacity-50 px-4 py-2 rounded-full">
                <FaTruck className="mr-2 text-amber-400" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex items-center bg-blue-800 bg-opacity-50 px-4 py-2 rounded-full">
                <FaUndo className="mr-2 text-amber-400" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center bg-blue-800 bg-opacity-50 px-4 py-2 rounded-full">
                <FaHeadset className="mr-2 text-amber-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Story</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-8"></div>
            <p className="text-lg text-gray-600 mb-6">
              Founded in 2015, ShopSphere began as a small online store with a big vision: to create the most customer-centric shopping experience on the web.
            </p>
            <p className="text-lg text-gray-600">
              Today, we serve millions of customers worldwide with a carefully curated selection of over 50,000 products across fashion, electronics, home goods, and more. Our mission remains the same - to make shopping simple, secure, and delightful.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl font-bold text-blue-800 mb-4">10M+</div>
              <h3 className="text-xl font-semibold mb-2">Happy Customers</h3>
              <p className="text-gray-600">Served across 120 countries</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl font-bold text-blue-800 mb-4">50K+</div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">Carefully curated for you</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl font-bold text-blue-800 mb-4">24/7</div>
              <h3 className="text-xl font-semibold mb-2">Customer Support</h3>
              <p className="text-gray-600">Always here to help</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800">Our Policies</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mt-4 mb-8"></div>
            <p className="max-w-2xl mx-auto text-gray-600">
              We believe in transparency and customer satisfaction. Here's how we ensure your shopping experience is exceptional.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="mb-16 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/4 bg-blue-900 text-white p-8 flex flex-col items-center justify-center">
                  <FaTruck className="text-5xl mb-4 text-amber-400" />
                  <h3 className="text-2xl font-bold">Shipping Policy</h3>
                </div>
                <div className="md:w-3/4 p-8">
                  <h4 className="text-xl font-semibold mb-4 text-blue-800">Fast & Reliable Delivery</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span><strong>Standard Shipping:</strong> 3-5 business days - $4.99 or FREE on orders over $50</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span><strong>Express Shipping:</strong> 1-2 business days - $9.99</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span><strong>International Shipping:</strong> 7-14 business days - calculated at checkout</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>Processing time: 1-2 business days after order confirmation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>Real-time tracking provided for all orders</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600">
                    For more details, see our full <a href="#" className="text-blue-600 hover:underline">Shipping Policy</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-16 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-3/4 p-8">
                  <h4 className="text-xl font-semibold mb-4 text-blue-800">Hassle-Free Returns</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span><strong>30-Day Return Policy:</strong> Return most items within 30 days of delivery</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span><strong>Easy Process:</strong> Initiate returns through your account or contact support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span><strong>Refund Options:</strong> Full refund to original payment method or store credit</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span><strong>Conditions:</strong> Items must be unused, in original packaging with tags attached</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      <span>Return shipping costs may apply unless item is defective or incorrect</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600">
                    For more details, see our full <a href="#" className="text-blue-600 hover:underline">Return Policy</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-16 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/4 bg-blue-700 text-white p-8 flex flex-col items-center justify-center">
                  <FaQuestionCircle className="text-5xl mb-4 text-amber-400" />
                  <h3 className="text-2xl font-bold">FAQ</h3>
                </div>
                <div className="md:w-3/4 p-8">
                  <h4 className="text-xl font-semibold mb-4 text-blue-800">Frequently Asked Questions</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <h5 className="font-bold text-lg mb-2">How do I track my order?</h5>
                      <p className="text-gray-600">
                        Once your order ships, you'll receive a confirmation email with a tracking number. You can track your order using our Order Tracker or directly with the carrier.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-lg mb-2">What payment methods do you accept?</h5>
                      <p className="text-gray-600">
                        We accept all major credit/debit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and ShopSphere Gift Cards.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-lg mb-2">Do you offer international shipping?</h5>
                      <p className="text-gray-600">
                        Yes, we ship to over 120 countries worldwide. Shipping costs and delivery times vary by destination and will be calculated at checkout.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-lg mb-2">How do I change or cancel my order?</h5>
                      <p className="text-gray-600">
                        Please contact us immediately at support@shopsphere.com or call +1 (800) 123-4567. We can modify or cancel orders within 1 hour of placement if they haven't been processed.
                      </p>
                    </div>
                  </div>
                  
                  <p className="mt-6 text-gray-600">
                    View our full <a href="#" className="text-blue-600 hover:underline">FAQ section</a> for more questions and answers.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/4 bg-blue-600 text-white p-8 flex flex-col items-center justify-center">
                  <FaLock className="text-5xl mb-4 text-amber-400" />
                  <h3 className="text-2xl font-bold">Privacy Policy</h3>
                </div>
                <div className="md:w-3/4 p-8">
                  <h4 className="text-xl font-semibold mb-4 text-blue-800">Your Privacy Matters</h4>
                  <p className="mb-4 text-gray-600">
                    At ShopSphere, we are committed to protecting your personal information and being transparent about how we collect, use, and share it.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="font-bold mb-2">Information We Collect</h5>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Contact and account information</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Payment and transaction details</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Browsing and purchase history</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold mb-2">How We Use Information</h5>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Process orders and payments</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Personalize your shopping experience</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Improve our products and services</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-amber-500 mr-2">•</span>
                          <span>Communicate with you about orders and promotions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-bold text-blue-800 mb-2">Security Measures</h5>
                    <p className="text-gray-600">
                      We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits to protect your information.
                    </p>
                  </div>
                  
                  <p className="mt-6 text-gray-600">
                    Read our full <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> for complete details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <FaHeadset className="text-5xl mx-auto mb-6 text-amber-400" />
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Our customer support team is available 24/7 to assist you with any questions or concerns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={handlecall} className="bg-amber-500 cursor-pointer hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
              Contact Support
            </button>
            <button onClick={()=>navigate("/Contact")} className="bg-transparent border-2 border-white hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-full transition duration-300">
              Live Chat
            </button>
          </div>
          <p className="mt-8 text-blue-200">
            Call us: +234 (80) 866-22565 | Email: support@shopsphere.com
          </p>
        </div>
      </section>
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-amber-400 to-orange-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                  <FaCrown className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  ShopSphere
                </h1>
              </div>
              <p className="mt-4 text-gray-400 max-w-xs">
                Premium online shopping experience since 2025.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaGlobe className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaTruck className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaUndo className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaShieldAlt className="text-xl" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© 2025 ShopSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;