import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bus, User, ArrowLeft, Armchair, Mail, Phone, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { busAPI, bookingAPI } from '../utils/api';
import { showSuccess, showError, showWarning } from '../utils/toast';

function SeatSelectionPage() {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [bus, setBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingStep, setBookingStep] = useState('seats');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [lockTimer, setLockTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingProgress, setBookingProgress] = useState(0);

  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    fetchBusDetails();

    return () => {
      if (selectedSeats.length > 0 && sessionId) {
        busAPI.unlockSeats(busId, selectedSeats, sessionId).catch(console.error);
      }
    };
  }, [busId]);

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      const response = await busAPI.getBusById(busId);
      const busData = response.data.data;
      
      if (!busData.seats || busData.seats.length === 0) {
        const generatedSeats = [];
        for (let i = 1; i <= busData.totalSeats; i++) {
          generatedSeats.push({
            seatNumber: `S${i}`,
            isBooked: false,
            isLocked: false,
            lockedBy: null,
            passengerName: '',
            passengerAge: 0,
            passengerGender: ''
          });
        }
        busData.seats = generatedSeats;
      }
      
      setBus(busData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bus:', error);
      showError('Failed to load bus details. Please try again.');
      navigate(-1);
    }
  };

  const toggleSeat = async (seat) => {
    if (seat.isBooked || (seat.isLocked && seat.lockedBy !== sessionId)) {
      showWarning('This seat is not available');
      return;
    }

    if (selectedSeats.includes(seat.seatNumber)) {
      const newSeats = selectedSeats.filter(s => s !== seat.seatNumber);
      setSelectedSeats(newSeats);
      setPassengers(passengers.filter(p => p.seatNumber !== seat.seatNumber));
      
      try {
        await busAPI.unlockSeats(busId, [seat.seatNumber], sessionId);
      } catch (error) {
        console.error('Error unlocking seat:', error);
      }
    } else {
      if (selectedSeats.length >= 6) {
        showWarning('Maximum 6 seats can be selected at once');
        return;
      }

      try {
        const response = await busAPI.lockSeats(busId, [seat.seatNumber], sessionId);
        if (response.data.success) {
          setSelectedSeats([...selectedSeats, seat.seatNumber]);
          setPassengers([...passengers, {
            seatNumber: seat.seatNumber,
            name: '',
            age: '',
            gender: 'Male'
          }]);
          
          startLockTimer();
        }
      } catch (error) {
        if (error.response?.data?.unavailableSeats) {
          showError('This seat is no longer available');
          fetchBusDetails();
        } else {
          showError('Failed to lock seat. Please try again.');
        }
      }
    }
  };

  const startLockTimer = () => {
    if (lockTimer) clearInterval(lockTimer);
    
    setTimeRemaining(180);
    
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          showWarning('Seat selection expired. Please reselect your seats.');
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setLockTimer(timer);
  };

  const handleTimeout = async () => {
    if (selectedSeats.length > 0) {
      try {
        await busAPI.unlockSeats(busId, selectedSeats, sessionId);
      } catch (error) {
        console.error('Error unlocking seats:', error);
      }
      setSelectedSeats([]);
      setPassengers([]);
      setBookingStep('seats');
      fetchBusDetails();
    }
  };

  const updatePassenger = (seatNumber, field, value) => {
    setPassengers(passengers.map(p => 
      p.seatNumber === seatNumber ? { ...p, [field]: value } : p
    ));
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      showWarning('Please select at least one seat');
      return;
    }
    setBookingStep('details');
  };

  const validateBooking = () => {
    for (let passenger of passengers) {
      if (!passenger.name || !passenger.age) {
        showError('Please fill all passenger details');
        return false;
      }
      if (passenger.age < 1 || passenger.age > 120) {
        showError('Please enter valid age');
        return false;
      }
    }

    if (!contactEmail || !contactPhone) {
      showError('Please provide contact email and phone number');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      showError('Please enter a valid email address');
      return false;
    }

    if (contactPhone.length !== 10 || !/^\d+$/.test(contactPhone)) {
      showError('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validateBooking()) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      showError('Please login to book tickets');
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setIsBooking(true);
    setBookingProgress(0);

    try {
      setBookingProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      setBookingProgress(40);
      const bookingData = {
        userId: user.id,
        busId: bus._id,
        passengers: passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age),
          gender: p.gender,
          seatNumber: p.seatNumber
        })),
        contactEmail,
        contactPhone
      };

      setBookingProgress(60);
      await new Promise(resolve => setTimeout(resolve, 300));

      setBookingProgress(80);
      const response = await bookingAPI.createBooking(bookingData);
      
      setBookingProgress(100);
      
      if (response.data.success) {
        showSuccess(`Booking successful! PNR: ${response.data.data.pnr}`);
        setTimeout(() => {
          navigate(`/confirmation/${response.data.data._id}`);
        }, 1000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setIsBooking(false);
      setBookingProgress(0);
      showError(error.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
            <Bus className="w-8 h-8 text-orange-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-semibold text-lg">Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Bus className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <p className="text-2xl text-gray-800 font-bold mb-2">Bus not found</p>
          <p className="text-gray-600 mb-6">The bus you're looking for doesn't exist</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = selectedSeats.length * bus.price;
  const timerPercentage = (timeRemaining / 180) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
      {/* Booking Progress Overlay */}
      {isBooking && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4 transform scale-100 animate-pulse">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-28 h-28 bg-gradient-to-tr from-orange-500 via-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Bus className="w-14 h-14 text-white animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-red-400 rounded-full blur-2xl opacity-40 animate-ping"></div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Processing Booking</h3>
              <p className="text-gray-500 mb-8 text-base">Please wait while we confirm your seats</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${bookingProgress}%` }}
                ></div>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{bookingProgress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-2xl shadow-lg">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{bus.busName}</h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span>{bus.from}</span>
                    <span className="text-orange-500">→</span>
                    <span>{bus.to}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{bus.busType}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Timer Badge */}
            {selectedSeats.length > 0 && timeRemaining > 0 && (
              <div className="hidden sm:flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg ${
                  timeRemaining < 60 ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}>
                  <Clock className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-lg">
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {bookingStep === 'seats' ? (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Select Your Seats</h2>
                      <p className="text-orange-100 text-sm">Choose up to 6 seats for your journey</p>
                    </div>
                    {selectedSeats.length > 0 && (
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <span className="text-2xl font-bold">{selectedSeats.length}</span>
                        <span className="text-sm ml-1">selected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-5 bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl border border-gray-200">
                    {[
                      { label: 'Available', bgClass: 'bg-white', borderClass: 'border-2 border-gray-300', iconColor: 'text-gray-700' },
                      { label: 'Selected', bgClass: 'bg-gradient-to-br from-orange-500 to-red-500', borderClass: '', iconColor: 'text-white' },
                      { label: 'Booked', bgClass: 'bg-gradient-to-br from-gray-400 to-gray-500', borderClass: '', iconColor: 'text-white' },
                      { label: 'Locked', bgClass: 'bg-gradient-to-br from-amber-400 to-yellow-500', borderClass: '', iconColor: 'text-white' }
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${item.bgClass} ${item.borderClass} rounded-xl flex items-center justify-center shadow-md`}>
                          <Armchair className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bus Layout */}
                  <div className="relative bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 p-8 rounded-3xl shadow-2xl">
                    {/* Windshield Effect */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-40 blur-md"></div>
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300 rounded-full"></div>
                    
                    {/* Driver Section */}
                    <div className="flex justify-end mb-8">
                      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-xl border-2 border-slate-600">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-5 h-5" />
                        </div>
                        <span>Driver</span>
                      </div>
                    </div>

                    {/* Seats Grid */}
                    {bus.seats && bus.seats.length > 0 ? (
                      <div className="grid grid-cols-4 gap-4">
                        {bus.seats.map((seat, idx) => {
                          const isLockedByOther = seat.isLocked && seat.lockedBy !== sessionId;
                          const isSelected = selectedSeats.includes(seat.seatNumber);
                          const isAisle = idx % 4 === 1;
                          
                          return (
                            <div key={seat.seatNumber} className={isAisle ? 'mr-6' : ''}>
                              <button
                                onClick={() => toggleSeat(seat)}
                                disabled={seat.isBooked || isLockedByOther}
                                className={`relative w-full h-20 rounded-2xl font-bold text-sm transition-all duration-300 transform ${
                                  seat.isBooked
                                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed shadow-md'
                                    : isLockedByOther
                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 cursor-not-allowed shadow-md'
                                    : isSelected
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl scale-110 ring-4 ring-orange-300/50'
                                    : 'bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 shadow-lg border-2 border-gray-300 hover:border-orange-400 hover:scale-105 hover:shadow-xl'
                                } flex flex-col items-center justify-center group`}
                              >
                                <Armchair className={`w-6 h-6 mb-1 ${
                                  seat.isBooked || isLockedByOther ? 'text-white' :
                                  isSelected ? 'text-white' : 'text-gray-700 group-hover:text-orange-600'
                                } ${isSelected ? 'animate-bounce' : ''}`} />
                                <span className={`text-xs font-extrabold ${
                                  seat.isBooked || isLockedByOther || isSelected ? 'text-white' : 'text-gray-800'
                                }`}>{seat.seatNumber}</span>
                                
                                {isSelected && (
                                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                
                                {seat.isBooked && (
                                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-400">
                        <Armchair className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold">No seats available</p>
                      </div>
                    )}
                  </div>

                  {/* Mobile Timer */}
                  {selectedSeats.length > 0 && timeRemaining > 0 && (
                    <div className="sm:hidden mt-6">
                      <div className={`flex items-center justify-between p-4 rounded-2xl shadow-lg ${
                        timeRemaining < 60 ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-red-500'
                      }`}>
                        <span className="text-white font-semibold">Time Remaining</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-white" />
                          <span className="font-bold text-white text-xl">
                            {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <User className="w-7 h-7" />
                    Passenger Details
                  </h2>
                  <p className="text-orange-100 text-sm mt-1">Fill in the details for all passengers</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-200 shadow-md">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      Contact Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-600" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-orange-600" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all"
                          placeholder="10-digit mobile"
                          maxLength="10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="space-y-4">
                    {passengers.map((passenger, idx) => (
                      <div key={passenger.seatNumber} className="border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-3">
                            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                              {idx + 1}
                            </div>
                            Passenger {idx + 1}
                          </h3>
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-md">
                            {passenger.seatNumber}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                            <input
                              type="text"
                              value={passenger.name}
                              onChange={(e) => updatePassenger(passenger.seatNumber, 'name', e.target.value)}
                              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all"
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Age *</label>
                            <input
                              type="number"
                              value={passenger.age}
                              onChange={(e) => updatePassenger(passenger.seatNumber, 'age', e.target.value)}
                              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all"
                              placeholder="Age"
                              min="1"
                              max="120"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Gender *</label>
                            <select
                              value={passenger.gender}
                              onChange={(e) => updatePassenger(passenger.seatNumber, 'gender', e.target.value)}
                              className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all bg-white"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl sticky top-28 border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <h3 className="text-xl font-bold">Booking Summary</h3>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm pb-4 border-b-2 border-gray-100">
                    <span className="text-gray-600 font-semibold">Selected Seats</span>
                    <span className="font-bold text-2xl text-gray-900">{selectedSeats.length}</span>
                  </div>
                  
                  {selectedSeats.length > 0 && (
                    <div className="pb-4 border-b-2 border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map(seat => (
                          <span key={seat} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-md">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-base pb-4 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Price per seat</span>
                    <span className="font-bold text-gray-900">₹{bus.price}</span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-2xl border-2 border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {bookingStep === 'seats' ? (
                  <button
                    onClick={handleProceed}
                    disabled={selectedSeats.length === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                  >
                    Proceed to Details →
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => setBookingStep('seats')}
                      className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-200 hover:shadow-lg transition-all"
                    >
                      ← Back to Seats
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      {isBooking ? 'Processing...' : 'Confirm Booking ✓'}
                    </button>
                  </div>
                )}

                {/* Additional Info */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>24/7 customer support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelectionPage;