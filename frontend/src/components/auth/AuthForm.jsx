import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';
import { Mail, Lock, ArrowLeft, User, Phone, MapPin, Briefcase, DollarSign } from 'lucide-react';
import SkillSelector from '../shared/SkillSelector';

const AuthForm = ({ role, onBack }) => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    skills: [],
    experience: '',
    hourlyRate: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate worker skills
      if (!isLogin && role === 'worker' && formData.skills.length === 0) {
        throw new Error('Please select at least one professional skill');
      }
      let response;
      if (isLogin) {
        // Login
        const credentials = {
          email: formData.email,
          password: formData.password,
        };
        if (role === 'client') {
          response = await authService.loginClient(credentials);
          login(response.data.client, response.data.token, 'client');
        } else {
          response = await authService.loginWorker(credentials);
          login(response.data.worker, response.data.token, 'worker');
        }
        // Navigate to appropriate dashboard
        navigate(role === 'client' ? '/client-dashboard' : '/worker-dashboard');
      } else {
        // Register
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          location: formData.location,
        };
        if (role === 'worker') {
          userData.skills = formData.skills; // Already an array from SkillSelector
          userData.experience = parseInt(formData.experience) || 0;
          userData.hourlyRate = parseFloat(formData.hourlyRate) || 0;
        }
        if (role === 'client') {
          response = await authService.registerClient(userData);
        } else {
          response = await authService.registerWorker(userData);
        }
        setInfo('Registration successful! Please check your email to verify your account.');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          location: '',
          skills: [],
          experience: '',
          hourlyRate: '',
        });
        return;
      }
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

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSkillsChange = (skills) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Reset form data when switching modes
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      location: '',
      skills: [],
      experience: '',
      hourlyRate: '',
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLogin ? 'login-container' : 'signup-container'}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ 
          duration: 0.4,
          ease: "easeInOut"
        }}
        className={`${!isLogin && role === 'worker' ? 'max-w-5xl' : 'max-w-md'} w-full space-y-8 p-8 rounded-xl shadow-lg relative overflow-visible
          ${role === 'client'
            ? 'bg-gradient-to-b from-black to-[#1A1C3E]'
            : 'bg-gradient-to-b from-black to-[#051F20]'
          }`}
      >
        {/* Gradient border effect for top and left */}
        <div className={`pointer-events-none absolute top-0 left-0 w-full h-full z-20`}>
          {/* Top border */}
          <div className={`absolute top-0 left-0 h-[3px] w-1/2 rounded-tl-xl
            ${role === 'client'
              ? 'bg-gradient-to-r from-blue-900 via-blue-900 to-transparent'
              : 'bg-gradient-to-r from-green-900 via-green-900 to-transparent'
            }`} />
          {/* Left border */}
          <div className={`absolute top-0 left-0 w-[3px] h-1/2 rounded-tl-xl
            ${role === 'client'
              ? 'bg-gradient-to-b from-blue-900 via-blue-900 to-transparent'
              : 'bg-gradient-to-b from-green-900 via-green-900 to-transparent'
            }`} />
          {/* Corner */}
          <div className={`absolute top-0 left-0 w-4 h-4 rounded-tl-xl
            ${role === 'client'
              ? 'bg-gradient-to-br from-blue-900 via-blue-900 to-transparent'
              : 'bg-gradient-to-br from-green-900 via-green-900 to-transparent'
            }`} />
        </div>

        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </button>
          <h2 className="ml-4 text-2xl font-bold text-gray-400">
            {isLogin ? 'Welcome back!' : `Join as a ${role}`}
          </h2>
        </div>

        {info && <div className="bg-blue-100 text-blue-800 p-2 rounded mb-2">{info}</div>}
        {error && <div className="bg-red-100 text-red-800 p-2 rounded mb-2">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative">
          <>
            {/* Two-column layout for worker signup */}
            {!isLogin && role === 'worker' ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[700px] grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">
                      Basic Information
                    </h3>
                    
                    <div>
                      <label htmlFor="name" className="sr-only">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                          } focus:border-transparent`}
                          placeholder="Full Name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="sr-only">Email address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                          } focus:border-transparent`}
                          placeholder="Email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="sr-only">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                          } focus:border-transparent`}
                          placeholder="Password"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                          } focus:border-transparent`}
                          placeholder="Confirm Password"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="sr-only">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                          } focus:border-transparent`}
                          placeholder="Phone Number (optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="location" className="sr-only">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="location"
                          name="location"
                          type="text"
                          value={formData.location}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                            role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                          } focus:border-transparent`}
                          placeholder="City, State (optional)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
                          Years of Experience
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="experience"
                            name="experience"
                            type="number"
                            min="0"
                            max="50"
                            value={formData.experience}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">
                          Hourly Rate (USD)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="hourlyRate"
                            name="hourlyRate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.hourlyRate}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="25.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Skills & Expertise */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">
                      Skills & Expertise
                    </h3>
                    
                    <div className="relative z-50">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Professional Skills *
                      </label>
                      <p className="text-sm text-gray-400 mb-4">
                        Select skills that match your expertise. This helps clients find you for relevant jobs.
                      </p>
                      <div className="relative">
                        <SkillSelector
                          selectedSkills={formData.skills}
                          onSkillsChange={handleSkillsChange}
                          placeholder="Select your professional skills..."
                          showCategories={true}
                          showPopular={true}
                          className="w-full"
                        />
                      </div>
                      {formData.skills.length === 0 && (
                        <p className="text-xs text-red-400 mt-2">Please select at least one skill</p>
                      )}
                    </div>

                    {/* Skills Preview */}
                    {formData.skills.length > 0 && (
                      <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Selected Skills Preview:</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Single column layout for client signup and login
              <div className="space-y-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="sr-only">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                        } focus:border-transparent`}
                        placeholder="Full Name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                      } focus:border-transparent`}
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                      } focus:border-transparent`}
                      placeholder="Password"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required                    value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                        } focus:border-transparent`}
                          placeholder="Confirm Password"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="sr-only">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"                    value={formData.phone}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                        } focus:border-transparent`}
                          placeholder="Phone Number (optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="location" className="sr-only">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="location"
                          name="location"
                          type="text"                    value={formData.location}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                        } focus:border-transparent`}
                          placeholder="City, State (optional)"
                        />
                      </div>
                    </div>

                    {role === 'worker' && (
                      <div className="space-y-6 pt-4 border-t border-gray-700">
                        <div className="relative z-50">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Professional Skills *
                          </label>
                          <p className="text-sm text-gray-400 mb-4">
                            Select skills that match your expertise. This helps clients find you for relevant jobs.
                          </p>
                          <div className="relative">
                            <SkillSelector
                              selectedSkills={formData.skills}
                              onSkillsChange={handleSkillsChange}
                              placeholder="Select your professional skills..."
                              showCategories={true}
                              showPopular={true}
                              className="w-full"
                            />
                          </div>
                          {formData.skills.length === 0 && (
                            <p className="text-xs text-red-400 mt-2">Please select at least one skill</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-gray-300 mb-2">
                              Years of Experience
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                id="experience"
                                name="experience"
                                type="number"
                                min="0"
                                max="50"
                                value={formData.experience}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="0"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-300 mb-2">
                              Hourly Rate (USD)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                id="hourlyRate"
                                name="hourlyRate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.hourlyRate}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="25.00"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  role === 'client' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  role === 'client' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-gray-400 hover:text-white"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthForm;