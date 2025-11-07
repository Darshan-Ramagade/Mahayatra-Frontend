import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { busAPI } from '../utils/api';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm MahaYatra AI Assistant. I can help you find buses, check PNR, or answer any booking questions!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const extractCities = (text) => {
    const cities = ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati'];
    const found = cities.filter(city => text.toLowerCase().includes(city.toLowerCase()));
    return found.length >= 2 ? [found[0], found[1]] : null;
  };

  const isSearchQuery = (text) => {
    const lower = text.toLowerCase();
    return (lower.includes('bus') || lower.includes('available') || lower.includes('find')) && 
           (lower.includes('from') || lower.includes('to') || extractCities(text));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages([...messages, userMsg]);
    const userQuestion = input;
    setInput('');
    setLoading(true);

    try {
      if (isSearchQuery(userQuestion)) {
        const cities = extractCities(userQuestion);
        
        if (cities && cities.length === 2) {
          const today = new Date().toISOString().split('T')[0];
          const response = await busAPI.searchBuses(cities[0], cities[1], today);
          
          if (response.data.data && response.data.data.length > 0) {
            const buses = response.data.data;
            let reply = `Found ${buses.length} buses from ${cities[0]} to ${cities[1]} today:\n\n`;
            
            buses.slice(0, 5).forEach((bus, idx) => {
              reply += `${idx + 1}. ${bus.busName} (${bus.busType})\n`;
              reply += `   Departure: ${bus.departureTime} | Arrival: ${bus.arrivalTime}\n`;
              reply += `   Price: ₹${bus.price} | Available: ${bus.availableSeats} seats\n\n`;
            });
            
            reply += buses.length > 5 ? `\nShowing first 5 results. Search on homepage to see all!` : `\nReady to book? Search on homepage!`;
            
            setMessages(prev => [...prev, { text: reply, sender: 'bot' }]);
          } else {
            setMessages(prev => [...prev, { 
              text: `No buses found from ${cities[0]} to ${cities[1]} today. Try another date!`, 
              sender: 'bot' 
            }]);
          }
        } else {
          setMessages(prev => [...prev, { 
            text: "Please specify both cities. Example: 'Show buses from Mumbai to Pune'", 
            sender: 'bot' 
          }]);
        }
      } else {
        const response = getSmartResponse(userQuestion);
        setTimeout(() => {
          setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
        }, 500);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, having trouble. Call 1800-123-4567", 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getSmartResponse = (input) => {
    const lower = input.toLowerCase();
    
    if (lower.includes('book') || lower.includes('how')) {
      return "To book:\n1. Select cities & date\n2. Choose bus\n3. Pick seats\n4. Enter details\n5. Pay\n\nGo to homepage to start!";
    }
    if (lower.includes('pnr') || lower.includes('status')) {
      return "Check PNR: Login → My Bookings. Also sent via email!";
    }
    if (lower.includes('cancel') || lower.includes('refund')) {
      return "Cancel: My Bookings → Select → Cancel. Refund in 5-7 days.";
    }
    if (lower.includes('payment')) {
      return "We accept UPI, Cards, Net Banking. 100% secure via Razorpay.";
    }
    if (lower.includes('contact') || lower.includes('support')) {
      return "24/7 Support:\n📞 1800-123-4567\n📧 support@mahayatra.com";
    }
    
    return "I can help with:\n• Find buses\n• Check PNR\n• Booking help\n• Cancellation\n• Support\n\nWhat do you need?";
  };

  const handleQuickReply = (reply) => {
    setInput(reply);
    setTimeout(() => handleSend(), 100);
  };

  const quickReplies = [
    'Buses Mumbai to Pune',
    'How to book?',
    'Check PNR',
    'Contact support'
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-orange-200">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6" />
              <div>
                <h3 className="font-bold">MahaYatra Assistant</h3>
                <p className="text-xs text-orange-100">Live search</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-orange-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}>
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t">
            <p className="text-xs text-gray-500 mb-2">Try:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply)}
                  disabled={loading}
                  className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-full focus:border-orange-500 focus:outline-none text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;