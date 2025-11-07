import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError, showWarning } from '../utils/toast';
import { Bus, MapPin, Calendar, Zap, Shield, Star, ArrowRight, Users, Clock, Award, User } from 'lucide-react';
import { busAPI } from '../utils/api';
import Chatbot from '../components/Chatbot';
import Modal from '../components/Modal';

function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    fetchCities();
    setTodayDate();
    checkUserLogin();
  }, []);

  const checkUserLogin = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    showSuccess('Logged out successfully!');
  };

  const fetchCities = async () => {
    try {
      const response = await busAPI.getCities();
      setCities(response.data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const setTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setDate(formattedDate);
  };

  const handleSearch = () => {
    if (!from || !to || !date) {
      showWarning('Please fill all fields');
      return;
    }

    if (from === to) {
      showWarning('From and To cities cannot be same');
      return;
    }

    setLoading(true);
    navigate(`/buses?from=${from}&to=${to}&date=${date}`);
  };

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const popularRoutes = [
    { from: 'Mumbai', to: 'Pune', duration: '3.5 hrs', price: 450 },
    { from: 'Pune', to: 'Nagpur', duration: '8 hrs', price: 650 },
    { from: 'Mumbai', to: 'Nashik', duration: '4 hrs', price: 380 },
    { from: 'Pune', to: 'Kolhapur', duration: '6 hrs', price: 520 }
  ];

  const busTypes = [
    { name: 'Shivneri AC', icon: '🚌', desc: 'Premium Volvo/Scania', color: 'from-orange-500 to-red-500', textColor: 'text-orange-600' },
    { name: 'Shivai Electric', icon: '⚡', desc: 'Eco-friendly AC', color: 'from-green-500 to-emerald-600', textColor: 'text-green-600' },
    { name: 'Shivshahi', icon: '✨', desc: 'Luxury Sleeper', color: 'from-purple-500 to-pink-500', textColor: 'text-purple-600' },
    { name: 'Parivartan', icon: '🎯', desc: 'Semi-luxury', color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-xl sticky top-0 z-50 border-b-2 border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all group-hover:scale-110">
                <Bus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  MahaYatra
                </h1>
                <p className="text-xs text-gray-600 font-medium">Maharashtra Bus Booking</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/')} className="text-gray-700 hover:text-orange-600 font-semibold transition-colors flex items-center space-x-2">
                <span>Home</span>
              </button>
              <button onClick={() => navigate('/my-bookings')} className="text-gray-700 hover:text-orange-600 font-semibold transition-colors flex items-center space-x-2">
                <span>My Bookings</span>
              </button>
              {user && user.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="text-purple-700 hover:text-purple-900 font-bold transition-colors flex items-center space-x-2">
                  <span>👨‍💼 Admin Panel</span>
                </button>
              )}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full">
                    <User className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-gray-900">{user.name}</span>
                    {user.role === 'admin' && <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full ml-2">ADMIN</span>}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-6 py-2 rounded-full font-bold hover:bg-red-600 transition-all">
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-2xl transition-all hover:scale-105 flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-4">
            <div className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-6 py-2 rounded-full font-semibold text-sm">
              <Award className="w-4 h-4" />
              <span>India's Most Trusted Bus Booking Platform</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Journey Through
            <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Maharashtra
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">Book your bus tickets in seconds. Travel smart, travel comfortable, travel safe.</p>
        </div>

        {/* Enhanced Search Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-5xl mx-auto border-4 border-orange-100 transform hover:scale-[1.02] transition-all">
          <div className="grid md:grid-cols-12 gap-4 mb-6">
            {/* From */}
            <div className="md:col-span-4 relative">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>From</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-6 h-6 text-orange-500" />
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-orange-500 focus:outline-none bg-gray-50 font-semibold text-gray-900 hover:bg-white transition-all"
                >
                  <option value="">Select city</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex items-end justify-center pb-2">
              <button
                onClick={swapCities}
                className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-3 rounded-full hover:shadow-lg transition-all hover:rotate-180 duration-500"
                title="Swap cities"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-4 relative">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>To</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-6 h-6 text-red-500" />
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-red-500 focus:outline-none bg-gray-50 font-semibold text-gray-900 hover:bg-white transition-all"
                >
                  <option value="">Select city</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="md:col-span-3 relative">
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span>Journey Date</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 w-6 h-6 text-green-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none bg-gray-50 font-semibold text-gray-900 hover:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Searching...' : 'Search Buses'}</span>
            <Bus className="w-6 h-6" />
          </button>
        </div>

        {/* Popular Routes */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">🔥 Popular Routes</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {popularRoutes.map((route, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setFrom(route.from);
                  setTo(route.to);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-orange-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="font-bold text-gray-900">{route.from}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">{route.to}</span>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{route.duration}</span>
                  </div>
                  <span className="font-bold text-orange-600">From ₹{route.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bus Types */}
        <div className="mt-20">
          <h3 className="text-4xl font-bold text-center mb-4 text-gray-900">Our Premium Fleet</h3>
          <p className="text-center text-gray-600 mb-12 text-lg">Choose from our wide range of comfortable buses</p>
          <div className="grid md:grid-cols-4 gap-8">
            {busTypes.map((bus, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-3 border-2 border-gray-100 group">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${bus.color} flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-all shadow-lg`}>
                  {bus.icon}
                </div>
                <h4 className={`font-bold text-xl mb-2 ${bus.textColor}`}>{bus.name}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{bus.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-10">
          <div className="text-center group">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all shadow-lg">
              <Zap className="w-12 h-12 text-orange-600" />
            </div>
            <h4 className="font-bold text-2xl mb-3 text-gray-900">Instant Booking</h4>
            <p className="text-gray-600 text-lg leading-relaxed">Book your seat in under 60 seconds with our lightning-fast system</p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-br from-green-100 to-green-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all shadow-lg">
              <Shield className="w-12 h-12 text-green-600" />
            </div>
            <h4 className="font-bold text-2xl mb-3 text-gray-900">Safe & Secure</h4>
            <p className="text-gray-600 text-lg leading-relaxed">100% secure payment gateway and data protection guaranteed</p>
          </div>
          <div className="text-center group">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all shadow-lg">
              <Star className="w-12 h-12 text-blue-600" />
            </div>
            <h4 className="font-bold text-2xl mb-3 text-gray-900">Best Prices</h4>
            <p className="text-gray-600 text-lg leading-relaxed">Affordable rates with no hidden charges, transparent pricing</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">MahaYatra</h3>
              </div>
              <p className="text-gray-400">Your trusted partner for bus travel across Maharashtra</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => setModalContent('about')} className="block text-gray-400 hover:text-orange-400 transition-colors">About Us</button>
                <button onClick={() => setModalContent('contact')} className="block text-gray-400 hover:text-orange-400 transition-colors">Contact</button>
                <button onClick={() => setModalContent('faq')} className="block text-gray-400 hover:text-orange-400 transition-colors">FAQ</button>
                {user && user.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="block text-gray-400 hover:text-orange-400 transition-colors">Admin Panel</button>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <div className="space-y-2">
                <button onClick={() => setModalContent('help')} className="block text-gray-400 hover:text-orange-400 transition-colors">Help Center</button>
                <button onClick={() => setModalContent('terms')} className="block text-gray-400 hover:text-orange-400 transition-colors">Terms & Conditions</button>
                <button onClick={() => setModalContent('privacy')} className="block text-gray-400 hover:text-orange-400 transition-colors">Privacy Policy</button>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact Us</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 1800-123-4567</p>
                <p>📧 support@mahayatra.com</p>
                <p>⏰ 24/7 Customer Support</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">© 2025 MahaYatra. Connecting Maharashtra, One Journey at a Time.</p>
          </div>
        </div>
      </footer>
       {/* Modals */}
       <Modal isOpen={modalContent === 'about'} onClose={() => setModalContent(null)} title="About Us">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">MahaYatra is Maharashtra's premier bus booking platform, connecting travelers across the state with safe, comfortable, and affordable bus services.</p>
          <h3 className="font-bold text-lg text-gray-900">Our Mission</h3>
          <p className="text-gray-700">To make bus travel accessible, convenient, and enjoyable for everyone in Maharashtra.</p>
          <h3 className="font-bold text-lg text-gray-900">Why Choose Us?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Wide network covering all major cities</li>
            <li>Premium fleet including Shivneri, Shivai Electric buses</li>
            <li>Secure online booking with instant confirmation</li>
            <li>24/7 customer support</li>
            <li>Best prices guaranteed</li>
          </ul>
        </div>
      </Modal>

      <Modal isOpen={modalContent === 'contact'} onClose={() => setModalContent(null)} title="Contact Support">
        <div className="space-y-6">
          <div className="bg-orange-50 p-4 rounded-xl">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Customer Support</h3>
            <p className="text-gray-700">📞 Phone: 1800-123-4567</p>
            <p className="text-gray-700">📧 Email: support@mahayatra.com</p>
            <p className="text-gray-700">⏰ Available 24/7</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <h3 className="font-bold text-lg text-gray-900 mb-2">Head Office</h3>
            <p className="text-gray-700">MahaYatra Technologies Pvt. Ltd.</p>
            <p className="text-gray-700">Baner, Pune - 411001</p>
            <p className="text-gray-700">Maharashtra, India</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <h3 className="font-bold text-lg text-gray-900 mb-2">For Business Inquiries</h3>
            <p className="text-gray-700">📧 business@mahayatra.com</p>
            <p className="text-gray-700">📞 +91-20-12345678</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalContent === 'faq'} onClose={() => setModalContent(null)} title="Frequently Asked Questions">
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-2">How do I book a ticket?</h3>
            <p className="text-gray-700">Select your from/to cities, choose date, select bus, pick seats, enter passenger details, and complete payment.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-2">Can I cancel my booking?</h3>
            <p className="text-gray-700">Yes, go to My Bookings, select your booking and click Cancel. Refunds processed in 5-7 days.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-2">What payment methods are accepted?</h3>
            <p className="text-gray-700">We accept UPI, Credit/Debit Cards, and Net Banking via secure Razorpay gateway.</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-bold text-gray-900 mb-2">How do I check my PNR status?</h3>
            <p className="text-gray-700">Login and go to My Bookings section to view all your bookings with PNR numbers.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">What documents do I need while boarding?</h3>
            <p className="text-gray-700">Carry a valid government ID proof and your booking confirmation (email or screenshot).</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalContent === 'help'} onClose={() => setModalContent(null)} title="Help Center">
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-900">How can we help you?</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-900">Booking Issues</h4>
              <p className="text-gray-700 text-sm">Having trouble booking? Contact support at 1800-123-4567</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-900">Payment Problems</h4>
              <p className="text-gray-700 text-sm">Payment not reflecting? Email us at support@mahayatra.com</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-900">Refund Status</h4>
              <p className="text-gray-700 text-sm">Refunds take 5-7 business days. Check your original payment method.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-900">Bus Delay/Cancellation</h4>
              <p className="text-gray-700 text-sm">Contact our 24/7 helpline for real-time bus status updates.</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalContent === 'terms'} onClose={() => setModalContent(null)} title="Terms & Conditions">
        <div className="space-y-4 text-gray-700">
          <p className="font-bold text-gray-900">Last updated: January 2025</p>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">1. Booking Terms</h3>
            <p>All bookings are subject to availability. Once confirmed, your booking details will be sent via email and SMS.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">2. Cancellation Policy</h3>
            <p>Cancellations can be made through My Bookings. Refunds are processed within 5-7 business days to the original payment method.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">3. User Responsibilities</h3>
            <p>Users must provide accurate information. Carry valid ID proof while boarding. Report at boarding point 15 minutes before departure.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">4. Liability</h3>
            <p>MahaYatra acts as a booking platform. Bus operators are responsible for service quality and passenger safety.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">5. Payment</h3>
            <p>All transactions are secure via Razorpay. We do not store your payment information.</p>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalContent === 'privacy'} onClose={() => setModalContent(null)} title="Privacy Policy">
        <div className="space-y-4 text-gray-700">
          <p className="font-bold text-gray-900">Effective Date: January 2025</p>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Information We Collect</h3>
            <p>We collect name, email, phone number, and payment information necessary for booking services.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">How We Use Your Data</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Process bookings and payments</li>
              <li>Send booking confirmations and updates</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Data Security</h3>
            <p>We use industry-standard encryption to protect your data. Payment information is processed securely via Razorpay.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Data Sharing</h3>
            <p>We do not sell your personal information. Data is shared only with bus operators for service fulfillment.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Your Rights</h3>
            <p>You can request data deletion or modification by contacting support@mahayatra.com</p>
          </div>
        </div>
      </Modal>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default HomePage;