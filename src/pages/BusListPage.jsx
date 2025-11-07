import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bus, Clock, MapPin, Armchair, Zap, Wifi } from 'lucide-react';
import { busAPI } from '../utils/api';

function BusListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  useEffect(() => {
    searchBuses();
  }, []);

  const searchBuses = async () => {
    try {
      setLoading(true);
      const response = await busAPI.searchBuses(from, to, date);
      setBuses(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch buses. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBusTypeColor = (type) => {
    const colors = {
      'Shivneri': 'from-orange-500 to-red-500',
      'Shivshahi': 'from-purple-500 to-pink-500',
      'Shivai Electric': 'from-green-500 to-emerald-600',
      'Parivartan': 'from-blue-500 to-cyan-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              MahaYatra
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">From</p>
                  <p className="font-bold text-gray-900">{from}</p>
                </div>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-xs text-gray-500">To</p>
                  <p className="font-bold text-gray-900">{to}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-bold text-gray-900">{formatDate(date)}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all"
            >
              Modify Search
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching buses...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : buses.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
            <Bus className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <p className="text-yellow-800 text-lg font-semibold">No buses found for this route</p>
            <p className="text-yellow-600 mt-2">Try different cities or dates</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {buses.length} {buses.length === 1 ? 'Bus' : 'Buses'} Available
            </h2>
            {buses.map((bus) => (
              <div key={bus._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getBusTypeColor(bus.busType)} flex items-center justify-center`}>
                        <Bus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{bus.busName}</h3>
                        <p className="text-sm text-gray-500">{bus.busNumber} • {bus.busType}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8 mt-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{bus.departureTime}</p>
                        <p className="text-sm text-gray-500">{bus.from}</p>
                      </div>
                      <div className="flex-1 flex items-center">
                        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                        <Clock className="w-5 h-5 text-gray-400 mx-2" />
                        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{bus.arrivalTime}</p>
                        <p className="text-sm text-gray-500">{bus.to}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {bus.amenities.map((amenity, idx) => (
                        <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-center border-l-2 border-gray-200 pl-6">
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-orange-600">₹{bus.price}</p>
                      <p className="text-sm text-gray-500">per seat</p>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 text-green-600">
                        <Armchair className="w-5 h-5" />
                        <span className="font-semibold">{bus.availableSeats} seats</span>
                      </div>
                      <p className="text-xs text-gray-500">available</p>
                    </div>
                    <button
                      onClick={() => navigate(`/seats/${bus._id}`)}
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
                    >
                      Select Seats
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BusListPage;