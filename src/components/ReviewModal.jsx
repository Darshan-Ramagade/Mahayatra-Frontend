import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit(rating, review);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold">Rate Your Journey</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <p className="text-gray-700 font-semibold mb-2">{booking.bus.busName}</p>
            <p className="text-sm text-gray-600">{booking.bus.from} → {booking.bus.to}</p>
          </div>

          <div>
            <p className="text-gray-700 font-semibold mb-3">How was your experience?</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-12 h-12 ${
                      star <= (hoveredRating || rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-2 font-semibold text-gray-700">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very Poor'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Share your experience (optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
              rows="4"
              placeholder="Tell us about your journey..."
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;