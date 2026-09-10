import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plane, ArrowRight, Loader2 } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', { email, password });
        login(data.accessToken, data.user);
      } else {
        const { data } = await api.post('/auth/register', { name, email, password });
        login(data.accessToken, data.user);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-4">
      {/* Vstara Logo */}
      <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity">
        <Plane className="w-8 h-8" />
        <span className="text-2xl font-serif tracking-tight">Vstara</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
          <h2 className="text-3xl font-serif text-[#2A2A2A] mb-2">
            {isLogin ? 'Welcome back' : 'Begin your journey'}
          </h2>
          <p className="text-[#2A2A2A]/60 mb-8 font-light">
            {isLogin ? 'Enter your details to access your itineraries.' : 'Create an account to start planning.'}
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#2A2A2A] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-[#C84B31] focus:ring-1 focus:ring-[#C84B31] outline-none transition-colors bg-black/5 focus:bg-white"
                  placeholder="Alex Traveler"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-[#C84B31] focus:ring-1 focus:ring-[#C84B31] outline-none transition-colors bg-black/5 focus:bg-white"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-black/10 focus:border-[#C84B31] focus:ring-1 focus:ring-[#C84B31] outline-none transition-colors bg-black/5 focus:bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-[#C84B31] hover:bg-[#A63A25] text-white px-6 py-3.5 rounded-full font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-[#C84B31]/20 disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#2A2A2A]/60 hover:text-[#C84B31] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
