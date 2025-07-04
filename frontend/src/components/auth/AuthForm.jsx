import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Star } from 'lucide-react';
import Login from './Login';
import SignUp from './SignUp';

const AuthForm = ({ role, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setInfo('');
  };

  const themeColors = {
    client: {
      primary: 'from-blue-500/20 to-indigo-600/20',
      border: 'border-blue-400/30',
      shadow: 'shadow-blue-500/25',
      ring: 'focus:ring-blue-400/50',
      button: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      accent: 'bg-blue-500/10 border-blue-400/20 text-blue-100',
      glow: 'shadow-blue-500/30'
    },
    worker: {
      primary: 'from-emerald-500/20 to-green-600/20',
      border: 'border-emerald-400/30',
      shadow: 'shadow-emerald-500/25',
      ring: 'focus:ring-emerald-400/50',
      button: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      accent: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-100',
      glow: 'shadow-emerald-500/30'
    }
  };

  const theme = themeColors[role];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isLogin ? 'login-container' : 'signup-container'}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ 
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1]
        }}
        className={`
          ${!isLogin && role === 'worker' ? 'max-w-lg sm:max-w-xl lg:max-w-3xl' : 'max-w-sm sm:max-w-md'} 
          w-full mx-auto relative overflow-hidden
          backdrop-blur-2xl 
          bg-gradient-to-br ${theme.primary}
          border ${theme.border}
          rounded-xl 
          shadow-2xl ${theme.shadow}
          p-3 sm:p-4 md:p-6
          max-h-[95vh] overflow-y-auto
        `}
      >
        {/* Glass overlay for enhanced depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-xl pointer-events-none" />
        
        {/* Header with enhanced styling */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/20 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 text-gray-900" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-black mb-0.5 truncate">
                  {isLogin ? 'Welcome back!' : `Join as ${role === 'client' ? 'a Client' : 'a Professional'}`}
                </h2>
                <p className="text-gray-800/80 text-xs hidden sm:block">
                  {isLogin 
                    ? `Sign in to your ${role} account`
                    : `Create your ${role} account and get started`
                  }
                </p>
              </div>
            </div>
            
            {/* Role badge */}
            <div className={`
              px-2.5 py-1 rounded-full text-black text-xs font-semibold
              ${theme.accent}
              border backdrop-blur-sm
              flex items-center space-x-1 flex-shrink-0
            `}>
              {role === 'client' ? <Shield className="h-2.5 w-2.5" /> : <Star className="h-2.5 w-2.5" />}
              <span className="capitalize hidden sm:inline">{role}</span>
            </div>
          </div>

          {/* Status messages with enhanced styling */}
          {info && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-100 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span className="text-xs font-medium">{info}</span>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-100 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                <span className="text-xs font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Form Content */}
        <div className="relative z-10">
          {isLogin ? (
            <Login 
              role={role}
              theme={theme}
              onToggleMode={toggleMode}
              setError={setError}
              setLoading={setLoading}
              loading={loading}
            />
          ) : (
            <SignUp 
              role={role}
              theme={theme}
              onToggleMode={toggleMode}
              setError={setError}
              setInfo={setInfo}
              setLoading={setLoading}
              loading={loading}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthForm;
