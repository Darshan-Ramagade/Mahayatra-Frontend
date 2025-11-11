import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Ticket, TrendingUp, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { busAPI, bookingAPI } from '../utils/api';
import { showError, showSuccess, showWarning } from '../utils/toast';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [buses, setBuses] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddBus, setShowAddBus] = useState(false);
  const [newBus, setNewBus] = useState({
    busNumber: '',
    busName: '',
    busType: 'Shivneri',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    date: '',
    totalSeats: 40,
    price: 0,
    amenities: []
  });

  useEffect(() => {
    // Check if user is admin
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      showWarning('Please login as admin');
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      showError('Access denied! This page is only for administrators. 🚫');
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching admin stats...');
      
      // Fetch stats
      const statsResponse = await bookingAPI.getAdminStats();
      console.log('Stats response:', statsResponse.data);
      
      if (statsResponse.data.success) {
        const statsData = {
          totalBuses: statsResponse.data.data.totalBuses,
          totalBookings: statsResponse.data.data.totalBookings,
          totalRevenue: statsResponse.data.data.totalRevenue
        };
        console.log('Setting stats:', statsData);
        setStats(statsData);
        setRecentBookings(statsResponse.data.data.recentBookings || []);
      }
      
      // Fetch all buses
      const today = new Date().toISOString().split('T')[0];
      const busResponse = await busAPI.searchBuses('', '', today);
      console.log('Buses count:', busResponse.data.data?.length);
      setBuses(busResponse.data.data || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
    }
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    
    try {
      const busData = {
        ...newBus,
        availableSeats: newBus.totalSeats,
        amenities: ['AC', 'WiFi', 'Charging Point', 'Water']
      };
      
      const response = await busAPI.addBus(busData);
      if (response.data.success) {
        showSuccess('Bus added successfully! ✅');
        setShowAddBus(false);
        fetchDashboardData();
        // Reset form
        setNewBus({
          busNumber: '',
          busName: '',
          busType: 'Shivneri',
          from: '',
          to: '',
          departureTime: '',
          arrivalTime: '',
          date: '',
          totalSeats: 40,
          price: 0,
          amenities: []
        });
      }
    } catch (error) {
      console.error('Error adding bus:', error);
      showWarning('Failed to add bus. Please try again.');
    }
  };

  const cities = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Akola', 'Thane', 'Satara'];
  const busTypes = ['Shivneri', 'Shivshahi', 'Shivai Electric', 'Parivartan', 'Ordinary AC', 'Ordinary Non-AC'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-white/20 rounded-lg transition-all">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-xl">
                  <Bus className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-purple-200">Manage your bus operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold mb-2">Total Buses</p>
                <p className="text-4xl font-bold text-blue-600">{stats.totalBuses}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Bus className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold mb-2">Total Bookings</p>
                <p className="text-4xl font-bold text-green-600">{stats.totalBookings}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-2xl">
                <Ticket className="w-10 h-10 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold mb-2">Total Revenue</p>
                <p className="text-4xl font-bold text-orange-600">₹{stats.totalRevenue}</p>
              </div>
              <div className="bg-orange-100 p-4 rounded-2xl">
                <TrendingUp className="w-10 h-10 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('buses')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'buses'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Manage Buses
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Bookings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'buses' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">All Buses</h2>
              <button
                onClick={() => setShowAddBus(!showAddBus)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Bus</span>
              </button>
            </div>

            {/* Add Bus Form */}
            {showAddBus && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-green-200">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">Add New Bus</h3>
                <form onSubmit={handleAddBus} className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bus Number</label>
                    <input
                      type="text"
                      value={newBus.busNumber}
                      onChange={(e) => setNewBus({...newBus, busNumber: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="MH12AB1234"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bus Name</label>
                    <input
                      type="text"
                      value={newBus.busName}
                      onChange={(e) => setNewBus({...newBus, busName: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="Shivneri Volvo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bus Type</label>
                    <select
                      value={newBus.busType}
                      onChange={(e) => setNewBus({...newBus, busType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                    >
                      {busTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
                    <select
                      value={newBus.from}
                      onChange={(e) => setNewBus({...newBus, from: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    >
                      <option value="">Select city</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                    <select
                      value={newBus.to}
                      onChange={(e) => setNewBus({...newBus, to: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      required
                    >
                      <option value="">Select city</option>
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Departure Time</label>
                    <input
                      type="text"
                      value={newBus.departureTime}
                      onChange={(e) => setNewBus({...newBus, departureTime: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="08:00 AM"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Arrival Time</label>
                    <input
                      type="text"
                      value={newBus.arrivalTime}
                      onChange={(e) => setNewBus({...newBus, arrivalTime: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="12:00 PM"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newBus.date}
                      onChange={(e) => setNewBus({...newBus, date: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Seats</label>
                    <input
                      type="number"
                      value={newBus.totalSeats}
                      onChange={(e) => setNewBus({...newBus, totalSeats: parseInt(e.target.value), availableSeats: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      min="20"
                      max="60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={newBus.price}
                      onChange={(e) => setNewBus({...newBus, price: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                      placeholder="450"
                      min="100"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                    >
                      Add Bus
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Buses List */}
            <div className="grid gap-6">
              {buses.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-lg">
                  <Bus className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No buses found. Add your first bus!</p>
                </div>
              ) : (
                buses.map((bus) => (
                  <div key={bus._id} className="bg-white rounded-3xl shadow-lg p-6 border-2 border-gray-100 hover:border-purple-300 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-2xl">
                          <Bus className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{bus.busName}</h3>
                          <p className="text-gray-600">{bus.busNumber} • {bus.busType}</p>
                          <p className="text-sm text-gray-500 mt-1">{bus.from} → {bus.to}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Available Seats</p>
                        <p className="text-3xl font-bold text-green-600">{bus.availableSeats}/{bus.totalSeats}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-3xl font-bold text-orange-600">₹{bus.price}</p>
                      </div>

                      <div className="flex space-x-2">
                        <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div>
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-purple-100">
              <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600 text-lg mb-8 text-center">
                Manage buses, view bookings, and track your business performance all in one place.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <button
                  onClick={() => {
                    showWarning('Analytics feature coming soon! This will show detailed charts and graphs of your business performance.');
                  }}
                  className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer text-left"
                >
                  <h3 className="font-bold text-lg text-blue-900 mb-2">📊 Analytics</h3>
                  <p className="text-blue-700 text-sm">Track revenue, bookings, and performance metrics</p>
                </button>
                <button
                  onClick={() => setActiveTab('buses')}
                  className="bg-green-50 rounded-2xl p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all cursor-pointer text-left"
                >
                  <h3 className="font-bold text-lg text-green-900 mb-2">🚌 Bus Management</h3>
                  <p className="text-green-700 text-sm">Add, edit, or remove buses from your fleet</p>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="bg-orange-50 rounded-2xl p-6 border-2 border-orange-200 hover:border-orange-400 hover:shadow-xl transition-all cursor-pointer text-left"
                >
                  <h3 className="font-bold text-lg text-orange-900 mb-2">🎫 Bookings</h3>
                  <p className="text-orange-700 text-sm">View and manage all customer bookings</p>
                </button>
              </div>
            </div>

            {/* Recent Bookings */}
            {recentBookings.length > 0 && (
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h3>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-lg text-gray-900">PNR: {booking.pnr}</p>
                          <p className="text-gray-600">{booking.user?.name} • {booking.user?.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {booking.bus?.busName} • {booking.bus?.from} → {booking.bus?.to}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">₹{booking.totalAmount}</p>
                          <p className="text-sm text-gray-600">{booking.totalSeats} seat(s)</p>
                          <p className={`text-xs font-bold mt-1 ${
                            booking.status === 'Confirmed' ? 'text-green-600' : 
                            booking.status === 'Cancelled' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {booking.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">All Customer Bookings</h2>
            
            {recentBookings.length === 0 ? (
              <div className="text-center py-16">
                <Ticket className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentBookings.map((booking) => (
                  <div key={booking._id} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200 hover:shadow-xl transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-lg">
                            {booking.pnr}
                          </span>
                          <span className={`px-4 py-2 rounded-xl font-bold text-sm ${
                            booking.status === 'Confirmed' ? 'bg-green-500 text-white' : 
                            booking.status === 'Cancelled' ? 'bg-red-500 text-white' : 
                            'bg-gray-500 text-white'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-gray-900 font-bold text-lg">{booking.user?.name}</p>
                        <p className="text-gray-600">{booking.user?.email}</p>
                        <p className="text-gray-600">📞 {booking.contactPhone}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">₹{booking.totalAmount}</p>
                        <p className="text-gray-600">{booking.totalSeats} seat(s)</p>
                        <p className="text-sm text-gray-500">
                          Booked: {new Date(booking.bookingDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 mb-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Bus Details</p>
                          <p className="font-bold text-gray-900">{booking.bus?.busName}</p>
                          <p className="text-gray-600 text-sm">{booking.bus?.from} → {booking.bus?.to}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Journey Date</p>
                          <p className="font-bold text-gray-900">
                            {new Date(booking.journeyDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-700 mb-2">Passengers:</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.passengers.map((passenger, idx) => (
                          <span key={idx} className="bg-white px-4 py-2 rounded-lg border-2 border-orange-200 text-sm">
                            <span className="font-bold text-orange-600">{passenger.seatNumber}</span> - {passenger.name} ({passenger.age}y, {passenger.gender})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;