import React from 'react';

const InputField = ({ 
  icon: Icon, 
  label, 
  type = "text", 
  name, 
  placeholder, 
  required = false, 
  min, 
  max, 
  step, 
  className = "", 
  value, 
  onChange, 
  theme 
}) => (
  <div className="space-y-1">
    {label && (
      <label htmlFor={name} className="block text-xs font-medium text-black tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
    )}
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none z-10">
        <Icon className="h-3.5 w-3.5 text-black font-bold" />
      </div>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={`
          block w-full pl-8 pr-2.5 py-2 
          bg-white/5 
          border border-white 
          rounded-lg 
          text-black placeholder-black font-bold
          focus:outline-none focus:ring-2 ${theme.ring} 
          focus:border-transparent 
          focus:bg-white/10
          transition-all duration-300 ease-in-out
          hover:border-white hover:bg-white/8
          text-xs font-medium
          ${className}
        `}
        placeholder={placeholder}
      />
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  </div>
);

export default InputField;
