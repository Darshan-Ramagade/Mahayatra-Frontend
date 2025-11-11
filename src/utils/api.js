import axios from 'axios';

const API_URL = 'https://mahayatra-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to format date (YYYY-MM-DD)
const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// Helper function to get valid booking date range (30-day rolling window)
const getValidBookingDateRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thirtyDaysFromToday = new Date(today);
  thirtyDaysFromToday.setDate(thirtyDaysFromToday.getDate() + 30);
  thirtyDaysFromToday.setHours(23, 59, 59, 999);
  
  return {
    startDate: formatDate(today),
    endDate: formatDate(thirtyDaysFromToday),
    startDateTime: today,
    endDateTime: thirtyDaysFromToday
  };
};

// Bus APIs
export const busAPI = {
  searchBuses: (from, to, date) => {
    // Validate date is within 30-day booking window
    const { startDate, endDate } = getValidBookingDateRange();
    const searchDate = formatDate(date);
    
    if (searchDate < startDate || searchDate > endDate) {
      return Promise.reject(new Error(
        `Bookings are only available within the next 30 days (${startDate} to ${endDate})`
      ));
    }
    
    return api.get(`/buses/search?from=${from}&to=${to}&date=${searchDate}`);
  },
  
  getBusById: (id) => 
    api.get(`/buses/${id}`),
  
  getCities: () => 
    api.get('/buses/cities/list'),
  
  getAvailableDates: (from, to) =>
    api.get(`/buses/available-dates?from=${from}&to=${to}`),
  
  getBookingWindow: () => {
    const range = getValidBookingDateRange();
    return Promise.resolve({
      data: {
        success: true,
        startDate: range.startDate,
        endDate: range.endDate,
        daysAvailable: 30
      }
    });
  },
  
  addBus: (busData) =>
    api.post('/buses/add', busData),
  
  lockSeats: (busId, seatNumbers, sessionId) =>
    api.post(`/buses/${busId}/lock-seats`, { seatNumbers, sessionId }),
  
  unlockSeats: (busId, seatNumbers, sessionId) =>
    api.post(`/buses/${busId}/unlock-seats`, { seatNumbers, sessionId })
};

// User APIs
export const userAPI = {
  register: (userData) => 
    api.post('/users/register', userData),
  
  login: (credentials) => 
    api.post('/users/login', credentials),
  
  getProfile: (userId) => 
    api.get(`/users/profile/${userId}`),
  
  // Forgot Password APIs
  forgotPassword: (data) => 
    api.post('/users/forgot-password', data),
  
  verifyOTP: (data) => 
    api.post('/users/verify-otp', data),
  
  resetPassword: (data) => 
    api.post('/users/reset-password', data)
};

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData) => 
    api.post('/bookings/create', bookingData),
  
  getBookingById: (id) => 
    api.get(`/bookings/${id}`),
  
  getUserBookings: (userId) => 
    api.get(`/bookings/user/${userId}`),
  
  cancelBooking: (id) => 
    api.put(`/bookings/cancel/${id}`),
  
  updatePayment: (id, paymentData) => 
    api.put(`/bookings/payment/${id}`, paymentData),
  
  getAdminStats: () =>
    api.get('/bookings/admin/stats'),
  
  submitReview: (bookingId, rating, review) =>
    api.post(`/bookings/${bookingId}/review`, { stars: rating, review }),

  getBusReviews: (busId) =>
    api.get(`/bookings/bus/${busId}/reviews`)
};

export { formatDate, getValidBookingDateRange };
export default api;