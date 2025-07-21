import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/authService';
import { User, Phone, MapPin, Briefcase, IndianRupee, Mail, Lock, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import InputField from './InputField';
import SkillSelector from '../shared/SkillSelector';

const SignUp = ({ role, theme, onToggleMode, setError, setInfo, setLoading, loading }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  // Check for mobile and tablet screen sizes (use 2-step process for screens smaller than desktop)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280); // Changed from 768 to 1280 to include tablets
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSkillsChange = (skills) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  // Mobile step navigation
  const nextStep = () => {
    if (currentStep === 1 && role === 'worker') {
      // Validate basic info before moving to skills
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  // Get total steps for worker signup on mobile and tablet
  const getTotalSteps = () => {
    if (role === 'client') return 1;
    if (role === 'worker' && isMobile) return 2;
    return 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate worker skills
      if (role === 'worker' && formData.skills.length === 0) {
        throw new Error('Please select at least one professional skill');
      }

      // Register
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        location: formData.location,
      };

      if (role === 'worker') {
        userData.skills = formData.skills;
        userData.experience = parseInt(formData.experience) || 0;
        userData.hourlyRate = parseFloat(formData.hourlyRate) || 0;
      }

      let response;
      if (role === 'client') {
        response = await authService.registerClient(userData);
      } else {
        response = await authService.registerWorker(userData);
      }

      // setInfo('Registration successful! Please check your email to verify your account.');
      setInfo('Registration successful! Please login with your credentials.');
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
      setCurrentStep(1);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicFields = () => (
    <>
      <InputField
        icon={User}
        name="name"
        placeholder="Enter your full name"
        required
        value={formData.name}
        onChange={handleChange}
        theme={theme}
      />
      
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
        placeholder="Create a strong password"
        required
        value={formData.password}
        onChange={handleChange}
        theme={theme}
      />
      
      <InputField
        icon={Lock}
        name="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        required
        value={formData.confirmPassword}
        onChange={handleChange}
        theme={theme}
      />
      
      <InputField
        icon={Phone}
        name="phone"
        type="tel"
        placeholder="Phone number (optional)"
        value={formData.phone}
        onChange={handleChange}
        theme={theme}
      />
      
      <InputField
        icon={MapPin}
        name="location"
        placeholder="City, State (optional)"
        value={formData.location}
        onChange={handleChange}
        theme={theme}
      />
    </>
  );

  const renderWorkerSkillsFields = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-[#737373] tracking-wide mb-1.5">
            Professional Skills <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-[#737373] mb-3">
            Select skills that match your expertise. This helps clients find you for relevant projects.
          </p>
          <div className="relative z-50">
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
            <p className="text-xs text-red-400 mt-1.5">Please select at least one skill</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            icon={Briefcase}
            label="Experience (years)"
            name="experience"
            type="number"
            min="0"
            max="50"
            placeholder="0"
            value={formData.experience}
            onChange={handleChange}
            theme={theme}
          />
          
          <InputField
            icon={IndianRupee}
            label="Hourly Rate (INR)"
            name="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            placeholder="25.00"
            value={formData.hourlyRate}
            onChange={handleChange}
            theme={theme}
          />
        </div>

        {/* Enhanced Skills Preview */}
        {formData.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`
              mt-4 p-4 rounded-lg 
              bg-gradient-to-br ${theme.primary}
              border ${theme.border}
              backdrop-blur-sm
            `}
          >
            <h4 className="text-xs font-semibold text-black mb-3 flex items-center space-x-1.5">
              <Star className="h-3 w-3" />
              <span>Selected Skills</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {formData.skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    inline-flex items-center px-2.5 py-1 
                    bg-gradient-to-r ${theme.button}
                    text-white text-xs rounded-full
                    shadow-lg ${theme.glow}
                    font-medium
                  `}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
            <p className="text-xs text-gray-900 mt-2">
              {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Mobile and tablet step indicator */}
      {role === 'worker' && isMobile && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-black mb-2">
            <span>Step {currentStep} of {getTotalSteps()}</span>
            <span>{currentStep === 1 ? 'Basic Info' : 'Skills & Experience'}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full bg-gradient-to-r ${theme.button} transition-all duration-300`}
              style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {role === 'worker' && isMobile ? (
          // Mobile and tablet multi-step layout for workers
          <div className="w-full">
            <AnimatePresence mode="wait">
              {currentStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {renderBasicFields()}
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {renderWorkerSkillsFields()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : role === 'worker' && !isMobile ? (
          // Desktop two-column layout for workers
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderBasicFields()}
            </div>
            <div className="space-y-4">
              {renderWorkerSkillsFields()}
            </div>
          </div>
        ) : (
          // Single column layout for clients
          <div className="space-y-4">
            {renderBasicFields()}
          </div>
        )}

        {/* Submit Button with Mobile and Tablet Navigation */}
        <div className="pt-4">
          {role === 'worker' && isMobile ? (
            // Mobile and tablet navigation buttons
            <div className="flex gap-3">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex-1 py-3 px-5 
                    bg-white/10 border border-white/30
                    text-black font-semibold text-base
                    rounded-lg 
                    focus:outline-none focus:ring-2 ${theme.ring} focus:ring-offset-2 focus:ring-offset-transparent
                    transition-all duration-300 ease-in-out
                    flex items-center justify-center space-x-2
                  `}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </motion.button>
              )}
              
              {currentStep < getTotalSteps() ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex-1 py-3 px-5 
                    bg-gradient-to-r ${theme.button}
                    text-white font-semibold text-base
                    rounded-lg 
                    shadow-lg ${theme.glow}
                    focus:outline-none focus:ring-2 ${theme.ring} focus:ring-offset-2 focus:ring-offset-transparent
                    transition-all duration-300 ease-in-out
                    flex items-center justify-center space-x-2
                  `}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={loading || (role === 'worker' && formData.skills.length === 0)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex-1 py-3 px-5 
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
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </span>
                </motion.button>
              )}
            </div>
          ) : (
            // Standard submit button for desktop and clients
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </span>
            </motion.button>
          )}
        </div>

        {/* Toggle Mode */}
        <div className="text-center pt-3">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-xs text-[#737373] hover:text-white transition-colors duration-200 font-medium"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
