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
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (buttonRef.current && isOpen && !isMobile) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // Decide whether to show dropdown above or below
        const showAbove = spaceBelow < 300 && spaceAbove > spaceBelow;
        
        setDropdownPosition({
          top: showAbove ? rect.top + window.scrollY - 320 : rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          maxHeight: showAbove ? Math.min(spaceAbove - 10, 300) : Math.min(spaceBelow - 10, 300)
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
  }, [isOpen, isMobile]);

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

  const renderDropdownContent = () => (
    <div className="bg-gray-900 border border-gray-600 rounded-md shadow-xl">
      {/* Search Input */}
      <div className="p-3 border-b border-gray-600">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            autoFocus={!isMobile}
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
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
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
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
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
      <div 
        className="overflow-y-auto"
        style={{ 
          maxHeight: isMobile ? '60vh' : dropdownPosition.maxHeight || '300px' 
        }}
      >
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

      {/* Mobile close button */}
      {isMobile && (
        <div className="p-3 border-t border-gray-600">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Done ({selectedSkills.length} selected)
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Selected Skills Display */}
      <div 
        ref={buttonRef}
        className="min-h-[42px] w-full px-3 py-2 border border-gray-600 rounded-md bg-black text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedSkills.length === 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{placeholder}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            {selectedSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-600 text-white mr-1"
              >
                {skill}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSkill(skill);
                  }}
                  className="ml-1 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedSkills.length > 3 && (
              <span className="text-xs text-gray-400">
                +{selectedSkills.length - 3} more
              </span>
            )}
            <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        isMobile ? (
          // Mobile: Full-screen overlay
          createPortal(
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
              <div 
                ref={dropdownRef}
                className="w-full max-h-[90vh] bg-gray-900 rounded-t-lg"
              >
                <div className="p-4 border-b border-gray-600 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Select Skills</h3>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                {renderDropdownContent()}
              </div>
            </div>,
            document.body
          )
        ) : (
          // Desktop: Positioned dropdown
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-50"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              }}
            >
              {renderDropdownContent()}
            </div>,
            document.body
          )
        )
      )}
    </div>
  );
};

export default SkillSelector;
