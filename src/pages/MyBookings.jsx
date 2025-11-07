import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, ArrowLeft, Calendar, MapPin, User, Download, XCircle, CheckCircle } from 'lucide-react';
import { bookingAPI } from '../utils/api';
import { showSuccess, showError, showWarning } from '../utils/toast';

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkLoginAndFetchBookings();
  }, []);

  const checkLoginAndFetchBookings = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      showWarning('Please login to view bookings');
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      console.log('=== USER DATA FROM LOCALSTORAGE ===');
      console.log('Full user data:', userData);
      console.log('User ID:', userData.id);
      console.log('User _ID:', userData._id);
      
      setUser(userData);
      
      // Try both id and _id to handle different formats
      const userId = userData.id || userData._id;
      console.log('Using userId for fetch:', userId);
      
      await fetchBookings(userId);
    } catch (error) {
      console.error('Error parsing user data:', error);
      showError('Session error. Please login again.');
      navigate('/login');
    }
  };

  const fetchBookings = async (userId) => {
    try {
      console.log('=== FETCHING BOOKINGS ===');
      console.log('Requesting bookings for userId:', userId);
      
      const response = await bookingAPI.getUserBookings(userId);
      
      console.log('=== API RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Bookings array:', response.data.data);
      
      // Handle different response structures
      let bookingsData = [];
      if (response.data && response.data.data) {
        bookingsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (Array.isArray(response)) {
        bookingsData = response;
      }
      
      console.log('Extracted bookings data:', bookingsData);
      console.log('Number of bookings:', bookingsData.length);
      
      // Log each booking to check structure
      bookingsData.forEach((booking, index) => {
        console.log(`Booking ${index + 1}:`, {
          id: booking._id || booking.id,
          hasBooking: !!booking,
          hasBus: !!booking?.bus,
          busName: booking?.bus?.busName,
          status: booking?.status,
          pnr: booking?.pnr
        });
      });
      
      // Filter out bookings with null/undefined bus data
      const validBookings = bookingsData.filter(booking => {
        const isValid = booking && booking.bus && booking.bus.busName;
        if (!isValid) {
          console.warn('Invalid booking found:', booking);
        }
        return isValid;
      });
      
      console.log('=== FILTERED BOOKINGS ===');
      console.log('Valid bookings count:', validBookings.length);
      console.log('Valid bookings:', validBookings);
      
      setBookings(validBookings);
      setLoading(false);
      
      if (validBookings.length === 0 && bookingsData.length > 0) {
        console.warn('⚠️ All bookings were filtered out due to missing bus data!');
        showWarning('Some bookings have incomplete data');
      }
      
    } catch (error) {
      console.error('=== ERROR FETCHING BOOKINGS ===');
      console.error('Error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      setBookings([]);
      setLoading(false);
      
      if (error.response?.status === 401) {
        showError('Session expired. Please login again.');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 404) {
        console.log('No bookings found (404) - this is normal for new users');
        // Don't show error for 404, just empty state
      } else {
        showError('Failed to load bookings. Please try again.');
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      console.log('Cancelling booking:', bookingId);
      const response = await bookingAPI.cancelBooking(bookingId);
      
      console.log('Cancel response:', response);
      
      if (response.data.success) {
        showSuccess('Booking cancelled successfully!');
        // Refresh bookings
        const userId = user.id || user._id;
        await fetchBookings(userId);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showError('Failed to cancel booking. Please try again.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                  <p className="text-sm text-gray-500">View and manage your tickets</p>
                </div>
              </div>
            </div>
            {user && (
              <div className="flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full">
                <User className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-gray-900">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-16 text-center border-2 border-orange-100">
            <Bus className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Bookings Yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Start your journey by booking your first bus ticket!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
            >
              Book a Ticket Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
              </h2>
            </div>

            {bookings.map((booking) => {
              // Safety check - skip if booking or bus is null
              if (!booking || !booking.bus) {
                console.warn('Skipping invalid booking in render:', booking);
                return null;
              }

              return (
                <div key={booking._id || booking.id} className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 hover:border-orange-200 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl">
                        <Bus className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {booking.bus?.busName || 'N/A'}
                        </h3>
                        <p className="text-gray-600">{booking.bus?.busType || 'N/A'}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm font-semibold text-gray-700">
                            PNR: {booking.pnr || 'N/A'}
                          </span>
                          <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(booking.status)}`}>
                            {booking.status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-orange-600">
                        ₹{booking.totalAmount || 0}
                      </p>
                      <p className="text-sm text-gray-500">{booking.totalSeats || 0} seat(s)</p>
                    </div>
                  </div>

                  {/* Journey Details */}
                  <div className="grid md:grid-cols-3 gap-6 mb-6 bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-6 h-6 text-orange-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">From</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {booking.bus?.from || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.bus?.departureTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-6 h-6 text-red-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">To</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {booking.bus?.to || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.bus?.arrivalTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-6 h-6 text-green-600 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Journey Date</p>
                        <p className="font-bold text-gray-900 text-lg">
                          {formatDate(booking.journeyDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Booked: {formatDate(booking.bookingDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  {booking.passengers && booking.passengers.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-lg text-gray-900 mb-3">Passengers</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {booking.passengers.map((passenger, idx) => (
                          <div key={idx} className="bg-orange-50 rounded-xl p-4 border-2 border-orange-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                  {passenger?.seatNumber || idx + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">
                                    {passenger?.name || 'N/A'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {passenger?.age || 'N/A'} yrs • {passenger?.gender || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/confirmation/${booking._id || booking.id}`)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      <span>View Ticket</span>
                    </button>
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id || booking.id)}
                        className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;