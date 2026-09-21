import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../lib/axios';
import { Plane, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, signupSchema as registerSchema } from '../schemas/authSchema';
import { FieldError } from '../components/FieldError';
import { PasswordStrength } from '../components/PasswordStrength';
import { LandingBackgroundScene } from '../components/LandingBackgroundScene';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: '',
    } as any
  });

  const onSubmit = async (data: any) => {
    setServerError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email: data.email, password: data.password });
        login(res.data.accessToken, res.data.user);
        toastSuccess('Welcome back!');
      } else {
        const res = await api.post('/auth/register', { name: data.name, email: data.email, password: data.password });
        login(res.data.accessToken, res.data.user);
        toastSuccess('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Something went wrong';
      setServerError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-4 relative z-0">
      <LandingBackgroundScene />
      {/* Yatra Setu Logo */}
      <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-[#2A2A2A] hover:opacity-80 transition-opacity">
        <Plane className="w-8 h-8" />
        <span className="text-2xl font-serif tracking-tight">Yatra Setu</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
          <h2 className="text-3xl font-serif text-[#2A2A2A] mb-2">
            {isLogin ? 'Welcome back' : 'Begin your journey'}
          </h2>
          <p className="text-[#2A2A2A]/60 mb-8 font-light">
            {isLogin ? 'Enter your details to access your itineraries.' : 'Create an account to start planning.'}
          </p>

          {serverError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-[#2A2A2A] mb-1.5">Full Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-colors bg-black/5 focus:bg-white ${
                    errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-black/10 focus:border-[#C84B31] focus:ring-[#C84B31]'
                  }`}
                  placeholder="Alex Traveler"
                />
                <FieldError error={errors.name?.message as string} />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-1.5">Email</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-colors bg-black/5 focus:bg-white ${
                  errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-black/10 focus:border-[#C84B31] focus:ring-[#C84B31]'
                }`}
                placeholder="alex@example.com"
              />
              <FieldError error={errors.email?.message as string} />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2A2A2A] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-4 py-3 rounded-xl border focus:ring-1 outline-none transition-colors bg-black/5 focus:bg-white pr-12 ${
                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-black/10 focus:border-[#C84B31] focus:ring-[#C84B31]'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError error={errors.password?.message as string} />
              {!isLogin && (
                <PasswordStrength 
                  password={watch('password')} 
                  userInputs={[watch('name'), watch('email')].filter(Boolean)} 
                />
              )}
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
            {isLogin && (
              <button
                type="button"
                onClick={() => { setIsLogin(false); reset(); setServerError(''); }}
                className="w-full mt-4 bg-white border-2 border-[#C84B31] text-[#C84B31] hover:bg-gray-50 px-6 py-3.5 rounded-full font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-sm"
              >
                Create New Account
              </button>
            )}
            {!isLogin && (
               <button
                type="button"
                onClick={() => { setIsLogin(true); reset(); setServerError(''); }}
                className="w-full mt-4 bg-white border-2 border-[#C84B31] text-[#C84B31] hover:bg-gray-50 px-6 py-3.5 rounded-full font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-sm"
              >
                Already have an account? Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
