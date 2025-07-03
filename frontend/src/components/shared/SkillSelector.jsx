import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import { 
  SERVICE_CATEGORIES, 
  SKILL_TAXONOMY, 
  ALL_SKILLS, 
  POPULAR_SKILLS,
  searchSkills 
} from '../../data/skillTaxonomy';

const SkillSelector = ({ 
  selectedSkills = [], 
  onSkillsChange, 
  placeholder = "Select skills...",
  maxSelections = null,
  showCategories = true,
  showPopular = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('popular');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (buttonRef.current && isOpen) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleSkillToggle = (skill) => {
    const newSelectedSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : maxSelections && selectedSkills.length >= maxSelections
        ? selectedSkills
        : [...selectedSkills, skill];
    
    onSkillsChange(newSelectedSkills);
  };

  const removeSkill = (skillToRemove) => {
    onSkillsChange(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const getFilteredSkills = () => {
    if (searchTerm) {
      return searchSkills(searchTerm);
    }
    
    if (activeTab === 'popular') {
      return POPULAR_SKILLS;
    }
    
    if (activeTab === 'all') {
      return ALL_SKILLS;
    }
    
    return SKILL_TAXONOMY[activeTab] || [];
  };

  const filteredSkills = getFilteredSkills();

  return (
    <div className={`relative ${className}`}>
      {/* Selected Skills Display */}
      <div 
        ref={buttonRef}
        className="min-h-[42px] w-full px-3 py-2 border border-gray-600 rounded-md bg-black text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedSkills.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 bg-green-600 text-white text-xs rounded-md mr-1 mb-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSkill(skill);
                  }}
                  className="ml-1 hover:text-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown className={`absolute right-3 top-3 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] bg-gray-900 border border-gray-600 rounded-md shadow-xl max-h-80 overflow-hidden"
          style={{ 
            top: `${dropdownPosition.top + 4}px`, 
            left: `${dropdownPosition.left}px`, 
            width: `${dropdownPosition.width}px`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
          }}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Tabs */}
          {!searchTerm && (
            <div className="flex border-b border-gray-600 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {showPopular && (
                <button
                  type="button"
                  onClick={() => setActiveTab('popular')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'popular'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Popular
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All Skills
              </button>
              {showCategories && SERVICE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveTab(category)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === category
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Skills List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredSkills.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? 'No skills found' : 'No skills available'}
              </div>
            ) : (
              <div className="p-2">
                {filteredSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  const isDisabled = maxSelections && !isSelected && selectedSkills.length >= maxSelections;
                  
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => !isDisabled && handleSkillToggle(skill)}
                      disabled={isDisabled}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : isDisabled
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span>{skill}</span>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selection Limit Warning */}
          {maxSelections && selectedSkills.length >= maxSelections && (
            <div className="p-3 bg-yellow-900 border-t border-gray-600 text-yellow-300 text-xs">
              Maximum {maxSelections} skills selected
            </div>
          )}
        </div>
        , document.body
      )}
    </div>
  );
};

export default SkillSelector;
