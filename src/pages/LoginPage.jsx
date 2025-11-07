import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Mail, Lock, User, Phone, ArrowLeft, Gift } from 'lucide-react';
import { userAPI } from '../utils/api';
import { showSuccess, showError, showWarning } from '../utils/toast';


function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      showWarning('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.login({
        email: loginEmail,
        password: loginPassword
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (response.data.user.role === 'admin') {
          showSuccess('Welcome Admin! 👨‍💼');
          navigate('/admin');
        } else {
          showSuccess('Login successful! 🎉');
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerPhone || !registerPassword || !confirmPassword) {
      showWarning('Please fill all fields');
      return;
    }

    if (registerPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (registerPassword.length < 6) {
      showWarning('Password must be at least 6 characters long');
      return;
    }

    if (registerPhone.length !== 10 || !/^\d+$/.test(registerPhone)) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail)) {
      showError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.register({
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        password: registerPassword,
        referredBy: referralCode
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        showSuccess('Registration successful! Welcome to MahaYatra 🎉');
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <ArrowLeft className="w-6 h-6 text-gray-600" />
      </button>

      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-white p-3 rounded-2xl">
                <Bus className="w-10 h-10 text-orange-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">MahaYatra</h1>
                <p className="text-orange-100">Bus Booking Made Easy</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <span className="text-2xl">🎫</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Easy Booking</h3>
                  <p className="text-orange-100">Book tickets in under 60 seconds</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <span className="text-2xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Secure Payment</h3>
                  <p className="text-orange-100">100% safe and encrypted</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Instant Confirmation</h3>
                  <p className="text-orange-100">Get tickets via email & SMS</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Register Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-100">
          {/* Toggle Buttons */}
          <div className="flex space-x-2 mb-8 bg-gray-100 p-2 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Login to continue your journey</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="Enter password"
                  required
                />
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Register Form - keeping existing code but replace alerts with toast */
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600">Join us for hassle-free travel</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-600" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                  <span>Referral Code (Optional)</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="Enter friend's code"
                />
                <p className="text-xs text-gray-500 mt-1">Get 100 bonus points!</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  <span>Confirm Password</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;