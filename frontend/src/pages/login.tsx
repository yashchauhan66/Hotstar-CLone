import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loginUser, registerUser } from '../store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isLogin) {
    
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      }));
      
      if (loginUser.fulfilled.match(result)) {
        router.push('/');
      }
    } else {
     
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }

      const result = await dispatch(registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }));
      
      if (registerUser.fulfilled.match(result)) {
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Hotstar</h1>
          <p className="text-primary-400 mt-2">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

       
        <div className="bg-primary-200 rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
           
            {!isLogin && (
              <div>
                <label className="block text-white font-medium mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary-300 text-white placeholder-primary-500 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-primary-400 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

           
            <div>
              <label className="block text-white font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-primary-300 text-white placeholder-primary-500 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-primary-400 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

           
            <div>
              <label className="block text-white font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-primary-300 text-white placeholder-primary-500 rounded-lg py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-primary-400 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-white font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary-300 text-white placeholder-primary-500 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-primary-400 transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

           
            {!isLogin && (
              <div>
                <label className="block text-white font-medium mb-2">
                  Role
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="w-full bg-primary-300 text-white rounded-lg py-3 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:bg-primary-400 transition-all appearance-none cursor-pointer"
                  >
                    <option value="user" className="bg-primary-300">User</option>
                    <option value="admin" className="bg-primary-300">Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            {(error || formError) && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                {formError || error}
              </div>
            )}

           
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

         
          <div className="mt-6 text-center">
            <p className="text-primary-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormError('');
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'user',
                    confirmPassword: '',
                  });
                }}
                className="text-accent-500 hover:text-accent-400 font-medium ml-2 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

      
        <div className="text-center mt-6">
          <Link href="/" className="text-primary-400 hover:text-accent-500 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
