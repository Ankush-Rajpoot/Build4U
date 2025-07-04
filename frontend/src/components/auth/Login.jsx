import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { Mail, Lock } from 'lucide-react';
import InputField from './InputField';

const Login = ({ role, theme, onToggleMode, setError, setLoading, loading }) => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const credentials = {
        email: formData.email,
        password: formData.password,
      };
      
      let response;
      if (role === 'client') {
        response = await authService.loginClient(credentials);
        login(response.data.client, response.data.token, 'client');
      } else {
        response = await authService.loginWorker(credentials);
        login(response.data.worker, response.data.token, 'worker');
      }
      
      // Navigate to appropriate dashboard
      navigate(role === 'client' ? '/client-dashboard' : '/worker-dashboard');
    } catch (error) {
      if (error.response?.data?.message?.includes('verify your email')) {
        setError('Please verify your email before logging in.');
      } else {
        setError(error.response?.data?.message || error.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        icon={Mail}
        name="email"
        type="email"
        placeholder="Enter your email address"
        required
        value={formData.email}
        onChange={handleChange}
        theme={theme}
      />

      <InputField
        icon={Lock}
        name="password"
        type="password"
        placeholder="Enter your password"
        required
        value={formData.password}
        onChange={handleChange}
        theme={theme}
      />

      {/* Submit Button */}
      <div className="pt-4">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full py-3 px-5 
            bg-gradient-to-r ${theme.button}
            text-white font-semibold text-base
            rounded-lg 
            shadow-lg ${theme.glow}
            focus:outline-none focus:ring-2 ${theme.ring} focus:ring-offset-2 focus:ring-offset-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-300 ease-in-out
            relative overflow-hidden
          `}
        >
          {loading && (
            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <span className={loading ? 'opacity-0' : 'opacity-100'}>
            {loading ? 'Signing In...' : 'Sign In'}
          </span>
        </motion.button>
      </div>

      {/* Toggle Mode */}
      <div className="text-center pt-3">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-xs text-black hover:text-white transition-colors duration-200 font-medium"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </form>
  );
};

export default Login;
