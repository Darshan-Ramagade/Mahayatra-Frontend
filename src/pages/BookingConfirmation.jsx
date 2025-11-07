import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Download, Bus, MapPin, Calendar, User, Phone, Mail } from 'lucide-react';
import { bookingAPI } from '../utils/api';

function BookingConfirmation() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await bookingAPI.getBookingById(bookingId);
      setBooking(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      alert('Failed to load booking details');
      navigate('/');
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-500"></div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">Your ticket has been booked successfully</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bus className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">{booking.bus.busName}</h2>
                  <p className="text-green-100">{booking.bus.busType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100">PNR Number</p>
                <p className="text-2xl font-bold">{booking.pnr}</p>
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="text-xl font-bold text-gray-900">{booking.bus.from}</p>
                    <p className="text-gray-600">{booking.bus.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-red-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">To</p>
                    <p className="text-xl font-bold text-gray-900">{booking.bus.to}</p>
                    <p className="text-gray-600">{booking.bus.arrivalTime}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Journey Date</p>
                    <p className="text-lg font-bold text-gray-900">{formatDate(booking.journeyDate)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Total Passengers</p>
                    <p className="text-lg font-bold text-gray-900">{booking.totalSeats}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="border-t-2 border-gray-200 pt-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Passenger Details</h3>
              <div className="space-y-3">
                {booking.passengers.map((passenger, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 text-green-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                        {passenger.seatNumber}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{passenger.name}</p>
                        <p className="text-sm text-gray-600">{passenger.age} years • {passenger.gender}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="border-t-2 border-gray-200 pt-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-4">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.contactPhone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700 font-semibold">Total Seats:</span>
                <span className="text-gray-900 font-bold">{booking.totalSeats}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-green-200">
                <span className="text-xl font-bold text-gray-900">Total Amount Paid:</span>
                <span className="text-3xl font-bold text-green-600">₹{booking.totalAmount}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold text-green-600">{booking.status}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Payment: <span className="font-semibold text-green-600">{booking.paymentStatus}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download Ticket</span>
          </button>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            View My Bookings
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Book Another Ticket
          </button>
        </div>

        {/* Important Note */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-yellow-800 font-semibold mb-2">📌 Important Note</p>
          <p className="text-yellow-700 text-sm">
            Please carry a valid ID proof and this ticket while boarding the bus. 
            Report at the boarding point at least 15 minutes before departure.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;